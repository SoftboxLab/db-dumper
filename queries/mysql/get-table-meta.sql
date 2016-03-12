select
    cols.COLUMN_NAME    as 'field',
    cols.COLUMN_key     as 'key',
    cols.EXTRA          as 'extra',
    cols.DATA_TYPE      as 'type',
    cols.COLUMN_DEFAULT as 'col_default',
    cols.*
from
    information_schema.COLUMNS cols
where
    cols.TABLE_NAME = ?
    and cols.TABLE_SCHEMA  = ?
order by
    cols.ORDINAL_POSITION
