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
