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
('customer', N'Khách hàng', 'superadmin', 'superadmin'),
('cashier ', N'Thu ngân', 'superadmin', 'superadmin');

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
('generic-list','package-type',N'Loại hàng',NULL,1,205,'PackageType','superadmin','superadmin'),
('generic-list','customer-list',N'Khách hàng',NULL,1,206,'CustomerList','superadmin','superadmin'),
(NULL,'tariff',N'Biểu cước','Calculator',1,300,NULL,'superadmin','superadmin'),
('tariff','container-tariff',N'Biểu cước nhập kho (container)',NULL,1,301,'ContainerTariff','superadmin','superadmin'),
('tariff','package-tariff',N'Biểu cước xuất kho (kiện hàng)',NULL,1,302,'PackageTariff','superadmin','superadmin'),
(NULL,'input-data',N'Dữ liệu đầu vào','FolderInput',1,400,NULL,'superadmin','superadmin'),
('input-data','voyage',N'Kê khai chuyến tàu',NULL,1,401,'Voyage','superadmin','superadmin'),
('input-data','voyage-container',N'Kê khai container',NULL,1,402,'VoyageContainer','superadmin','superadmin'),
('input-data','voyage-container-package',N'Kê khai hàng hóa',NULL,1,403,'VoyageContainerPackage','superadmin','superadmin'),
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
('customer-order','order-tracking',N'Trạng thái đơn hàng',NULL,1,802,'OrderTracking','superadmin','superadmin')
(NULL,'payment-confirmation',N'Xác nhận thanh toán','CircleDollarSign',1,900,NULL,'superadmin','superadmin'),
('payment-confirmation','all-payment',N'Tất cả đơn hàng',NULL,1,901,'AllPayment','superadmin','superadmin'),
('payment-confirmation','cancelled-payment',N'Đơn hàng đã huỷ',NULL,1,902,'CancelledPayment','superadmin','superadmin'),
('payment-confirmation','paid-payment',N'Đơn hàng đã thanh toán',NULL,1,903,'PaidPayment','superadmin','superadmin'),
('payment-confirmation','pending-payment',N'Đơn hàng chưa thanh toán',NULL,1,904,'PendingPayment','superadmin','superadmin');


INSERT INTO dbo.ROLE_PERMISSION (ROLE_ID ,MENU_ID ,CAN_VIEW ,CAN_ADD_NEW ,CAN_MODIFY ,CAN_DELETE ,CREATED_BY,UPDATED_BY)
VALUES 
('admin','user',1,1,1,1,'superadmin','superadmin'),
('admin','permission',1,1,1,1,'superadmin','superadmin'),
('admin','warehouse-list',1,1,1,1,'superadmin','superadmin'),
('admin','warehouse-design',1,1,1,1,'superadmin','superadmin'),
('admin','package-type',1,1,1,1,'superadmin','superadmin'),
('admin','customer-list',1,1,1,1,'superadmin','superadmin'),
('admin','voyage',1,1,1,1,'superadmin','superadmin'),
('admin','voyage-container',1,1,1,1,'superadmin','superadmin'),
('admin','voyage-container-package',1,1,1,1,'superadmin','superadmin'),

('admin','container-tariff',1,1,1,1,'superadmin','superadmin'),

('admin','package-tariff',1,1,1,1,'superadmin','superadmin'),
('admin','in-ex-order',1,1,1,1,'superadmin','superadmin'),
('admin','revenue',1,1,1,1,'superadmin','superadmin'),

('admin','import-order',1,1,1,1,'superadmin','superadmin'),
('admin','export-order',1,1,1,1,'superadmin','superadmin'),
('admin','cancel-invoice',1,1,1,1,'superadmin','superadmin'),
('admin','import-tally',1,1,1,1,'superadmin','superadmin'),
('admin','fork-lift',1,1,1,1,'superadmin','superadmin'),
('admin','all-payment',1,1,1,1,'superadmin','superadmin'),
('admin','cancelled-payment',1,1,1,1,'superadmin','superadmin'),
('admin','paid-payment',1,1,1,1,'superadmin','superadmin'),
('admin','pending-payment',1,1,1,1,'superadmin','superadmin'),

('procedure-staff','user',1,1,1,1,'superadmin','superadmin'),
('procedure-staff','permission',1,1,1,1,'superadmin','superadmin'),

('procedure-staff','warehouse-list',1,1,1,1,'superadmin','superadmin'),
('procedure-staff','warehouse-design',1,1,1,1,'superadmin','superadmin'),
('procedure-staff','package-type',1,1,1,1,'superadmin','superadmin'),
('procedure-staff','customer-list',1,1,1,1,'superadmin','superadmin'),
('procedure-staff','voyage',1,1,1,1,'superadmin','superadmin'),
('procedure-staff','voyage-container',1,1,1,1,'superadmin','superadmin'),
('procedure-staff','voyage-container-package',1,1,1,1,'superadmin','superadmin'),

('procedure-staff','container-tariff',1,1,1,1,'superadmin','superadmin'),
('procedure-staff','package-tariff',1,1,1,1,'superadmin','superadmin'),

('procedure-staff','import-order',1,1,1,1,'superadmin','superadmin'),
('procedure-staff','export-order',1,1,1,1,'superadmin','superadmin'),
('procedure-staff','cancel-invoice',1,1,1,1,'superadmin','superadmin'),

('procedure-staff','in-ex-order',1,1,1,1,'superadmin','superadmin'),
('procedure-staff','revenue',1,1,1,1,'superadmin','superadmin'),

('tally-operator','import-tally',1,1,1,1,'superadmin','superadmin'),

('warehouse-operator','fork-lift',1,1,1,1,'superadmin','superadmin'),

('cashier','all-payment',1,1,1,1,'superadmin','superadmin'),
('cashier','cancelled-payment',1,1,1,1,'superadmin','superadmin'),
('cashier','paid-payment',1,1,1,1,'superadmin','superadmin'),
('cashier','pending-payment',1,1,1,1,'superadmin','superadmin'),

('customer','all-orders',1,1,1,1,'superadmin','superadmin'),
('customer','order-tracking',1,1,1,1,'superadmin','superadmin')
