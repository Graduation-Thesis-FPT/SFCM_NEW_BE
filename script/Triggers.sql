--CREATE TRIGGER trg_EnforceSingleActiveTariff
--ON TARIFF
--AFTER INSERT, UPDATE
--AS
--BEGIN
--    -- Check for more than one active tariff per combination
--    IF EXISTS (
--        SELECT 1
--        FROM TARIFF t
--        JOIN inserted i ON t.SERVICE_ID = i.SERVICE_ID 
--                        AND t.PACKAGE_TYPE_ID = i.PACKAGE_TYPE_ID 
--                        AND t.CUSTOMER_ID = i.CUSTOMER_ID
--        WHERE t.STATUS = 'ACTIVE' 
--          AND i.STATUS = 'ACTIVE' 
--          AND t.ROWGUID <> i.ROWGUID  -- Ensure we are not comparing the row with itself
--    )
--    BEGIN
--        -- If more than one active tariff exists, raise an error
--        ROLLBACK TRANSACTION;
--        THROW 50000, 'Only one active tariff is allowed for each combination of SERVICE_ID, PACKAGE_TYPE_ID, and CUSTOMER_ID.', 1;
--    END
--END;

CREATE TRIGGER trg_UserInsertUpdate
ON [USER]
AFTER INSERT, UPDATE
AS
BEGIN
    -- Check for only one user with USERNAME = 'superadmin' having NULL in CREATED_BY and UPDATED_BY
    IF EXISTS (
        SELECT 1
        FROM [USER]
        WHERE USERNAME = 'superadmin'
        AND (CREATED_BY IS NOT NULL OR UPDATED_BY IS NOT NULL)
    )
    BEGIN
        RAISERROR ('The superadmin user must have NULL values in CREATED_BY and UPDATED_BY.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END;

    -- Check that all other users have a non-NULL CREATED_BY and UPDATED_BY
    IF EXISTS (
        SELECT 1
        FROM [USER]
        WHERE USERNAME <> 'superadmin'
        AND (CREATED_BY IS NULL OR UPDATED_BY IS NULL)
    )
    BEGIN
        RAISERROR ('All users except superadmin must have non-NULL values for CREATED_BY and UPDATED_BY.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END;

    -- Check that CREATED_BY and UPDATED_BY fields are valid usernames in the USER table
    IF EXISTS (
        SELECT 1
        FROM [USER] u
        WHERE u.USERNAME <> 'superadmin'
        AND (u.CREATED_BY IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM [USER] WHERE USERNAME = u.CREATED_BY
        ))
        OR (u.UPDATED_BY IS NOT NULL AND NOT EXISTS (
            SELECT 1 FROM [USER] WHERE USERNAME = u.UPDATED_BY
        ))
    )
    BEGIN
        RAISERROR ('CREATED_BY and UPDATED_BY must be valid usernames in the USER table.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END;
END;

CREATE TRIGGER trg_RoleInsertUpdate
ON [ROLE]
AFTER INSERT, UPDATE
AS
BEGIN
    -- Check for only one user with USERNAME = 'superadmin' having NULL in CREATED_BY and UPDATED_BY
    IF EXISTS (
        SELECT 1
        FROM [ROLE]
        WHERE ID = 'admin'
        AND (CREATED_BY IS NOT NULL OR UPDATED_BY IS NOT NULL)
    )
    BEGIN
        RAISERROR ('The admin role must have NULL values in CREATED_BY and UPDATED_BY.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END

    -- Check that all other users have a non-NULL CREATED_BY and UPDATED_BY
    IF EXISTS (
        SELECT 1
        FROM [ROLE]
        WHERE ID <> 'admin'
        AND (CREATED_BY IS NULL OR UPDATED_BY IS NULL)
    )
    BEGIN
        RAISERROR ('All roles except admin must have non-NULL values for CREATED_BY and UPDATED_BY.', 16, 1);
        ROLLBACK TRANSACTION;
        RETURN;
    END
END;
