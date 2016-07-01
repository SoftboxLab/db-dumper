var DBDumper = require('./dumper');
var encoders = require('./encoders');
var program  = require('commander');
var info     = require('./package.json');

function toList(val) {
    return val.split(',').map(function(ele) { return ele.replace(/^\s*|\s*$/g, ''); });
}

var encodersNames = Object.keys(encoders).join('|');

program
  .version(info.version)
  .option('-t, --tables [tables]',                  'Table name', toList, [])
  .option('-l, --limit [limit]',                    'Condition to limite results of table', toList, [])
  .option('-q, --query [query]',                    'Query')
  .option('-s, --source [source]',                  'Path of the JSON config file source')
  .option('-r, --force-references [depth]',         'References', parseInt, 0)
  .option('-o, --output <outputfile>',              'Name of output file')
  .option('-e, --encoder <' + encodersNames + '>',  'Name of encoder', new RegExp('^(' + encodersNames + ')$', 'ig'), 'sql')
  .option('-m, --meta [source]',                    'Name of the JSON meta file source')

  .option('-H, --host <host>',          'Database host')
  .option('-P, --port <port>',          'Database port')
  .option('-d, --database <database>',  'Database schema')
  .option('-u, --user <user>',          'Database username')
  .option('-p, --password <passwrd>',   'Database password')

  .parse(process.argv);

if (program.source) {
    try {
        program = require(program.source);

    } catch (err) {
        console.error('O caminho do arquivo informado não é acessível ou não existe.');
        process.exit(1);
    }
}

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
        limit: limit,
        forceReferences: program.forceReferences || 0
    });
}

console.log('-- Dump params');
console.log('-- Date...: ', new Date());
console.log('-- Encoder: ', program.encoder || sql);
console.log('-- Output.: ', program.output || 'console');

var dumper = new DBDumper({
    host: program.host,
    port: program.port,
    database: program.database,
    user: program.user,
    password: program.password,
    metaData: program.meta
}, program.encoder, program.output);

dumper.dump(entities, function(err) {
    if (err) throw err;
});
