import { getExportOrders } from '../repositories/export-order.repo';
import { getImportOrders } from '../repositories/import-order.repo';

class ImportExportOrderService {
  static getImportExportOrders = async ({
    consigneeId,
    shipperId,
    from,
    to,
    returnImport,
    returnExport,
  }: {
    consigneeId?: string;
    shipperId?: string;
    from?: string;
    to?: string;
    returnImport?: boolean;
    returnExport?: boolean;
  }) => {
    const result: {
      importOrders: any[];
      exportOrders: any[];
    } = {
      importOrders: [],
      exportOrders: [],
    };

    if (returnImport) {
      const importOrders = await getImportOrders({
        shipperId,
        from,
        to,
      });
      // console.log(importOrders);
      result.importOrders = importOrders;
    }
    if (returnExport) {
      const exportOrders = await getExportOrders({
        consigneeId,
        from,
        to,
      });
      // console.log(exportOrders);
      result.exportOrders = exportOrders;
    }
    return result;
  };
}
export default ImportExportOrderService;
