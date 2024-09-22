import fs from 'fs';
import path from 'path';
// import { findMaxDraftNo } from '../repositories/delivery-order.repo';
import { findMaxOrderNo } from '../repositories/import-order.repo';
import moment from 'moment';

const genOrderNo = async (methodCode: string) => {
  const initValue = '1';

  const formattedDate = moment(new Date()).format('YYMMDD');
  let order_no;

  const date = moment(new Date()).format('MM-YYYY');

  const filePath = path.join(__dirname, `../helpers/order_no/order_no_${date}.txt`);

  // trường hợp file chưa tồn tại
  // (1) tạo file
  // (2) query lấy max order no
  //     (2.1) nếu order no max tồn tại khởi tạo file với giá trị order no là max -> gán vào key
  //     (2.2) nếu order no max không tồn tại khởi tạo file với giá trị là 1 -> gán vào key
  if (!fs.existsSync(filePath)) {
    const max = await findMaxOrderNo();

    if (max.lastThreeDigits) {
      fs.writeFileSync(filePath, max.lastThreeDigits.toString());
      order_no = max.lastThreeDigits.toString().padStart(4, '0');
    } else {
      fs.writeFileSync(filePath, initValue);
      order_no = initValue.toString().padStart(4, '0');
    }
  } else {
    // trường hợp file tồn tại
    // (1) đọc file lấy giá trị đã ghi tư trước + 1
    // (2) sau khi giá trị + 1 ghi lại vào file
    order_no = Number.parseInt(fs.readFileSync(filePath, 'utf-8')) + 1;
    order_no = order_no.toString().padStart(4, '0');
    fs.writeFileSync(filePath, order_no.toString());
  }

  const key = methodCode.toUpperCase() + formattedDate + order_no;
  return key;
};

// const genDraftNo = async () => {
//   const draftStr = 'DR/';
//   const year = moment(new Date()).format('YYYY');
//   const draftNum = '0000000';
//   const initValue = '1';
//   let draft_no;

//   const filePath = path.join(__dirname, `../helpers/draft_no/draft_no_${year}.txt`);

//   const max = await findMaxDraftNo();
//   if (!fs.existsSync(filePath)) {
//     if (max.maxDraftNo) {
//       fs.writeFileSync(filePath, max.maxDraftNo.toString());
//       draft_no = max.maxDraftNo;
//     } else {
//       fs.writeFileSync(filePath, initValue);
//       draft_no = initValue;
//     }
//   } else {
//     draft_no = Number.parseInt(fs.readFileSync(filePath, 'utf-8')) + 1;
//     draft_no = draft_no.toString();
//     fs.writeFileSync(filePath, draft_no.toString());
//   }

//   const key = draftStr + year + '/' + (draftNum + draft_no).slice(-7);

//   return key;
// };

export {
  genOrderNo,
  // , genDraftNo
};
