import { BadRequestError } from '../core/error.response';
import { getLatestValidPackageTariff } from '../repositories/package-tariff.repo';
import { getVoyageContainerPackagesWithTariffs } from '../repositories/voyage-container-package.repo';
import { getDaysDifference } from '../utils/common';

class ExportOrderService {
  static calculateExport = async (
    voyageContainerPackageIds: string[],
    pickupDate: Date = new Date(),
  ) => {
    if (!voyageContainerPackageIds || voyageContainerPackageIds.length === 0) {
      throw new BadRequestError('Voyage container package ids are required.');
    }
    const packageTariff = await getLatestValidPackageTariff();
    const packagesWithTariff = await getVoyageContainerPackagesWithTariffs(
      voyageContainerPackageIds,
      packageTariff.ID,
    );

    // Check if all pakages are of one consignee
    const consigneeIds = Array.from(new Set(packagesWithTariff.map(p => p.CONSIGNEE_ID)));
    if (consigneeIds.length > 1) {
      throw new BadRequestError('All packages must belong to the same consignee.');
    }

    const billInfo = {
      PRE_VAT_AMOUNT: packagesWithTariff.reduce(
        (total, current) =>
          total +
          current.CBM *
            getDaysDifference(new Date(current.TIME_IN), pickupDate) *
            current.UNIT_PRICE *
            (1 - current.VAT_RATE),
        0,
      ),
      VAT_AMOUNT: packagesWithTariff.reduce(
        (total, current) =>
          total +
          current.CBM *
            getDaysDifference(new Date(current.TIME_IN), pickupDate) *
            current.UNIT_PRICE *
            current.VAT_RATE,
        0,
      ),
      TOTAL_AMOUNT: packagesWithTariff.reduce(
        (total, current) =>
          total +
          current.CBM *
            getDaysDifference(new Date(current.TIME_IN), pickupDate) *
            current.UNIT_PRICE,
        0,
      ),
      details: packagesWithTariff.map(p => ({
        PACKAGE_ID: p.ID,
        HOUSE_BILL: p.HOUSE_BILL,
        CBM: p.CBM,
        UNIT_PRICE: p.UNIT_PRICE,
        VAT_RATE: p.VAT_RATE,
        TIME_IN: p.TIME_IN,
        PRE_VAT_AMOUNT:
          p.CBM *
          getDaysDifference(new Date(p.TIME_IN), pickupDate) *
          p.UNIT_PRICE *
          (1 - p.VAT_RATE),
        VAT_AMOUNT:
          p.CBM * getDaysDifference(new Date(p.TIME_IN), pickupDate) * p.UNIT_PRICE * p.VAT_RATE,
        TOTAL_AMOUNT: p.CBM * getDaysDifference(new Date(p.TIME_IN), pickupDate) * p.UNIT_PRICE,
      })),
    };

    return billInfo;
  };
}
export default ExportOrderService;
