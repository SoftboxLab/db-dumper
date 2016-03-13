var dumper  = require('./dumper');
var program = require('commander');

function toList(val) {
    return val.split(',').map(function(ele) { return ele.replace(/^\s*|\s*$/g, ''); });
}

/*
db-dumper --table pedidos_venda --where
*/

program
  .version('0.0.1')
  // .option('-p, --peppers', 'Add peppers')
  // .option('-P, --pineapple', 'Add pineapple')
  // .option('-b, --bbq-sauce', 'Add bbq sauce')
  .option('-t, --tables [tables]', 'Table name', toList, [])
  .option('-l, --limit [limit]', 'Condition to limite results of table', toList, [])
  .option('-q, --query [query]', 'Query')
  .option('-H, --host <host>',          'Database host')
  .option('-P, --port <port>',          'Database port')
  .option('-d, --database <database>',  'Database schema')
  .option('-u, --user <user>',          'Database username')
  .option('-p, --password <passwrd>',   'Database password')
  .parse(process.argv);

if (program.tables.length == 0) {
    console.error('Informe a tabela a ser pesquisada');
    process.exit(1);
}

if (!program.host || !program.port || !program.database || !program.user || !program.password) {
    console.error('Informe os dados para conexão com o banco de dados.');
    process.exit(1);
}

var entities = [];

for (var i = 0; i < program.tables.length; i++) {
    var limit = program.limit[i] ? program.limit[i] : 'where 1=1';

    if (program.query) {
        limit = null;
    }

    entities.push({
        table: program.tables[i],
        query: program.query || null,
        limit: limit
    });
}

dumper.init({
    host: program.host,
    port: program.port,
    database: program.database,
    user: program.user,
    password: program.password
});

dumper.dump(entities);
