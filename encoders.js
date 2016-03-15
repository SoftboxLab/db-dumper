module.exports = {
    json: function(conn, tableName, meta, record, callback) {
        var str = JSON.stringify(record);

        callback && callback(null, str);
    },

    sql: function(conn, tableName, meta, record, callback) {
        var insert = ['INSERT INTO ', tableName, ' ('].concat([meta.colsNames.join(', '), ') VALUES (']);

        // Convertendo os valores das colunas do registro (record).
        var values = meta.colsNames.map(conn.toStr.bind(conn, tableName, meta, record));

        insert.push(values.join(', '));
        insert.push(');');

        var str = insert.join('');

        callback && callback(null, str);
    },

    replace: function(conn, tableName, meta, record, callback) {
        var insert = ['REPLACE INTO ', tableName, ' ('].concat([meta.colsNames.join(', '), ') VALUES (']);

        // Convertendo os valores das colunas do registro (record).
        var values = meta.colsNames.map(conn.toStr.bind(conn, tableName, meta, record));

        insert.push(values.join(', '));
        insert.push(');');

        var str = insert.join('');

        callback && callback(null, str);
    },

    update: function() {
        var insert = ['INSERT INTO ', tableName, ' ('].concat([meta.colsNames.join(', '), ') VALUES (']);

        // Convertendo os valores das colunas do registro (record).
        var values = meta.colsNames.map(conn.toStr.bind(conn, tableName, meta, record));

        insert.push(values.join(', '));
        insert.push(');');

        var str = insert.join('');

        callback && callback(null, str);
    }
};
