var Cache        = require('./cache');
var DBConnection = require('./db-connection');
var async        = require('async');
var hash         = require('object-hash');




/**
 * Obtem os regisros da table pela PK fornecida.
 *
 * @param tableName Nome da tabela.
 * @param pk PK da valor para a chave da tabela ({col: valor}).
 * @param callback Callback
 */
function getRecords(tableName, pk, callback) {
    var query = 'SELECT * FROM ' + tableName + ' WHERE 1=1 ';

    for (var k in pk) {
        query += ' AND ' + k + ' = ' + "'" + pk[k] +  "'";
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
    var insert = ['INSERT INTO ', tableName, ' ('].concat([meta.colsNames.join(', '), ') VALUES (']);

    var values = [];

    meta.colsNames.forEach(function(col) {
        if (record[col] == null) {
            values.push('NULL');
        } else {
            values.push("'" + record[col] + "'");
        }
    });

    insert.push(values.join(', '));
    insert.push(');');

    var str = insert.join('');

    console.log(str);

    callback && callback(null, str);
}

function dumpRecord(tableName, meta, fks, record, callback) {
    var dumpFKs = [];

    var recHash = hash(record);

    if (Cache.get(recHash) != null) {
        console.log('-- Skip ' + tableName + ': ' + meta.pk.map(function(pk) { return pk + ' => ' + record[pk]; }).join(' / '));
        callback();
        return;
    }

    Cache.set(recHash, true);

    if (fks != null) {
        fks.forEach(function(fk) {
            var filter = {};

            fk.cols.forEach(function(reg) {
                filter[reg.pk] = record[reg.fk];
            });

            dumpFKs.push(function(tbl, fil) {
                return function(cb) {
                    getRecords(tbl, fil, function(err, rows) {
                        dumpRecords(fk.table, rows, cb);
                    });
                };
            }(fk.table, filter));
        });
    }

    async.parallel(dumpFKs.concat([encodeRecord.bind(null, tableName, meta, record)]), callback);
}

function dumpRecords(tableName, records, callback) {
    async.parallel([
        conn.getMeta.bind(conn, tableName),
        conn.getFKs.bind(conn, tableName)
    ], function(err, result) {
        if (err) throw err;

        //console.log('-- Dumping records of ', tableName);

        var meta = result[0],
            fks  = result[1];

        async.map(records, dumpRecord.bind(null, tableName, meta, fks), callback);
    });
}

var conn;

module.exports = {
    init: function(cfg) {
        config = cfg;

        conn = DBConnection.create(config);

        conn.connect();
    },

    load: function() {

    },

    dump: function(entities, callback) {
        entities.forEach(function(entity) {
            conn.query('select * from ' + entity.table + ' ' + entity.limit, function(err, rows) {
                dumpRecords(entity.table, rows, function() {
                    console.log('-- Fim');
                    conn.end();
                });
            });
        });
    }
}
