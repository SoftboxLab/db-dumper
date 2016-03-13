var mysql = require('mysql');
var fs    = require('fs');
var Cache = require('./cache');

module.exports = {
    create: function(cfg) {
        var conn = null;

        return {
            connect: function() {
                conn = mysql.createConnection(cfg);

                conn.connect();
            },

            query: function(query, params, callback) {
                //console.log('Query: ' + query);

                if (params && params.length > 0) {
                    conn.query(query, params, callback);
                    return;
                }

                conn.query(query, callback);
            },

            queryFile: function(fileName, params, callback) {
                var self = this;

                fs.readFile('./queries/mysql/' + fileName + '.sql', function (err, data) {
                    if (err) throw err;

                    self.query(data + '', params || [], callback);
                });
            },

            end: function() {
                conn.end();
            },

            getReferences: function(tableName, callback) {
                var refs = Cache.get('db-refs-' + tableName);

                if (refs != null) {
                    callback(null, refs);
                    return;
                }

                this.queryFile('get-references', [tableName, cfg.database], function (err, result) {
                    if (err) {
                        console.log(err);
                        throw err;
                    }

                    callback && callback(null, result.map(function(ele) { return ele.table_name; }));
                });
            },

            getFKs: function(tableName, callback) {
                var fks = Cache.get('db-fk-' + tableName);

                if (fks != null) {
                    callback(null, fks);
                    return;
                }

                this.queryFile('get-table-fks', [tableName, cfg.database], function groupFKs(err, result) {
                    if (err) throw err;

                    var last = null,
                        fks  = [],
                        fk   = null;

                    result.forEach(function(ele) {
                        if (ele['fk_name'] != last) {
                            if (fk != null) {
                                fks.push(fk);
                            }

                            fk = {
                                table: ele['fk_table'],
                                cols: []
                            };
                        }

                        fk.cols.push({fk: ele['col_name'], pk: ele['fk_column']});
                    });

                    if (fk != null) {
                        fks.push(fk);
                    }

                    Cache.set('db-fk-' + tableName, fks);

                    callback && callback(null, fks);
                });
            },

            getMeta: function(tableName, callback) {
                var meta = Cache.get('db-meta-' + tableName);

                if (meta != null) {
                    callback(null, meta);
                    return;
                }

                this.queryFile('get-table-meta', [tableName, cfg.database], function(err, rows) {
                    if (err) throw err;

                    var meta = {
                        cols: {},
                        pk: [],
                        colsNames: []
                    };

                    rows.forEach(function(row) {
                        meta.colsNames.push(row['field']);

                        if (row['key'] == 'PRI') {
                            meta.pk.push(row['field']);
                        }

                        meta.cols[row['field']] = {
                            type:        row['type'],
                            nullable:    row['null'] != 'NO',
                            col_default: row['col_default'],
                            extra:       row['extra']
                        };
                    });

                    Cache.set('db-meta-' + tableName, meta);

                    callback && callback(null, meta);
                });
            },

            toStr: function(tableName, meta, record, col) {
                if (record[col] == null) {
                    return 'NULL';
                }

                switch (meta.cols[col].type) {
                    case 'datetime':
                    case 'timestamp':
                        return "'" + new Date(record[col])
                            .toISOString()
                            .replace(/T/, ' ')
                            .replace(/\..+/, '') + "'";

                    case 'date':
                        return "'" + new Date(record[col])
                            .toISOString()
                            .replace(/T.*$/, '') + "'";
                }

                return "'" + record[col] + "'";
            }
        };
    }
};
