-- Drop all foreign key constraints
DECLARE @sql NVARCHAR(MAX) = N'';

-- Drop foreign key constraints
SELECT @sql += 'ALTER TABLE [' + OBJECT_SCHEMA_NAME(fk.parent_object_id) + '].[' + OBJECT_NAME(fk.parent_object_id) + '] DROP CONSTRAINT [' + fk.name + '];' + CHAR(13)
FROM sys.foreign_keys AS fk;

EXEC sp_executesql @sql;

-- Drop all triggers
SET @sql = N'';

SELECT @sql += 'DROP TRIGGER [' + OBJECT_SCHEMA_NAME(object_id) + '].[' + name + '];' + CHAR(13)
FROM sys.triggers;

EXEC sp_executesql @sql;

-- Drop all tables
SET @sql = N'';

SELECT @sql += 'DROP TABLE [' + SCHEMA_NAME(schema_id) + '].[' + name + '];' + CHAR(13)
FROM sys.tables;

EXEC sp_executesql @sql;
