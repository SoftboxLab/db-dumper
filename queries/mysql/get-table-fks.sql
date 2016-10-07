select
    k.CONSTRAINT_NAME        as fk_name,
    k.COLUMN_NAME            as col_name,
    k.REFERENCED_TABLE_NAME  as fk_table,
    k.REFERENCED_COLUMN_NAME as fk_column
from INFORMATION_SCHEMA.TABLE_CONSTRAINTS c
    inner join information_schema.REFERENTIAL_CONSTRAINTS  r
        on c.CONSTRAINT_CATALOG = r.CONSTRAINT_CATALOG
        and c.CONSTRAINT_SCHEMA = r.CONSTRAINT_SCHEMA
        and c.CONSTRAINT_NAME = r.CONSTRAINT_NAME
    inner join information_schema.KEY_COLUMN_USAGE k
        on k.CONSTRAINT_CATALOG = c.CONSTRAINT_CATALOG
        and k.CONSTRAINT_SCHEMA = c.CONSTRAINT_SCHEMA
        and k.TABLE_NAME = c.TABLE_NAME
        and k.CONSTRAINT_NAME = c.CONSTRAINT_NAME
where c.CONSTRAINT_TYPE = 'FOREIGN KEY'
    and c.TABLE_NAME = ?
    and c.CONSTRAINT_SCHEMA = ?
order by fk_name
