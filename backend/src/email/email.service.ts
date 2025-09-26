import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async sendOtpEmail(email: string, otp: string): Promise<boolean> {
    try {
      const mailOptions = {
        from: this.configService.get<string>('EMAIL_USER'),
        to: email,
        subject: 'Mã OTP xác thực tài khoản FlyGo',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 10px;">
              <h2 style="color: #333; text-align: center;">Xác thực tài khoản FlyGo</h2>
              <p style="color: #666; font-size: 16px;">Chào bạn,</p>
              <p style="color: #666; font-size: 16px;">Bạn đã đăng ký tài khoản tại FlyGo. Để hoàn tất quá trình đăng ký, vui lòng sử dụng mã OTP sau:</p>
              
              <div style="text-align: center; margin: 30px 0;">
                <div style="background-color: #007bff; color: white; font-size: 32px; font-weight: bold; padding: 20px; border-radius: 10px; letter-spacing: 10px; display: inline-block;">
                  ${otp}
                </div>
              </div>
              
              <p style="color: #666; font-size: 16px;">Mã OTP này có hiệu lực trong 10 phút.</p>
              <p style="color: #666; font-size: 16px;">Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 14px; text-align: center;">FlyGo - Đặt vé máy bay uy tín</p>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Lỗi gửi email:', error);
      return false;
    }
  }
}
