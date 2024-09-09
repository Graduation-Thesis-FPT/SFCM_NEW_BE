import { OAuth2Client } from 'google-auth-library';

import nodemailer from 'nodemailer';
import { BadRequestError } from '../core/error.response';
import { EmailParams } from '../models/email.model';

class EmailService {
  static sendEmailInvoice = async (data: string) => {
    try {
      const myOAuth2Client = new OAuth2Client(
        process.env.GOOGLE_MAILER_CLIENT_ID,
        process.env.GOOGLE_MAILER_CLIENT_SECRET,
      );

      myOAuth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_MAILER_REFRESH_TOKEN,
      });

      const myAccessTokenObject = await myOAuth2Client.getAccessToken();

      const myAccessToken = myAccessTokenObject?.token;

      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.ADMIN_EMAIL_ADDRESS,
          clientId: process.env.GOOGLE_MAILER_CLIENT_ID,
          clientSecret: process.env.GOOGLE_MAILER_CLIENT_SECRET,
          refreshToken: process.env.GOOGLE_MAILER_REFRESH_TOKEN,
          accessToken: myAccessToken,
        },
      });

      const mailOptions = {
        to: 'vuanhlam000@gmail.com',
        subject: 'Thông báo về việc phát hành hóa đơn điện tử',
        html: `<!DOCTYPE html>
                <html lang="vi">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Thông báo Hóa đơn điện tử</title>
                    <style>
                        body {
                            margin: 0;
                            padding: 0;
                            background-color: #f4f4f4;
                        }
                        .container {
                            background-color: #fff;
                            padding: 20px;
                            border: 1px solid #ddd;
                            border-radius: 5px;
                            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
                            max-width: 600px;
                            margin: 20px auto;
                            font-size: 14px;
                            text-align: left;
                        }
                        h1 {
                            color: #333;
                            font-size: 18px;
                        }
                        p {
                            margin-bottom: 15px;
                        }
                        ul {
                            list-style: none;
                            padding: 0;
                        }
                        ul li {
                            margin-bottom: 10px;
                        }
                        a {
                            color: #1a73e8;
                            text-decoration: none;
                        }
                        @media (max-width: 600px) {
                            .container {
                                width: 100%;
                                margin: 10px;
                                padding: 15px;
                            }
                            h1 {
                                font-size: 16px;
                            }
                            .container ul li {
                                font-size: 12px;
                            }
                        }
                    </style>
                </head>
                <body>
                    <!-- Sử dụng bảng để căn giữa nội dung -->
                    <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #f4f4f4; height: 70vh;">
                        <tr>
                            <td align="center" valign="middle">
                                <!-- Container chính chứa nội dung -->
                                <div class="container">
                                    <h1>Kính gửi Quý khách hàng,</h1>
                                    <p>Xin trân trọng cảm ơn Quý khách hàng đã sử dụng dịch vụ Hóa đơn điện tử của PHÂN HIỆU TRƯỜNG ĐẠI HỌC FPT TẠI THÀNH PHỐ HỒ CHÍ MINH.</p>
                                    <p>Đơn vị PHÂN HIỆU TRƯỜNG ĐẠI HỌC FPT TẠI THÀNH PHỐ HỒ CHÍ MINH vừa phát hành hóa đơn điện tử tháng 7/2024 của Quý khách hàng Phạm Thiên Nhi.</p>

                                    <h2>1. Hóa đơn của khách hàng có:</h2>
                                    <ul>
                                        <li><strong>Mã số thuế đơn vị phát hành:</strong> 0102100740-011</li>
                                        <li><strong>Mẫu số:</strong> 1/001</li>
                                        <li><strong>Ký hiệu:</strong> K24TAA</li>
                                        <li><strong>Số hóa đơn:</strong> 00039840</li>
                                        <li><strong>Tên khách hàng:</strong> Phạm Thiên Nhi</li>
                                    </ul>

                                    <h2>2. Để xem chi tiết hóa đơn, Quý khách hàng vui lòng truy cập địa chỉ trang portal tra cứu hóa đơn:</h2>
                                    <p><a href="https://dhfpthcm-tt78.vnpt-invoice.com.vn">https://dhfpthcm-tt78.vnpt-invoice.com.vn</a></p>
                                    <ul>
                                        <li><strong>Mã tra cứu hóa đơn:</strong> 001194147</li>
                                        <li><strong>Để xem hóa đơn:</strong> <a href="https://dhfpthcm-tt78.vnpt-invoice.com.vn/view-invoice">Click tại đây để xem ngay</a></li>
                                        <li><strong>Để tải hóa đơn PDF:</strong> <a href="https://dhfpthcm-tt78.vnpt-invoice.com.vn/download-pdf">Click tại đây để tải PDF về máy</a></li>
                                        <li><strong>Để tải XML hóa đơn:</strong> <a href="https://dhfpthcm-tt78.vnpt-invoice.com.vn/download-xml">Click tại đây để tải XML về máy</a></li>
                                    </ul>

                                    <p>Trân trọng cảm ơn Quý khách và chúc Quý khách nhiều thành công khi sử dụng dịch vụ!</p>
                                </div>
                            </td>
                        </tr>
                    </table>
                </body>
                </html>

              `,
      };

      await transporter.sendMail(mailOptions);

      return {
        message: 'Email sent successfully',
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestError(error.response);
    }
  };

  static sendEmailAccountToCustomer = async (data: EmailParams, sender: string) => {
    try {
      const myOAuth2Client = new OAuth2Client(
        process.env.GOOGLE_MAILER_CLIENT_ID,
        process.env.GOOGLE_MAILER_CLIENT_SECRET,
      );

      myOAuth2Client.setCredentials({
        refresh_token: process.env.GOOGLE_MAILER_REFRESH_TOKEN,
      });

      const myAccessTokenObject = await myOAuth2Client.getAccessToken();

      const myAccessToken = myAccessTokenObject?.token;

      const transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
          type: 'OAuth2',
          user: process.env.ADMIN_EMAIL_ADDRESS,
          clientId: process.env.GOOGLE_MAILER_CLIENT_ID,
          clientSecret: process.env.GOOGLE_MAILER_CLIENT_SECRET,
          refreshToken: process.env.GOOGLE_MAILER_REFRESH_TOKEN,
          accessToken: myAccessToken,
        },
      });

      const mailOptions = {
        to: sender,
        subject: 'Thông tin tài khoản mật khẩu đăng nhập vào hệ thống SFCM',
        html: `<!DOCTYPE html>
                <html lang="en">
                  <head>
                    <meta charset="UTF-8" />
                    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                    <title>User Account Info</title>
                    <style>
                      body {
                        margin: 0;
                        padding: 0;
                        background-color: #f4f4f4;
                      }

                      .info-card {
                        background-color: white;
                        border-radius: 15px;
                        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
                        padding: 40px;
                        text-align: center;
                        width: 400px;
                        border: 1px dashed #ccc;
                        margin: 0 auto;
                      }

                      .info-card h2 {
                        margin-bottom: 20px;
                        color: #333;
                      }

                      .info-card .info-item {
                        background-color: #f4f4f4;
                        padding: 15px;
                        margin: 10px 0;
                        border-radius: 8px;
                        font-size: 18px;
                        color: #555;
                        box-shadow: inset 0 2px 5px rgba(0, 0, 0, 0.05);
                      }

                      .info-card .info-item strong {
                        display: block;
                        font-size: 16px;
                        color: #333;
                        margin-bottom: 5px;
                      }

                      .email-link {
                        display: block;
                        margin-top: 20px;
                        text-decoration: none;
                        color: white;
                        background-color: #007bff;
                        padding: 10px 20px;
                        border-radius: 5px;
                        transition: background-color 0.3s ease;
                      }

                      .email-link:hover {
                        background-color: #0056b3;
                      }
                    </style>
                  </head>
                  <body>
                    <!-- Bảng chứa toàn bộ nội dung email -->
                    <table
                      width="100%"
                      cellpadding="0"
                      cellspacing="0"
                      border="0"
                      style="background-color: #f4f4f4; height: 70vh;"
                    >
                      <tr>
                        <td align="center" valign="middle">
                          <!-- Bảng căn giữa nội dung -->
                          <div class="info-card">
                            <h2 class="title">Tài khoản đăng nhập</h2>

                            <div class="info-item">
                              <strong>Tên đăng nhập</strong>
                              ${data.account}
                            </div>

                            <div class="info-item">
                              <strong>Mật khẩu</strong>
                              ${data.password}
                            </div>

                            <div class="info-item">
                              <strong>Website</strong>
                              <a
                                href="${data.webUrl}"
                                style="color: blue;"
                                target="_blank"
                                >${data.webUrl}</a
                              >
                            </div>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </body>
                </html>

              `,
      };

      await transporter.sendMail(mailOptions);

      return {
        message: 'Email sent successfully',
      };
    } catch (error) {
      console.log(error);
      throw new BadRequestError(error.response);
    }
  };
}
export default EmailService;
