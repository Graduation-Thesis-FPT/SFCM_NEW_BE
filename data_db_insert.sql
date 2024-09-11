INSERT INTO SA_ROLE (ROLE_CODE, ROLE_NAME,CREATED_BY,UPDATED_BY)
VALUES ('admin',N'Quản trị viên','sql','sql'),
('procedure-staff',N'Thủ tục','sql','sql'),
('tally-operator',N'Điều hành kiểm đếm','sql','sql'),
('warehouse-operator',N'Điều hành kho','sql','sql'),
('customer',N'Khách hàng','sql','sql')


INSERT INTO SA_MENU (PARENT_ID,MENU_ID,MENU_NAME,MENU_ICON,IS_VISIBLE,ORDER_BY,VIEW_PAGE,CREATED_BY,UPDATED_BY)
VALUES 
(NULL,'user-management',N'Quản lý người dùng','UserRound',1,100,NULL,'sql','sql'),
('user-management','user',N'Người dùng',NULL,1,101,'User','sql','sql'),
('user-management','permission',N'Phân quyền',NULL,1,102,'Permission','sql','sql'),
(NULL,'generic-list',N'Quản lý dữ liệu chung','Layers',1,200,NULL,'sql','sql'),
('generic-list','warehouse-list',N'Kho',NULL,1,201,'WarehouseList','sql','sql'),
('generic-list','warehouse-design',N'Thiết kế kho',NULL,1,203,'WarehouseDesign','sql','sql'),
('generic-list','equipment-list',N'Thiết bị',NULL,1,205,'EquipmentList','sql','sql'),
('generic-list','method-list',N'Phương án',NULL,1,206,'MethodList','sql','sql'),
('generic-list','item-type',N'Phân loại hàng',NULL,1,207,'ItemType','sql','sql'),
('generic-list','package-unit-list',N'Đơn vị kiện hàng ',NULL,1,208,'PackageUnitList','sql','sql'),
('generic-list','customer-type',N'Phân loại khách hàng',NULL,1,209,'CustomerType','sql','sql'),
('generic-list','customer-list',N'Khách hàng',NULL,1,210,'CustomerList','sql','sql'),
(NULL,'tariff',N'Biểu cước','Calculator',1,300,NULL,'sql','sql'),
('tariff','tariff-code',N'Mã biểu cước',NULL,1,301,'TariffCode','sql','sql'),
('tariff','standard-tariff',N'Biểu cước chuẩn',NULL,1,302,'StandardTariff','sql','sql'),
('tariff','discount-tariff',N'Biểu cước giảm giá',NULL,1,303,'DiscountTariff','sql','sql'),
('tariff','config-attach-srv',N'Cấu hình dịch vụ đính kèm',NULL,1,304,'ConfigAttachSrv','sql','sql'),
(NULL,'input-data',N'Dữ liệu đầu vào','FolderInput',1,400,NULL,'sql','sql'),
('input-data','vessel-info',N'Kê khai tàu chuyến',NULL,1,401,'VesselInfo','sql','sql'),
('input-data','manifest-loading-list',N'Kê khai container',NULL,1,402,'ManifestLoadingList','sql','sql'),
('input-data','goods-manifest',N'Kê khai hàng hóa',NULL,1,403,'GoodsManifest','sql','sql'),
(NULL,'procedure',N'Thủ tục','FilePen',1,500,NULL,'sql','sql'),
('procedure','import-order',N'Lệnh nhập kho',NULL,1,501,'ImportOrder','sql','sql'),
('procedure','export-order',N'Lệnh xuất kho',NULL,1,502,'ExportOrder','sql','sql'),
('procedure','cancel-invoice',N'Hủy lệnh',NULL,1,503,'CancelInvoice','sql','sql'),
(NULL,'warehouse-operation',N'Điều hành kho','ReplaceAll',1,600,NULL,'sql','sql'),
('warehouse-operation','import-tally',N'Kiểm đếm nhập kho',NULL,1,601,'ImportTally','sql','sql'),
('warehouse-operation','fork-lift',N'Quản lý hàng nhập/xuất kho',NULL,1,602,'ForkLift','sql','sql'),
(NULL,'report',N'Báo cáo','Library',1,700,NULL,'sql','sql'),
('report','in-ex-order',N'Báo cáo đơn hàng',NULL,1,701,'InExOrder','sql','sql'),
('report','revenue',N'Báo cáo doanh thu',NULL,1,702,'Revenue','sql','sql'),
(NULL,'customer-order',N'Đơn hàng của tôi','ClipboardList',1,800,NULL,'sql','sql'),
('customer-order','all-orders',N'Tất cả đơn hàng',NULL,1,801,'Order','sql','sql'),
('customer-order','order-tracking',N'Trạng thái đơn hàng',NULL,1,802,'OrderTracking','sql','sql')


INSERT INTO SA_PERMISSION (ROLE_CODE,MENU_ID,CAN_VIEW,CAN_ADD_NEW,CAN_MODIFY,CAN_DELETE,CREATED_BY,UPDATED_BY)
VALUES 
('admin','user',1,1,1,1,'sql','sql'),
('admin','permission',1,1,1,1,'sql','sql'),
('admin','warehouse-list',1,1,1,1,'sql','sql'),
('admin','warehouse-design',1,1,1,1,'sql','sql'),
('admin','method-list',1,1,1,1,'sql','sql'),
('admin','item-type',1,1,1,1,'sql','sql'),
('admin','package-unit-list',1,1,1,1,'sql','sql'),
('admin','customer-type',1,1,1,1,'sql','sql'),
('admin','customer-list',1,1,1,1,'sql','sql'),
('admin','vessel-info',1,1,1,1,'sql','sql'),
('admin','manifest-loading-list',1,1,1,1,'sql','sql'),
('admin','goods-manifest',1,1,1,1,'sql','sql'),
('admin','tariff-code',1,1,1,1,'sql','sql'),
('admin','standard-tariff',1,1,1,1,'sql','sql'),
('admin','discount-tariff',1,1,1,1,'sql','sql'),
('admin','config-attach-srv',1,1,1,1,'sql','sql'),
('admin','in-ex-order',1,1,1,1,'sql','sql'),
('admin','revenue',1,1,1,1,'sql','sql'),

('admin','import-order',1,1,1,1,'sql','sql'),
('admin','export-order',1,1,1,1,'sql','sql'),
('admin','cancel-invoice',1,1,1,1,'sql','sql'),
('admin','import-tally',1,1,1,1,'sql','sql'),
('admin','fork-lift',1,1,1,1,'sql','sql'),

('procedure-staff','warehouse-list',1,1,1,1,'sql','sql'),
('procedure-staff','warehouse-design',1,1,1,1,'sql','sql'),
('procedure-staff','method-list',1,1,1,1,'sql','sql'),
('procedure-staff','item-type',1,1,1,1,'sql','sql'),
('procedure-staff','package-unit-list',1,1,1,1,'sql','sql'),
('procedure-staff','customer-type',1,1,1,1,'sql','sql'),
('procedure-staff','customer-list',1,1,1,1,'sql','sql'),
('procedure-staff','vessel-info',1,1,1,1,'sql','sql'),
('procedure-staff','manifest-loading-list',1,1,1,1,'sql','sql'),
('procedure-staff','goods-manifest',1,1,1,1,'sql','sql'),
('procedure-staff','tariff-code',1,1,1,1,'sql','sql'),
('procedure-staff','standard-tariff',1,1,1,1,'sql','sql'),
('procedure-staff','discount-tariff',1,1,1,1,'sql','sql'),
('procedure-staff','config-attach-srv',1,1,1,1,'sql','sql'),
('procedure-staff','import-order',1,1,1,1,'sql','sql'),
('procedure-staff','export-order',1,1,1,1,'sql','sql'),
('procedure-staff','cancel-invoice',1,1,1,1,'sql','sql'),
('procedure-staff','in-ex-order',1,1,1,1,'sql','sql'),
('procedure-staff','revenue',1,1,1,1,'sql','sql'),

('tally-operator','import-tally',1,1,1,1,'sql','sql'),
('warehouse-operator','fork-lift',1,1,1,1,'sql','sql'),

('customer','all-orders',1,1,1,1,'sql','sql'),
('customer','order-tracking',1,1,1,1,'sql','sql')


INSERT INTO SA_USER (ROLE_CODE, USERNAME,CREATED_BY,UPDATED_BY)
VALUES ('admin','superadmin','sql','sql'),
('procedure-staff','thutuc','sql','sql'),
('tally-operator','dieuhanhkiemdem','sql','sql'),
('warehouse-operator','dieuhanhkho','sql','sql')

