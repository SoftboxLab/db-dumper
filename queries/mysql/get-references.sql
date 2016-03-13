select
    r.TABLE_NAME as table_name
from
    information_schema.REFERENTIAL_CONSTRAINTS r
where
    r.REFERENCED_TABLE_NAME = ? and r.CONSTRAINT_SCHEMA = ?
