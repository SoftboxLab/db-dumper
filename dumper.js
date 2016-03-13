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
     * Converte o registro fornecido em texto.
     *
     * @param tableName Nome da tabela o qual o registro foi carregado.
     * @param meta Meta dados da tabela.
     * @param record Registro que ser convertido em texto ({col1: valor1, col2: valor2, ...., coln: valorn});
     * @param callback Callback
     */
    function encodeRecord(tableName, meta, record, callback) {
        encoder(conn, tableName, meta, record, function(err, data) {
            output(data, callback);
        });
    }

    function dumpRecord(tableName, forceReferences, meta, fks, record, callback) {
        var dumpFKs = [];

        var recHash = hash(record);

        if (Cache.get(recHash) != null) {
            console.log('-- Skip ' + tableName + ': ' + meta.pk.map(function(pk) { return pk + ' => ' + record[pk]; }).join(' / '));
            callback();
            return;
        }

        Cache.set(recHash, true);

        var references = []

        if (forceReferences > 0) {
            forceReferences--;

            console.log('-- Forcing...');
            references.push(function(callback) {
                conn.getReferences(tableName, function(err, refs) {
                    var fncsRefs = [];

                    //console.log(' -- Refs: ' + refs.join(', '));

                    async.map(refs, function(refTable, callback) {
                        console.log('-- Getting fks: ' + refTable);

                        conn.getFKs(refTable, function(err, fks) {
                            var ret = [];

                            fks.forEach(function(fk) {
                                if (fk.table != tableName) {
                                    return;
                                }

                                var filter = {};

                                fk.cols.forEach(function(reg) {
                                    filter[reg.fk] = record[reg.pk];
                                });

                                ret.push({table: refTable, filter: filter});
                            });

                            callback(null, ret);
                        });
                    }, function(err, refTables) {
                        var refs = [];

                        refTables.forEach(function(ele) {
                            refs = refs.concat(ele);
                        });

                        refs = refs.map(function(ele) {
                            return function(cb) {
                                getRecords(ele.table, ele.filter, function(err, rows) {
                                    dumpRecords(ele.table, forceReferences, rows, cb);
                                });
                            };
                        });

                        async.parallel(refs, function() {
                            callback(null);
                        });
                    });
                });
            });
        }


        if (fks != null) {
            fks.forEach(function(fk) {
                var filter = {};

                fk.cols.forEach(function(reg) {
                    filter[reg.pk] = record[reg.fk];
                });

                dumpFKs.push(function(tbl, fil) {
                    return function(cb) {
                        getRecords(tbl, fil, function(err, rows) {
                            dumpRecords(fk.table, forceReferences, rows, cb);
                        });
                    };
                }(fk.table, filter));
            });
        }

        async.parallel(
            [].concat(dumpFKs)
              .concat(references)
              .concat([ encodeRecord.bind(null, tableName, meta, record) ]),
            callback);
    }

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
