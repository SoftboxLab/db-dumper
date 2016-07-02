# db-dumper

[![Join the chat at https://gitter.im/tarcisiojr/db-dumper](https://badges.gitter.im/tarcisiojr/db-dumper.svg)](https://gitter.im/tarcisiojr/db-dumper?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Ferramenta utilitária para extrair dados da base a partir de um registro origem mantendo a integridade referencial.

## Pré-requisitos
Para a utilização do DBDumper é necessário ter instalado o nodejs e o gerenciador de pacotes NPM.

## Instalação
Para realizar a instalação, é necessário clonar o projeto e então instalar as dependências do NPM.

```
$ git clone https://github.com/SoftboxLab/db-dumper.git
$ cd db-dumper
$ npm install
```

## Execução
Para executar o DBDumper, alguns parâmetros são necessários como
* Usuário - Usuário utilizado para se conectar ao banco de dados
* Senha - Senha do usuário para se conectar ao banco de dados
* Host - Endereço do banco de dados

Exemplo:
```
node main.js -t table_a -H 127.0.0.1 -P 3306 -d test -u root
```

## Parâmetros linha de comando
Todos os parâmetros podem ser encontrados digitando ```node main.js --help```.

| Parâmetro | Tipo | Descrição | Opcional |
|-----------|------|-----------|----------|
|**-t** | string  | Define uma ou mais tabelas como ponto de partida da extração de dados. Se mais de uma tabela, separar por vírgula (não usar espaço). Ex.: ```-t usuarios``` | Sim |
|**-l** | string  | Define uma ou mais condições where (ou limit) na(s) tabela(s). Se mais de uma condição, separar por vírgula. Ex.: ```-l "where id_usuario = 1"``` | Sim |
|**-q** | string  | Define a query que será o ponto de partida da extração de dados | Sim |
|**-s** | string  | Define o arquivo que será utilizado para realizar a extração. Ex.: ```-s source-example.json``` | Sim |
|**-r** | integer | Se definido, tenta aumentar em 1 nível a profundidade da busca. Ex.: ```-r 1``` | Sim |
|**-o** | string  | Define o nome do arquivo para onde será redirecionado a saída do script | Sim |
|**-e** | string  | Define o tipo de encoder utilizado para gerar o script. Atualmente conta apenas com suporte para SQL | Sim |
|**-m** | string  | Define o caminho para os metadados da sua tabela. Utilizado para quando o banco não possui chaves estrangeiras | Sim |
|**-H** | string  | Endereço do banco de dados. Ex.: ```-H localhost``` ou ```-H 127.0.0.1``` | Não |
|**-P** | integer | Porta utilizada para realizar o acesso com o banco. Ex.: ```-P 3306``` para mysql/mariaDB. | Não |
|**-d** | string  | Nome do banco de dados na qual será realizada a extração dos dados. Ex.: ```-d teste``` | Não |
|**-u** | string  | Nome de usuário utilizado para realizar a conexão com o banco de dados. Ex.: ```-u root``` | Não |
|**-p** | string  | Senha utilizada para realizar a conexão com o banco de dados. Ex.: ```-p root``` | Sim |