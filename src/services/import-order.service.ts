import { BadRequestError } from '../core/error.response';
import {
  loadImportVesselAnhCustomer,
  loadImportContainer,
  loadContInfoByID,
  getAllVoyageWithCustomerCanImportOrder,
  getContainerTariffV2,
  saveImportPayment,
  saveImportOrder,
  saveImportOrderDtl,
  updateVoyageContainer,
  wherePaymentObj,
  loadPaymentComplete,
  paymentComplete,
  wherePaymentCompleteObj,
  filterCancelOrder,
  loadCancelOrder,
  cancelOrder,
  whereCancelObj,
  checkCanCalculateImport,
} from '../repositories/import-order.repo';
import { ImportOrderPayment } from '../models/import-payment.model';

import { ContainerImLoad } from '../repositories/import-order.repo';
import { roundMoney } from '../utils';
import { User } from '../entity/user.entity';
import { genOrderNo } from '../utils/genKey';
import { manager } from '../repositories/index.repo';
import { ImportOrder, ImportOrderDetail } from '../models/import-order.model';

class ImportOrderService {
  static getAllVoyageWithCustomerCanImportOrder = async () => {
    return await getAllVoyageWithCustomerCanImportOrder();
  };

  static loadImportVesselAnhCustomer = async () => {
    return await loadImportVesselAnhCustomer();
  };

  static loadImportContainer = async (obj: ContainerImLoad) => {
    if (!obj.SHIPPER_ID || !obj.VOYAGE_ID) {
      throw new BadRequestError(`Vui lòng chọn khách hàng và mã chuyến tàu!`);
    }
    return await loadImportContainer(obj);
  };

  static calculateImport = async (arrayContID: string[]) => {
    const arrayContInfo = await loadContInfoByID(arrayContID);
    if (arrayContID.length != arrayContInfo.length) {
      throw new BadRequestError(`Thông tin cont đã bị thay đổi, vui lòng kiểm tra lại!`);
    }
    const checkShipperID = arrayContInfo
      .map(e => e.SHIPPER_ID)
      .filter((e, i, self) => {
        return self.indexOf(e) === i;
      }).length;
    if (checkShipperID != 1) {
      throw new BadRequestError(`Vui lòng kiểm tra cùng chủ hàng của container nhập!`);
    }

    for (const cont of arrayContInfo) {
      console.log('🚀 ~ ImportOrderService ~ calculateImport= ~ cont:', cont.ID);
      const check = await checkCanCalculateImport(cont.ID);
      console.log('🚀 ~ ImportOrderService ~ calculateImport= ~ check:', check);
      if (check) {
        throw new BadRequestError(check.message);
      }
    }

    const countCont20 = arrayContInfo.filter(cont => cont.CNTR_SIZE == 20).length;
    const countCont40 = arrayContInfo.filter(cont => cont.CNTR_SIZE == 40).length;
    const countCont45 = arrayContInfo.filter(cont => cont.CNTR_SIZE == 45).length;

    let tariffInfo;
    let billInfo = [];
    if (countCont20) {
      tariffInfo = await getContainerTariffV2({
        STATUS: 'ACTIVE',
        CNTR_SIZE: 20,
      });
      if (!tariffInfo) {
        throw new BadRequestError(`Không tìm thấy biểu cước của container kích thước 20`);
      }

      let quanlity: number = countCont20;
      let vatPrice: number = tariffInfo.UNIT_PRICE * (tariffInfo.VAT_RATE / 100) * quanlity;
      let unitPrice: number = tariffInfo.UNIT_PRICE * (1 - tariffInfo.VAT_RATE / 100);
      let cost: number = tariffInfo.UNIT_PRICE * (1 - tariffInfo.VAT_RATE / 100) * quanlity;
      let totalPrice: number = vatPrice + cost;

      let tempObj: any = {
        UNIT_RATE: roundMoney(unitPrice),
        VAT_PRICE: roundMoney(vatPrice),
        AMOUNT: roundMoney(cost),
        TAMOUNT: roundMoney(totalPrice),
        QTY: (Math.round(quanlity * 100) / 100).toFixed(2),
      };
      billInfo.push(Object.assign(tempObj, tariffInfo));
    }

    if (countCont40) {
      tariffInfo = await getContainerTariffV2({
        STATUS: 'ACTIVE',
        CNTR_SIZE: 40,
      });
      if (!tariffInfo) {
        throw new BadRequestError(`Không tìm thấy biểu cước của container kích thước 40`);
      }
      let quanlity: number = countCont40;
      let vatPrice: number = tariffInfo.UNIT_PRICE * (tariffInfo.VAT_RATE / 100) * quanlity;
      let unitPrice: number = tariffInfo.UNIT_PRICE * (1 - tariffInfo.VAT_RATE / 100);
      let cost: number = tariffInfo.UNIT_PRICE * (1 - tariffInfo.VAT_RATE / 100) * quanlity;
      let totalPrice: number = vatPrice + cost;

      let tempObj: any = {
        UNIT_RATE: roundMoney(unitPrice),
        VAT_PRICE: roundMoney(vatPrice),
        AMOUNT: roundMoney(cost),
        TAMOUNT: roundMoney(totalPrice),
        QTY: (Math.round(quanlity * 100) / 100).toFixed(2),
      };
      billInfo.push(Object.assign(tempObj, tariffInfo));
    }

    if (countCont45) {
      tariffInfo = await getContainerTariffV2({
        STATUS: 'ACTIVE',
        CNTR_SIZE: 45,
      });
      if (!tariffInfo) {
        throw new BadRequestError(`Không tìm thấy biểu cước của container kích thước 45`);
      }
      let quanlity: number = countCont45;
      let vatPrice: number = tariffInfo.UNIT_PRICE * (tariffInfo.VAT_RATE / 100) * quanlity;
      let unitPrice: number = tariffInfo.UNIT_PRICE * (1 - tariffInfo.VAT_RATE / 100);
      let cost: number = tariffInfo.UNIT_PRICE * (1 - tariffInfo.VAT_RATE / 100) * quanlity;
      let totalPrice: number = vatPrice + cost;

      let tempObj: any = {
        UNIT_RATE: roundMoney(unitPrice),
        VAT_PRICE: roundMoney(vatPrice),
        AMOUNT: roundMoney(cost),
        TAMOUNT: roundMoney(totalPrice),
        QTY: (Math.round(quanlity * 100) / 100).toFixed(2),
      };
      billInfo.push(Object.assign(tempObj, tariffInfo));
    }
    return billInfo;
  };

  static saveImportOrder = async (
    dataReq: { arrayContID: string[]; paymentInfo: ImportOrderPayment; note: string },
    createBy: User,
  ) => {
    const arrayContInfo = await loadContInfoByID(dataReq.arrayContID);
    const IDNo = await genOrderNo('');
    if (dataReq.arrayContID.length != arrayContInfo.length) {
      throw new BadRequestError(`Thông tin cont đã bị thay đổi, vui lòng kiểm tra lại!`);
    }
    let paymentReturn;
    let importOrderReturn;
    let importOrderDtlReturn;
    await manager.transaction(async transactionalEntityManager => {
      dataReq.paymentInfo.STATUS = `PENDING`;
      dataReq.paymentInfo.ID = `IPM${IDNo}`;
      dataReq.paymentInfo.CREATED_BY = createBy.USERNAME;
      dataReq.paymentInfo.CREATED_AT = new Date();
      dataReq.paymentInfo.UPDATED_BY = createBy.USERNAME;
      dataReq.paymentInfo.UPDATED_AT = new Date();

      paymentReturn = await saveImportPayment(dataReq.paymentInfo, transactionalEntityManager);

      let importOrderInfo: ImportOrder = {
        CAN_CANCEL: true,
        ID: `NK${IDNo}`,
        PAYMENT_ID: paymentReturn.ID,
        STATUS: 'COMPLETED',
        CREATED_BY: createBy.USERNAME,
        CREATED_AT: new Date(),
        UPDATED_BY: createBy.USERNAME,
        UPDATED_AT: new Date(),
        NOTE: dataReq.note,
      };
      importOrderReturn = await saveImportOrder(importOrderInfo, transactionalEntityManager);

      let importOrderDtlInfo: ImportOrderDetail[] = [];
      for (let i = 0; i < arrayContInfo.length; i++) {
        let tempContainerInfo = arrayContInfo[i];
        let tariffInfo = await getContainerTariffV2({
          STATUS: 'ACTIVE',
          CNTR_SIZE: tempContainerInfo.CNTR_SIZE,
        });
        if (!tariffInfo) {
          throw new BadRequestError(
            `Không tìm thấy biểu cước của container kích thước ${tempContainerInfo.CNTR_SIZE}`,
          );
        }
        let data: ImportOrderDetail = {
          ORDER_ID: importOrderReturn.ID,
          VOYAGE_CONTAINER_ID: tempContainerInfo.ID,
          CONTAINER_TARIFF_ID: tariffInfo.ID,
          // NOTE: string,
          CREATED_BY: createBy.USERNAME,
          CREATED_AT: new Date(),
          UPDATED_BY: createBy.USERNAME,
          UPDATED_AT: new Date(),
        };
        importOrderDtlInfo.push(data);
      }
      importOrderDtlReturn = await saveImportOrderDtl(
        importOrderDtlInfo,
        transactionalEntityManager,
      );
      // await updateVoyageContainer(dataReq.arrayContID, transactionalEntityManager);
    });
    return {
      payment: paymentReturn,
      importOrder: importOrderReturn,
      importOrderDtl: importOrderDtlReturn,
    };
  };

  static loadPaymentConfirm = async (whereObj: wherePaymentObj) => {
    if (!whereObj.fromDate || !whereObj.toDate) {
      throw new BadRequestError(`Vui lòng chọn khoảng thời gian làm lệnh!!`);
    }
    return await loadPaymentComplete(whereObj);
  };
  static paymentComplete = async (whereObj: wherePaymentCompleteObj) => {
    return await paymentComplete(whereObj);
  };
  static loadCancelOrder = async (whereObj: filterCancelOrder) => {
    return await loadCancelOrder(whereObj);
  };
  static cancelOrder = async (whereObj: whereCancelObj) => {
    return await cancelOrder(whereObj);
  };
}
export default ImportOrderService;
