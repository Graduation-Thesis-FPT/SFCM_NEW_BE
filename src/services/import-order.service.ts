import { BadRequestError } from '../core/error.response';
import { ERROR_MESSAGE } from '../constants';
import { User } from '../entity/user.entity';
import {
  loadImportVesselAnhCustomer,
  loadImportContainer,
  loadContInfoByID,
  getContainerTariff,
  getAllVoyageWithCustomerCanImportOrder,
} from '../repositories/import-order.repo';
import { ImportOrder } from '../models/import-order.model';
import { ImportOrderDetail } from '../models/import-order.model';
import { ContainerImLoad } from '../repositories/import-order.repo';
import { ContainerTariff } from '../models/container-tariff.model';
import { roundMoney } from '../utils';

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
    // const checkShipperID = arrayContInfo.map(e => e.SHIPPER_ID).length;
    // if (checkShipperID != 1) {
    //   throw new BadRequestError(`Vui lòng kiểm tra cùng chủ hàng của container nhập!`);
    // }
    const countCont20 = arrayContInfo.filter(cont => cont.CNTR_SIZE == 20).length;
    const countCont40 = arrayContInfo.filter(cont => cont.CNTR_SIZE == 40).length;
    const countCont45 = arrayContInfo.filter(cont => cont.CNTR_SIZE == 45).length;

    let tariffInfo;
    let billInfo = [];
    if (countCont20) {
      tariffInfo = await getContainerTariff({
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
      tariffInfo = await getContainerTariff({
        STATUS: 'ACTIVE',
        CNTR_SIZE: 40,
      });
      if (tariffInfo) {
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
      tariffInfo = await getContainerTariff({
        STATUS: 'ACTIVE',
        CNTR_SIZE: 45,
      });
      if (tariffInfo) {
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
}
export default ImportOrderService;
