module.exports = {
    json: function(conn, tableName, meta, record, callback) {
        var str = JSON.stringify(record);

        callback && callback(null, str);
    },

    sql: function(conn, tableName, meta, record, callback) {
        var insert = ['INSERT INTO ', tableName, ' ('].concat([meta.colsNames.join(', '), ') VALUES (']);

        var values = [];

        meta.colsNames.forEach(function(col) {
            if (record[col] == null) {
                values.push('NULL');
            } else {
                switch (meta.cols[col].type) {
                    case 'datetime':
                    case 'timestamp':
                        var dt = new Date(record[col])
                            .toISOString()
                            .replace(/T/, ' ')
                            .replace(/\..+/, '');

                        values.push("'" + dt + "'");
                        break;

                    case 'date':
                        var dt = new Date(record[col])
                            .toISOString()
                            .replace(/T.*$/, '');

                        values.push("'" + dt + "'");
                        break;

                    default:
                        values.push("'" + record[col] + "'");
                }
            }
        });

        insert.push(values.join(', '));
        insert.push(');');

        var str = insert.join('');

        callback && callback(null, str);
    }
};
