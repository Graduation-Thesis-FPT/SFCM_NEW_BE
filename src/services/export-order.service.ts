import { BadRequestError } from '../core/error.response';
import { getVoyageContainerPackagesByIds } from '../repositories/voyage-container-package.repo';

class ExportOrderService {
  static calculateExport = async (voyageContainerPackageIds: string[]) => {
    if (!voyageContainerPackageIds || voyageContainerPackageIds.length === 0) {
      throw new BadRequestError('voyageContainerPackageIds is required');
    }
    const packages = await getVoyageContainerPackagesByIds(voyageContainerPackageIds);
    return packages;
  };
}
export default ExportOrderService;
