# db-dumper

[![Join the chat at https://gitter.im/tarcisiojr/db-dumper](https://badges.gitter.im/tarcisiojr/db-dumper.svg)](https://gitter.im/tarcisiojr/db-dumper?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Ferramenta utilitária para extrair dados da base a partir de um registro origem mantendo a integridade referencial.

Para utilizá-la necessário primeiramente instalar as dependências.

```
npm install
```

Após instalada as dependencias executar o seguinte comando:

```
node main.js -t table_a -H 127.0.0.1 -P 3306 -d test -u root -p root -r
```

## Uso:

```
node main -h

Usage: main [options]

  Options:

    -h, --help                               output usage information
    -V, --version                            output the version number
    -t, --tables [tables]                    Table name
    -l, --limit [limit]                      Condition to limite results of table
    -q, --query [query]                      Query
    -s, --source [source]                    Path of the JSON config file source
    -r, --force-references [depth]           References
    -o, --output <outputfile>                Name of output file
    -e, --encoder <json|sql|replace|update>  Name of encoder
    -H, --host <host>                        Database host
    -P, --port <port>                        Database port
    -d, --database <database>                Database schema
    -u, --user <user>                        Database username
    -p, --password <password>                Database password
    -c, --max-conn-limit []                  Database max limit of parallel connections
```
