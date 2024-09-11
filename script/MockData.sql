INSERT INTO dbo.[ROLE] (ID, NAME, CREATED_BY, UPDATED_BY)
VALUES
('admin', N'Quản trị viên', NULL, NULL);

INSERT INTO dbo.[USER] (USERNAME, PASSWORD, ROLE_ID, CREATED_BY, UPDATED_BY)
VALUES
('superadmin', NULL, 'admin', NULL, NULL);

INSERT INTO dbo.[ROLE] (ID, NAME, CREATED_BY, UPDATED_BY)
VALUES
('procedure-staff', N'Thủ tục', 'superadmin', 'superadmin'),
('tally-operator', N'Điều hành kiểm đếm', 'superadmin', 'superadmin'),
('warehouse-operator', N'Điều hành kho', 'superadmin', 'superadmin'),
('customer', N'Khách hàng', 'superadmin', 'superadmin');

INSERT INTO dbo.[USER] (USERNAME, PASSWORD, ROLE_ID, CREATED_BY, UPDATED_BY)
VALUES
('thutuc', NULL, 'procedure-staff', 'superadmin', 'superadmin'),
('dieuhanhkiemdem', NULL, 'tally-operator', 'superadmin', 'superadmin'),
('dieuhanhkho', NULL, 'warehouse-operator', 'superadmin', 'superadmin');

INSERT INTO dbo.MENU (PARENT_ID,ID,NAME,MENU_ICON,IS_VISIBLE,ORDER_BY,PAGE_COMPONENT,CREATED_BY,UPDATED_BY)
VALUES 
(NULL,'user-management',N'Quản lý người dùng','UserRound',1,100,NULL,'superadmin','superadmin'),
('user-management','user',N'Người dùng',NULL,1,101,'User','superadmin','superadmin'),
('user-management','permission',N'Phân quyền',NULL,1,102,'Permission','superadmin','superadmin'),
(NULL,'generic-list',N'Quản lý dữ liệu chung','Layers',1,200,NULL,'superadmin','superadmin'),
('generic-list','warehouse-list',N'Kho',NULL,1,201,'WarehouseList','superadmin','superadmin'),
('generic-list','warehouse-design',N'Thiết kế kho',NULL,1,203,'WarehouseDesign','superadmin','superadmin'),
('generic-list','equipment-list',N'Thiết bị',NULL,1,205,'EquipmentList','superadmin','superadmin'),
('generic-list','method-list',N'Phương án',NULL,1,206,'MethodList','superadmin','superadmin'),
('generic-list','item-type',N'Phân loại hàng',NULL,1,207,'ItemType','superadmin','superadmin'),
('generic-list','package-unit-list',N'Đơn vị kiện hàng ',NULL,1,208,'PackageUnitList','superadmin','superadmin'),
('generic-list','customer-type',N'Phân loại khách hàng',NULL,1,209,'CustomerType','superadmin','superadmin'),
('generic-list','customer-list',N'Khách hàng',NULL,1,210,'CustomerList','superadmin','superadmin'),
(NULL,'tariff',N'Biểu cước','Calculator',1,300,NULL,'superadmin','superadmin'),
('tariff','tariff-code',N'Mã biểu cước',NULL,1,301,'TariffCode','superadmin','superadmin'),
('tariff','standard-tariff',N'Biểu cước chuẩn',NULL,1,302,'StandardTariff','superadmin','superadmin'),
('tariff','discount-tariff',N'Biểu cước giảm giá',NULL,1,303,'DiscountTariff','superadmin','superadmin'),
('tariff','config-attach-srv',N'Cấu hình dịch vụ đính kèm',NULL,1,304,'ConfigAttachSrv','superadmin','superadmin'),
(NULL,'input-data',N'Dữ liệu đầu vào','FolderInput',1,400,NULL,'superadmin','superadmin'),
('input-data','vessel-info',N'Kê khai tàu chuyến',NULL,1,401,'VesselInfo','superadmin','superadmin'),
('input-data','manifest-loading-list',N'Kê khai container',NULL,1,402,'ManifestLoadingList','superadmin','superadmin'),
('input-data','goods-manifest',N'Kê khai hàng hóa',NULL,1,403,'GoodsManifest','superadmin','superadmin'),
(NULL,'procedure',N'Thủ tục','FilePen',1,500,NULL,'superadmin','superadmin'),
('procedure','import-order',N'Lệnh nhập kho',NULL,1,501,'ImportOrder','superadmin','superadmin'),
('procedure','export-order',N'Lệnh xuất kho',NULL,1,502,'ExportOrder','superadmin','superadmin'),
('procedure','cancel-invoice',N'Hủy lệnh',NULL,1,503,'CancelInvoice','superadmin','superadmin'),
(NULL,'warehouse-operation',N'Điều hành kho','ReplaceAll',1,600,NULL,'superadmin','superadmin'),
('warehouse-operation','import-tally',N'Kiểm đếm nhập kho',NULL,1,601,'ImportTally','superadmin','superadmin'),
('warehouse-operation','fork-lift',N'Quản lý hàng nhập/xuất kho',NULL,1,602,'ForkLift','superadmin','superadmin'),
(NULL,'report',N'Báo cáo','Library',1,700,NULL,'superadmin','superadmin'),
('report','in-ex-order',N'Báo cáo đơn hàng',NULL,1,701,'InExOrder','superadmin','superadmin'),
('report','revenue',N'Báo cáo doanh thu',NULL,1,702,'Revenue','superadmin','superadmin'),
(NULL,'customer-order',N'Đơn hàng của tôi','ClipboardList',1,800,NULL,'superadmin','superadmin'),
('customer-order','all-orders',N'Tất cả đơn hàng',NULL,1,801,'Order','superadmin','superadmin'),
('customer-order','order-tracking',N'Trạng thái đơn hàng',NULL,1,802,'OrderTracking','superadmin','superadmin');

--INSERT INTO dbo.ROLE_PERMISSION (ROLE_ID ,MENU_ID ,CAN_VIEW ,CAN_ADD_NEW ,CAN_MODIFY ,CAN_DELETE ,CREATED_BY,UPDATED_BY)
--VALUES 
--('123','user',1,1,1,1,'superadmin','superadmin');

INSERT INTO dbo.ROLE_PERMISSION (ROLE_ID ,MENU_ID ,CAN_VIEW ,CAN_ADD_NEW ,CAN_MODIFY ,CAN_DELETE ,CREATED_BY,UPDATED_BY)
VALUES 
('admin','user',1,1,1,1,'superadmin','superadmin'),
('admin','permission',1,1,1,1,'superadmin','superadmin'),
('admin','warehouse-list',1,1,1,1,'superadmin','superadmin'),
('admin','warehouse-design',1,1,1,1,'superadmin','superadmin'),
('admin','method-list',1,1,1,1,'superadmin','superadmin'),
('admin','item-type',1,1,1,1,'superadmin','superadmin'),
('admin','package-unit-list',1,1,1,1,'superadmin','superadmin'),
('admin','customer-type',1,1,1,1,'superadmin','superadmin'),
('admin','customer-list',1,1,1,1,'superadmin','superadmin'),
('admin','vessel-info',1,1,1,1,'superadmin','superadmin'),
('admin','manifest-loading-list',1,1,1,1,'superadmin','superadmin'),
('admin','goods-manifest',1,1,1,1,'superadmin','superadmin'),
('admin','tariff-code',1,1,1,1,'superadmin','superadmin'),
('admin','standard-tariff',1,1,1,1,'superadmin','superadmin'),
('admin','discount-tariff',1,1,1,1,'superadmin','superadmin'),
('admin','config-attach-srv',1,1,1,1,'superadmin','superadmin'),
('admin','in-ex-order',1,1,1,1,'superadmin','superadmin'),
('admin','revenue',1,1,1,1,'superadmin','superadmin'),

('admin','import-order',1,1,1,1,'superadmin','superadmin'),
('admin','export-order',1,1,1,1,'superadmin','superadmin'),
('admin','cancel-invoice',1,1,1,1,'superadmin','superadmin'),
('admin','import-tally',1,1,1,1,'superadmin','superadmin'),
('admin','fork-lift',1,1,1,1,'superadmin','superadmin'),

('procedure-staff','warehouse-list',1,1,1,1,'superadmin','superadmin'),
('procedure-staff','warehouse-design',1,1,1,1,'superadmin','superadmin'),
('procedure-staff','method-list',1,1,1,1,'superadmin','superadmin'),
('procedure-staff','item-type',1,1,1,1,'superadmin','superadmin'),
('procedure-staff','package-unit-list',1,1,1,1,'superadmin','superadmin'),
('procedure-staff','customer-type',1,1,1,1,'superadmin','superadmin'),
('procedure-staff','customer-list',1,1,1,1,'superadmin','superadmin'),
('procedure-staff','vessel-info',1,1,1,1,'superadmin','superadmin'),
('procedure-staff','manifest-loading-list',1,1,1,1,'superadmin','superadmin'),
('procedure-staff','goods-manifest',1,1,1,1,'superadmin','superadmin'),
('procedure-staff','tariff-code',1,1,1,1,'superadmin','superadmin'),
('procedure-staff','standard-tariff',1,1,1,1,'superadmin','superadmin'),
('procedure-staff','discount-tariff',1,1,1,1,'superadmin','superadmin'),
('procedure-staff','config-attach-srv',1,1,1,1,'superadmin','superadmin'),
('procedure-staff','import-order',1,1,1,1,'superadmin','superadmin'),
('procedure-staff','export-order',1,1,1,1,'superadmin','superadmin'),
('procedure-staff','cancel-invoice',1,1,1,1,'superadmin','superadmin'),
('procedure-staff','in-ex-order',1,1,1,1,'superadmin','superadmin'),
('procedure-staff','revenue',1,1,1,1,'superadmin','superadmin'),

('tally-operator','import-tally',1,1,1,1,'superadmin','superadmin'),
('warehouse-operator','fork-lift',1,1,1,1,'superadmin','superadmin'),

('customer','all-orders',1,1,1,1,'superadmin','superadmin'),
('customer','order-tracking',1,1,1,1,'superadmin','superadmin')

--
---- Insert mock data into WAREHOUSE table
--INSERT INTO WAREHOUSE (WAREHOUSE_ID, WAREHOUSE_NAME, CREATED_BY, CREATED_AT, UPDATED_BY, UPDATED_AT)
--VALUES
--('WH001', 'Warehouse A', 'john.doe', GETDATE(), 'john.doe', GETDATE()),
--('WH002', 'Warehouse B', 'john.doe', GETDATE(), 'john.doe', GETDATE());
--
---- Insert mock data into BLOCK table
--INSERT INTO BLOCK (BLOCK_ID, BLOCK_NAME, WAREHOUSE_ID, TOTAL_TIERS, TOTAL_CELLS, BLOCK_LENGTH, BLOCK_WIDTH, BLOCK_HEIGHT, CREATED_BY, CREATED_AT, UPDATED_BY, UPDATED_AT)
--VALUES
--('BL001', 'Block 1', 'WH001', 5, 50, 20.0, 10.0, 15.0, 'john.doe', GETDATE(), 'john.doe', GETDATE()),
--('BL002', 'Block 2', 'WH002', 4, 40, 18.0, 8.0, 12.0, 'john.doe', GETDATE(), 'john.doe', GETDATE());
--
---- Insert mock data into CELL table
--INSERT INTO CELL (ROWGUID, BLOCK_ID, TIER_ORDERED, SLOT_ORDERED, CELL_LENGTH, CELL_WIDTH, CELL_HEIGHT, IS_FILLED, CREATED_BY, CREATED_AT, UPDATED_BY, UPDATED_AT)
--VALUES
--(NEWID(), 'BL001', 1, 1, 2.5, 2.0, 2.0, 0, 'john.doe', GETDATE(), 'john.doe', GETDATE()),
--(NEWID(), 'BL001', 2, 2, 2.5, 2.0, 2.0, 0, 'john.doe', GETDATE(), 'john.doe', GETDATE()),
--(NEWID(), 'BL002', 1, 1, 2.5, 2.0, 2.0, 0, 'john.doe', GETDATE(), 'john.doe', GETDATE());
--
---- Insert mock data into CUSTOMER table
--INSERT INTO CUSTOMER (CUSTOMER_ID, EMAIL, CUSTOMER_TYPE, CUSTOMER_NAME, TAX_CODE, ADDRESS, IS_ACTIVE, CREATED_BY, CREATED_AT, UPDATED_BY, UPDATED_AT)
--VALUES
--('CUST001', 'customer1@example.com', 'SHIPPER', 'Customer One', 'TX123456', '789 Pine St', 1, 'john.doe', GETDATE(), 'john.doe', GETDATE());
--('CUST002', 'customer2@example.com', 'CONSIGNEE', 'Customer Two', 'TX654321', '321 Oak St', 1, 'john.doe', GETDATE(), 'john.doe', GETDATE());

---- Insert mock data into VOYAGE table
--INSERT INTO VOYAGE (VOYAGE_ID, VESSEL_NAME, ETA, CREATED_BY, CREATED_AT, UPDATED_BY, UPDATED_AT)
--VALUES
--('VOY001', 'Vessel A', DATEADD(DAY, 5, GETDATE()), 'john.doe', GETDATE(), 'john.doe', GETDATE()),
--('VOY002', 'Vessel B', DATEADD(DAY, 10, GETDATE()), 'john.doe', GETDATE(), 'john.doe', GETDATE());
--
---- Insert mock data into VOYAGE_CONTAINER table
--INSERT INTO VOYAGE_CONTAINER (VOYAGE_CONTAINER_ID, VOYAGE_ID, SHIPPER, CNTR_NO, CNTR_SIZE, SEAL_NO, STATUS, NOTE, CREATED_BY, CREATED_AT, UPDATED_BY, UPDATED_AT)
--VALUES
--('VOY001_CNTR001', 'VOY001', 'CUST001', 'CNTR001', 20, 'SEAL001', 'PENDING', 'Fragile goods', 'john.doe', GETDATE(), 'john.doe', GETDATE()),
--('VOY002_CNTR002', 'VOY002', 'CUST001', 'CNTR002', 40, 'SEAL002', 'IMPORTED', 'General cargo', 'john.doe', GETDATE(), 'john.doe', GETDATE());
--
---- Insert mock data into VOYAGE_CONTAINER_PACKAGE table
--INSERT INTO VOYAGE_CONTAINER_PACKAGE (VOYAGE_CONTAINER_PACKAGE_ID, HOUSE_BILL, VOYAGE_CONTAINER_ID, PACKAGE_TYPE_ID, CONSIGNEE, PACKAGE_UNIT, CBM, TOTAL_ITEMS, NOTE, TIME_IN, STATUS, CREATED_BY, CREATED_AT, UPDATED_BY, UPDATED_AT)
--VALUES
--('VOY001_CNTR001_PK001', 'HB001', 'VOY001_CNTR001', 'PKG001', 'CUST002', 'UNIT001', 10.5, 100, 'Handle with care', GETDATE(), 'IN_CONTAINER', 'john.doe', GETDATE(), 'john.doe', GETDATE()),
--('VOY002_CNTR002_PK002', 'HB002', 'VOY002_CNTR002', 'PKG002', 'CUST002', 'UNIT002', 20.0, 200, 'Perishable goods', GETDATE(), 'ALLOCATING', 'john.doe', GETDATE(), 'john.doe', GETDATE());
--
---- Insert mock data into PACKAGE_TYPE table
--INSERT INTO PACKAGE_TYPE (PACKAGE_TYPE_ID, PACKAGE_TYPE_NAME, CREATED_BY, CREATED_AT, UPDATED_BY, UPDATED_AT)
--VALUES
--('PKG001', 'Standard Package', 'john.doe', GETDATE(), 'john.doe', GETDATE()),
--('PKG002', 'Heavy Duty Package', 'john.doe', GETDATE(), 'john.doe', GETDATE());
--
---- Insert mock data into SERVICE table
--INSERT INTO SERVICE (SERVICE_ID, SERVICE_NAME, PARENT_ID, CREATED_BY, CREATED_AT, UPDATED_BY, UPDATED_AT)
--VALUES
--('SRV001', 'Freight Service', NULL, 'john.doe', GETDATE(), 'john.doe', GETDATE()),
--('SRV002', 'Express Delivery', 'SRV001', 'john.doe', GETDATE(), 'john.doe', GETDATE());
--
---- Insert mock data into TARIFF table
--INSERT INTO TARIFF (ROWGUID, CUSTOMER_ID, PACKAGE_TYPE_ID, SERVICE_ID, TARIFF_DESCRIPTION, UNIT, UNIT_PRICE, VAT_RATE, VALID_FROM, VALID_UNTIL, STATUS, CREATED_BY, CREATED_AT, UPDATED_BY, UPDATED_AT)
--VALUES
--(NEWID(), 'CUST001', 'PKG001', 'SRV001', 'Standard rate for shippers', 'KG', 5.0, 0.1, GETDATE(), DATEADD(YEAR, 1, GETDATE()), 'ACTIVE', 'john.doe', GETDATE(), 'john.doe', GETDATE()),
--(NEWID(), 'CUST002', 'PKG002', 'SRV002', 'Express rate for consignees', 'KG', 10.0, 0.15, GETDATE(), DATEADD(YEAR, 1, GETDATE()), 'ACTIVE', 'john.doe', GETDATE(), 'john.doe', GETDATE());
--
---- Insert mock data into INVOICE table
--INSERT INTO INVOICE (INVOICE_ID, INVOICE_DATE, PRE_VAT_AMOUNT, VAT_AMOUNT, TOTAL_AMOUNT, STATUS, CREATED_BY, CREATED_AT, UPDATED_BY, UPDATED_AT)
--VALUES
--('INV001', GETDATE(), 1000.0, 100.0, 1100.0, 'PAID', 'john.doe', GETDATE(), 'john.doe', GETDATE()),
--('INV002', GETDATE(), 2000.0, 300.0, 2300.0, 'CANCELLED', 'john.doe', GETDATE(), 'john.doe', GETDATE());
--
---- Insert mock data into INVOICE_LINE_ITEM table
--INSERT INTO INVOICE_LINE_ITEM (ROWGUID, INVOICE_ID, TARIFF_ID, LINE_ITEM_QUANTITY, PRE_VAT_AMOUNT, VAT_AMOUNT, TOTAL_AMOUNT, CREATED_BY, CREATED_AT, UPDATED_BY, UPDATED_AT)
--VALUES
--(NEWID(), 'INV001', (SELECT TOP 1 ROWGUID FROM TARIFF WHERE CUSTOMER_ID = 'CUST001'), 100, 500.0, 50.0, 550.0, 'john.doe', GETDATE(), 'john.doe', GETDATE()),
--(NEWID(), 'INV002', (SELECT TOP 1 ROWGUID FROM TARIFF WHERE CUSTOMER_ID = 'CUST002'), 200, 1500.0, 225.0, 1725.0, 'john.doe', GETDATE(), 'john.doe', GETDATE());
--
---- Insert mock data into DELIVERY_ORDER table
--INSERT INTO DELIVERY_ORDER (ORDER_ID, ORDER_TYPE, INVOICE_ID, PICKUP_DATE, TOTAL_CBM, NOTE, CAN_CANCEL, STATUS, CREATED_BY, CREATED_AT, UPDATED_BY, UPDATED_AT)
--VALUES
--('ORD001', 'IMPORT', 'INV001', DATEADD(DAY, 1, GETDATE()), 100.5, 'Handle with care', 1, 'ACTIVE', 'john.doe', GETDATE(), 'john.doe', GETDATE()),
--('ORD002', 'EXPORT', 'INV002', DATEADD(DAY, 2, GETDATE()), 200.0, 'Urgent delivery', 0, 'INACTIVE', 'john.doe', GETDATE(), 'john.doe', GETDATE());
--
---- Insert mock data into DELIVERY_ORDER_DETAIL table
--INSERT INTO DELIVERY_ORDER_DETAIL (ROWGUID, ORDER_ID, VOYAGE_CONTAINER_PACKAGE_ID, VOYAGE_CONTAINER_ID, QUANTITY, STATUS, NOTE, CREATED_BY, CREATED_AT, UPDATED_BY, UPDATED_AT)
--VALUES
--(NEWID(), 'ORD001', 'VOY001_CNTR001_PK001', NULL, 50, 'PENDING', 'First batch of packages', 'john.doe', GETDATE(), 'john.doe', GETDATE()),
--(NEWID(), 'ORD002', NULL, 'VOY002_CNTR002', 10, 'COMPLETED', 'Export delivery', 'john.doe', GETDATE(), 'john.doe', GETDATE());
