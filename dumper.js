var Cache        = require('./cache');
var DBConnection = require('./db-connection');
var encoders     = require('./encoders');

var async        = require('async');
var hash         = require('object-hash');
var fs           = require('fs');

function DBDumper(config, encoderName, outputFile) {
    var conn = DBConnection.create(config);
    conn.connect();

    encoderName = (encoderName || 'sql').toLowerCase();

    var encoder = !encoders[encoderName] ? encoders['sql'] : encoders[encoderName];
    var output  = function(data, callback) { console.log(data); callback && callback(null); };

    if (outputFile) {
        output = function(data, callback) {
            fs.appendFile(outputFile, data + '\n', callback);
        }
    }

    /**
     * Obtem os regisros da tabela pelos dados do filtro ({col1: valor1 ... coln: valorn}) fornecido.
     *
     * @param tableName Nome da tabela.
     * @param filter Filtro dos registros tabela ({col: valor}).
     * @param callback Callback
     */
    function getRecords(tableName, filter, callback) {
        var query = 'SELECT * FROM ' + tableName + ' WHERE 1=1 ';

        for (var k in filter) {
            query += ' AND ' + k + ' = ' + "'" + filter[k] +  "'";
        }

        conn.query(query, callback);
    }

    /**
     * Converte o registro fornecido em texto de acordo com o metodo escolhido nas configuracoes.
     *
     * @param tableName Nome da tabela o qual o registro sera transformado em texto.
     * @param meta Meta dados da tabela.
     * @param record Registro que sera convertido em texto ({col1: valor1, col2: valor2, ...., coln: valorn});
     * @param callback Callback
     */
    function encodeRecord(tableName, meta, record, callback) {
        encoder(conn, tableName, meta, record, function(err, data) {
            output(data, callback);
        });
    }



    /**
     * Inicia o processo de conversao do registro fornecido em texto e seus relacionamentos.
     *
     * @param  {string} tableName       Nome da tabela o qual o registro pertence.
     * @param  {int} forceReferences    Forca a carregar as referencias relacionadas com a tabela fornecida.
     * @param  {object} meta            Meta dados da tabela fornecida.
     * @param  {object} fks             Meta dados das FKs da tabela fornecida.
     * @param  {object} record          Registro que sera convertido em texto.
     * @param  {function} callback      Funcao de callback.
     */
    function dumpRecord(tableName, forceReferences, meta, fks, record, callback) {
        var dumpFKs = [];

        var recHash = hash(record);

        // Ja gerou o registro fornecido?
        if (Cache.get(recHash) != null) {
            console.log('-- Skip ' + tableName + ': ' + meta.pk.map(function(pk) { return pk + ' => ' + record[pk]; }).join(' / '));
            callback();
            return;
        }

        // Marcando registro como visitado.
        Cache.set(recHash, true);

        var references = []

        if (forceReferences > 0) {
            console.log('-- Forcing...');

            // Buscando as referencias - tabelas many to many.
            references.push(dumpReferences.bind(null, tableName, --forceReferences, meta, fks, record));
        }

        async.parallel(
            [] // Dump das foreign keys da tabela
              .concat(createDumpFKs(tableName, forceReferences, meta, fks, record))

               // Dump das tabelas que relacionam coma tabela (many to many)
              .concat(references)

              // Convertendo registro em texto.
              .concat([ encodeRecord.bind(null, tableName, meta, record) ]),

            callback);
    }


    /**
     * Realiza do dump das tabelas que relacionam com a tabela fornecida.
     *
     * @param  {string} tableName    Nome da tabela.
     * @param  {int} forceReferences Indica se sera realizado o dump das referencias das referencias.
     * @param  {object} meta         Meta informacoes da tabela fornecida.
     * @param  {object} fks          FKs da tabela fornecida.
     * @param  {object} record       Registro o qual serao buscados os registros relacionados.
     * @param  {function} callback   Callback.
     *
     */
    function dumpReferences(tableName, forceReferences, meta, fks, record, callback) {
        conn.getReferences(tableName, function(err, refs) {
            var fncsRefs = [];

            async.map(refs, function(refTable, callback) {
                console.log('-- Getting fks: ' + refTable);

                conn.getFKs(refTable, function(err, fks) {
                    var ret = fks.filter(function(fk) { return fk.table == tableName; })
                        .map(function(fk) {
                            var filter = fk.cols.reduce(function(filter, reg) {
                                filter[reg.fk] = record[reg.pk];

                                return filter;
                            }, {});

                            return {table: refTable, filter: filter};
                        });

                    callback(null, ret);
                });
            }, function(err, refTables) {
                var refs = refTables
                    .reduce(function(prev, ele) { return prev.concat(ele); }, [])
                    .map(function(ele) {
                        return function(cb) {
                            getRecords(ele.table, ele.filter, function(err, rows) {
                                dumpRecords(ele.table, forceReferences, rows, cb);
                            });
                        };
                    });

                async.parallel(refs, callback);
            });
        });
    }


    /**
     * createDumpFKs - description
     *
     * @param  {type} tableName       description
     * @param  {type} forceReferences description
     * @param  {type} meta            description
     * @param  {type} fks             description
     * @param  {type} record          description
     * @return {type}                 description
     */
    function createDumpFKs(tableName, forceReferences, meta, fks, record) {
        if (fks == null) {
            return [];
        }

        return fks.map(function(fk) {
            // Filtro, select com as FKs na tabela de referencia.
            var filter = fk.cols.reduce(function(prev, reg) {
                prev[reg.pk] = record[reg.fk];

                return prev;
            }, {});

            return function(cb) {
                getRecords(fk.table, filter, function(err, rows) {
                    dumpRecords(fk.table, forceReferences, rows, cb);
                });
            };
        });
    }


    /**
     * dumpRecords - description
     *
     * @param  {type} tableName       description
     * @param  {type} forceReferences description
     * @param  {type} records         description
     * @param  {type} callback        description
     * @return {type}                 description
     */
    function dumpRecords(tableName, forceReferences, records, callback) {
        async.parallel([
            conn.getMeta.bind(conn, tableName),
            conn.getFKs.bind(conn, tableName)
        ], function(err, result) {
            if (err) throw err;

            //console.log('-- Dumping records of ', tableName);

            var meta = result[0],
                fks  = result[1];

            async.map(records, dumpRecord.bind(null, tableName, forceReferences, meta, fks), callback);
        });
    }


    /**
     * Seleciona os registros da tabela fornecida e inicia o processo de dump dos registros.
     *
     * @param  {object} entity     Objeto com as informacoes da tabela o qual os registros serao convertidos em texto.
     * @param  {function} callback Callback
     *
     */
    function queryAndDump(entity, callback) {
        conn.query(entity.query ? entity.query : 'select * from ' + entity.table + ' ' + entity.limit, function(err, rows) {
            if (err) throw err;

            dumpRecords(entity.table, entity.forceReferences, rows, callback);
        });
    }

    this.dump = function(entities, callback) {
        async.map(entities, queryAndDump, function() {
            conn.end();

            callback && callback(null);
        });
    }
}

module.exports = DBDumper;
