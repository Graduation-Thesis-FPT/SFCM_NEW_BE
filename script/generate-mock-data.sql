USE [SFCM]
GO

INSERT INTO dbo.[ROLE] (ID, NAME, CREATED_BY, UPDATED_BY)
VALUES
('admin', N'Quản trị viên', NULL, NULL);

INSERT INTO dbo.[USER] (USERNAME, PASSWORD, ROLE_ID, CREATED_BY, UPDATED_BY)
VALUES
('superadmin', NULL, 'admin', 'superadmin', 'superadmin');

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
('generic-list','service',N'Phương án',NULL,1,204,'Service','superadmin','superadmin'),
('generic-list','package-type',N'Loại hàng',NULL,1,205,'PackageType','superadmin','superadmin'),
('generic-list','customer-list',N'Khách hàng',NULL,1,206,'CustomerList','superadmin','superadmin'),
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

INSERT INTO dbo.ROLE_PERMISSION (ROLE_ID ,MENU_ID ,CAN_VIEW ,CAN_ADD_NEW ,CAN_MODIFY ,CAN_DELETE ,CREATED_BY,UPDATED_BY)
VALUES 
('admin','user',1,1,1,1,'superadmin','superadmin'),
('admin','permission',1,1,1,1,'superadmin','superadmin'),
('admin','warehouse-list',1,1,1,1,'superadmin','superadmin'),
('admin','warehouse-design',1,1,1,1,'superadmin','superadmin'),
('admin','service',1,1,1,1,'superadmin','superadmin'),
('admin','package-type',1,1,1,1,'superadmin','superadmin'),
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
('procedure-staff','service',1,1,1,1,'superadmin','superadmin'),
('procedure-staff','package-type',1,1,1,1,'superadmin','superadmin'),
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
