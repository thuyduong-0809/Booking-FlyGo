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

  async sendPaymentConfirmationEmail(
    email: string,
    bookingReference: string,
    totalAmount: number,
    paymentMethod: string,
    flightDetails: any
  ): Promise<boolean> {
    try {
      const formatVnd = (n: number) => {
        return new Intl.NumberFormat('vi-VN', {
          style: 'currency',
          currency: 'VND',
        }).format(n);
      };

      const mailOptions = {
        from: this.configService.get<string>('EMAIL_USER'),
        to: email,
        subject: `Xác nhận thanh toán thành công - Mã đặt chỗ: ${bookingReference}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; color: white;">
              <h1 style="margin: 0; font-size: 28px;">✓ Thanh toán thành công!</h1>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 30px;">
              <p style="color: #333; font-size: 16px; margin-bottom: 20px;">Xin chào,</p>
              <p style="color: #666; font-size: 16px; margin-bottom: 30px;">
                Cảm ơn bạn đã sử dụng dịch vụ của FlyGo! Thanh toán của bạn đã được xác nhận thành công.
              </p>
              
              <div style="background-color: white; padding: 20px; border-radius: 10px; margin-bottom: 20px;">
                <h3 style="color: #333; margin-top: 0;">📋 Thông tin đặt chỗ</h3>
                <div style="margin-top: 15px;">
                  <p style="margin: 5px 0; color: #666;"><strong style="color: #333;">Mã đặt chỗ:</strong> ${bookingReference}</p>
                  <p style="margin: 5px 0; color: #666;"><strong style="color: #333;">Phương thức thanh toán:</strong> ${paymentMethod}</p>
                  <p style="margin: 5px 0; color: #666;"><strong style="color: #333;">Tổng tiền đã thanh toán:</strong> ${formatVnd(totalAmount)}</p>
                </div>
              </div>

              <div style="background-color: white; padding: 20px; border-radius: 10px;">
                <h3 style="color: #333; margin-top: 0;">✈️ Thông tin chuyến bay</h3>
                ${flightDetails}
              </div>

              <div style="margin-top: 30px; padding: 20px; background-color: #e3f2fd; border-radius: 10px;">
                <p style="color: #1976d2; font-size: 14px; margin: 0;">
                  <strong>📌 Lưu ý:</strong> Vui lòng đến sân bay sớm ít nhất 2 giờ trước giờ khởi hành. 
                  Bạn có thể check-in online 48 giờ trước chuyến bay.
                </p>
              </div>
              
              <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
              <p style="color: #999; font-size: 14px; text-align: center;">
                FlyGo - Đặt vé máy bay uy tín<br>
                📞 Hotline: 1900-xxxx | 📧 Email: support@flygo.vn
              </p>
            </div>
          </div>
        `,
      };

      await this.transporter.sendMail(mailOptions);
      console.log('✅ Payment confirmation email sent to:', email);
      return true;
    } catch (error) {
      console.error('❌ Error sending payment confirmation email:', error);
      return false;
    }
  }
}
