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

## Exemplos
Segue exemplo da relação:
![Relacion](https://raw.githubusercontent.com/SoftboxLab/db-dumper/issue3-simular-relacionamentos/images/db%2Bdumper.png)

**SQL criação relação**
```sql
create table usuarios (
	id_usuario int not null primary key auto_increment,
	nome varchar(25) not null,
	data_criacao datetime not null default now(),
	data_alteracao datetime null default null
);

insert into usuarios (id_usuario, nome) values
(1, 'William Okano'),
(2, 'Leonardo'),
(3, 'Cristiano');

create table pedidos (
	id_pedido int not null primary key auto_increment,
	id_usuario_criacao int not null,
	data_criacao datetime null default now(),
	data_alteracao datetime null default null,
	constraint fk_pedidos_usuarios foreign key (id_usuario_criacao) references usuarios (id_usuario)
);

insert into pedidos (id_pedido, id_usuario_criacao) values
(1, 1), (2, 1), (3, 1), (4, 2), (5, 2), (6, 1), (7, 3);
```

### Extrair o pedido 1
Ao extrair o pedido 1 deve-se também extrair o usuário 1, caso contrário violaremos a integridade do banco.

```node main.js -H 127.0.0.1 -P 3306 -u root -d teste -t "pedidos" -l " where id_pedido = 1" -o dump.sql```

A saída deverá ser algo semelhante ao script abaixo:
```sql
INSERT INTO pedidos (id_pedido, id_usuario_criacao, data_criacao, data_alteracao) VALUES ('1', '1', '2016-07-02 02:28:08', NULL);
INSERT INTO usuarios (id_usuario, nome, data_criacao, data_alteracao) VALUES ('1', 'William Okano', '2016-07-02 02:28:08', NULL);
```

### Extrair apenas o usuário 1
Comando:
```node main.js -H 127.0.0.1 -P 3306 -u root -d teste -t "usuarios" -l " where id_usuario = 1" -o dump.sql```

Saída:
```sql
INSERT INTO usuarios (id_usuario, nome, data_criacao, data_alteracao) VALUES ('1', 'William Okano', '2016-07-02 02:28:08', NULL);
```

### Extrair o usuário 1 e todos os registros que apontem para o usuário 1
Neste nosso exemplo, a única tabela que aponta para usuários é a tabela de pedidos, logo, ao extrair o usuário 1 com a opção ```-r 1``` deverá vir também todos os pedidos realizados pelo usuário 1.

Muito cuidado ao utilizar o parâmetro **-r** pois utilizar altos valores neste caso pode levar a gerar um dump da base de dados inteira, o que não é intenção desta aplicação.

Comando:
```node main.js -H 127.0.0.1 -P 3306 -u root -d teste -t "usuarios" -l " where id_usuario = 1" -o dump.sql -r 1```

Saída:
```sql
INSERT INTO usuarios (id_usuario, nome, data_criacao, data_alteracao) VALUES ('1', 'William Okano', '2016-07-02 02:28:08', NULL);
INSERT INTO pedidos (id_pedido, id_usuario_criacao, data_criacao, data_alteracao) VALUES ('1', '1', '2016-07-02 02:28:08', NULL);
INSERT INTO pedidos (id_pedido, id_usuario_criacao, data_criacao, data_alteracao) VALUES ('3', '1', '2016-07-02 02:28:08', NULL);
INSERT INTO pedidos (id_pedido, id_usuario_criacao, data_criacao, data_alteracao) VALUES ('6', '1', '2016-07-02 02:28:08', NULL);
INSERT INTO pedidos (id_pedido, id_usuario_criacao, data_criacao, data_alteracao) VALUES ('2', '1', '2016-07-02 02:28:08', NULL);
```

##Utilizando o DBDumper em bancos de dados sem chaves estrangeiras
O DBDumper baseia-se nas chaves estrangeiras para descobrir a árvore de tabelas e registros que deverão ser exportados, logo utilizar um banco sem chaves estrangeiras pode levar a dados inconsistentes na extração.

Caso o seu banco não possua chaves estrangeiras ainda sim é possível realizar a extração utilizando um arquivo de simulação de referências e chaves e importa-lo na chamada utilizando o parâmetro **-m**.

###Criação JSON de relacionamentos
O arquivo deve ser um array de objetos que contém as seguintes propriedades:

| Campo | Tipo | Descrição |
|-------|------|-----------|
|table_name|string|Campo contendo o nome da tabela que irá ser definida as propriedades|
|references|string[]|Um array de string contendo todas as tabelas que fazem referência a tabela definida em table_name|
|table_meta|empty|Não utilizando ainda. Deixar como um array vazio.|
|table_fks|FK[]|Um array de objetos do tipo FK. Este objeto é descrito logo abaixo|

###Objeto FK
O objeto FK é utilizado na simulação virtual dos relacionamentos do banco.

| Campo | Tipo | Descrição |
|-------|------|-----------|
|fk_name|string|Nome da constraint da chave estrangeira.|
|col_name|string|Nome do campo da tabela ```table_name``` que irá referenciar o registro em outra tabela|
|fk_table|string|Nome da tabela onde a chave estrangeira será referenciada.|
|fk_column|string|Nome do campo da tabela estrangeira que irá fazer par com o campo ```col_name```|

###Exemplo
O exemplo a seguir define as regras de relação para a relação da imagem supracitada.
```json
[
  {
    "table_name": "usuarios",
    "references": [
      "pedidos"
    ],
    "table_fks": [],
    "table_meta": []
  },
  {
    "table_name": "pedidos",
    "references": [],
    "table_fks": [
      {
        "fk_name": "fk_pedidos_usuario",
        "col_name": "id_usuario_criacao",
        "fk_table": "usuarios",
        "fk_column": "id_usuario"
      }
    ],
    "table_meta": []
  }
]
```

##Licença
Inserir descrição da licença aqui