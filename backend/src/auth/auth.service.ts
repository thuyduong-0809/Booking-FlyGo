import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterLocalDto } from 'src/auth/dto/register-local.dto';
import { common_response } from 'src/untils/common';
import { LoginLocalDto } from 'src/auth/dto/login-local.dto';
import { SendOtpDto } from 'src/auth/dto/send-otp.dto';
import { VerifyOtpDto } from 'src/auth/dto/verify-otp.dto';
import validator from 'validator';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { EmailService } from 'src/email/email.service';
import { OtpService } from 'src/otp/otp.service';
import { User } from 'src/users/entities/users.entity';
import { UserRole } from 'src/user-roles/entities/user-roles.entity';

@Injectable()
export class AuthService {
    constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(UserRole) private userRoleRepository: Repository<UserRole>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
    private otpService: OtpService,
  ) {}

    //  async register(registerLocalDto:RegisterLocalDto): Promise<Account> {
    //             let response = { ...common_response };
    //             try {
    //                 const { email, password } = registerLocalDto;
    //                 let user = await this.userRepository.findOne({where:{email:email}})
                 
    //                 //chưa booking chưa có account 
    //                 if(!user){
    //                     user = this.userRepository.create({
    //                     email,
    //                     role: 'customer',   // mặc định customer khi đăng ký
    //                     });
    //                     user = await this.userRepository.save(user);
    //                 }
    //                 //đã booking
    //                 else{
    //                     //đã có account
    //                     if(user.role == 'customer' || user.role == 'admin'){
    //                         response.success = false;
    //                         response.message = 'Email đã được đăng ký';
    //                         response.statusCode = 400;
    //                         return response;
    //                     }
    //                     //chưa có account(đã booking)
    //                     else{
    //                          user.role = 'customer';
    //                          await this.userRepository.save(user);
    //                     }
    //                 }
    
    //                  // Tạo account gắn user
    //                 const hash_password = await this.hashPassword(password)
    //                 const account = this.accountRepository.create({
    //                 email,
    //                 password:hash_password, 
    //                 provider: 'local',
    //                 user,
    //                 });
    
    //                 const existingAccount = await this.accountRepository.findOne({ where: { email: email } });
    //                   if (existingAccount) {
    //                   response.success = false;
    //                   response.message = 'You are already registered. Please log in.';
    //                   response.errorCode = 'Account_EXISTS';
    //                   return response;
    //                 }
    //                 await this.accountRepository.save(account);
    //                 response.success = true;
    //                 response.message = 'Tạo account thành công';
    //                 response.data = account;
    //                 response.statusCode = 201;
               
    //             } catch (error) {
    //                 console.error(error);
    //                 response.success = false;
    //                 response.message = error.message || "An unexpected error occurred.";
    //                 response.statusCode = 500;
    //             }
    //             return response;
          
              
         
    //        }



      //  async login(account: Account) {
           

      //       let response = { ...common_response };


      //       let account_invalid = await this.accountRepository.findOne({where:{email:account.email}})
      //       if(!account_invalid){
      //             response.success = false;
      //             response.errorCode = 'Account_INVALID';
      //             return response;

      //       }
      //       const payload = { id: account.id, email: account.email, role: account.user.role };

      //       const accessToken = await this.jwtService.signAsync(payload, {
      //         secret: process.env.JWT_ACCESS_SECRET,
      //         expiresIn: process.env.JWT_ACCESS_EXPIRE,
      //       });

      //       const refreshToken = await this.jwtService.signAsync(payload, {
      //         secret: process.env.JWT_REFRESH_SECRET,
      //         expiresIn: process.env.JWT_REFRESH_EXPIRE,
      //       });
      //       response.success = true;
      //       response.message = 'Login success';
      //       response.data={
      //           accessToken,
      //           refreshToken,
      //           payload
      //       }
      //       return response;
             
      //  }     

     // dùng cho LocalStrategy
      // async validateAccountLocal(email: string, password: string): Promise<any> {
        
      //  const account = await this.accountRepository.findOne({
      //       where: { email },
      //       relations: ['user'],
      //   });

      //   if (account && (await bcrypt.compare(password, account.password))) {
      //     const { password, ...result } = account;
      //     return result;
      //   }
      //    return null;
      // }


       // dùng cho GoogleStrategy

  // async validateAccountGoogle(email: string): Promise<any> {
 
  //     let account = await this.accountRepository.findOne({
  //       where: { email },
  //       relations: ['user'],
  //     });

  //     if (!account) {
  //       // nếu chưa có thì tạo user + account mới (provider = google)
  //       let user = this.userRepository.create({
  //         email,
  //         role: 'customer',
  //       });
  //       user = await this.userRepository.save(user);

  //       account = this.accountRepository.create({
  //         email,
  //         provider: 'google',
  //         user,
  //       });
  //       await this.accountRepository.save(account);
  //     }

  //     return account;
  //  }

    

     
           
      private async hashPassword(password: string): Promise<string> {
        const saltRound = 10;
        // const salt = await bcrypt.genSalt(saltRound);
        const hash = await bcrypt.hash(password, saltRound);
        return hash;
      }

      // Lưu thông tin đăng ký tạm thời (chưa tạo account)
      private pendingRegistrations = new Map<string, { email: string; password: string }>();

      async sendOtp(sendOtpDto: SendOtpDto) {
        let response = { ...common_response };
        try {
          const { email } = sendOtpDto;
          
          // Kiểm tra xem email đã được đăng ký chưa
          const existingUser = await this.userRepository.findOne({ where: { email } });
          const existingAccount = await this.accountRepository.findOne({ where: { email } });
          
          if (existingUser && existingAccount && existingUser.role !== 'guest') {
            response.success = false;
            response.message = 'Email đã được đăng ký';
            response.errorCode = 'USER_EXISTS';
            return response;
          }

          // Tạo OTP
          const otp = this.otpService.generateOtp();
          this.otpService.storeOtp(email, otp);

          // Gửi email OTP
          const emailSent = await this.emailService.sendOtpEmail(email, otp);
          
          if (emailSent) {
            response.success = true;
            response.message = 'OTP đã được gửi đến email của bạn';
            response.statusCode = 200;
          } else {
            response.success = false;
            response.message = 'Không thể gửi email OTP';
            response.statusCode = 500;
          }
        } catch (error) {
          console.error(error);
          response.success = false;
          response.message = error.message || "Có lỗi xảy ra khi gửi OTP";
          response.statusCode = 500;
        }
        return response;
      }

      async verifyOtpAndRegister(verifyOtpDto: VerifyOtpDto) {
        let response = { ...common_response };
        try {
          const { email, otp } = verifyOtpDto;

          // Xác thực OTP
          const isValidOtp = this.otpService.verifyOtp(email, otp);
          if (!isValidOtp) {
            response.success = false;
            response.message = 'OTP không hợp lệ hoặc đã hết hạn';
            response.statusCode = 400;
            return response;
          }

          // Lấy thông tin đăng ký tạm thời
          const pendingData = this.pendingRegistrations.get(email);
          if (!pendingData) {
            response.success = false;
            response.message = 'Không tìm thấy thông tin đăng ký';
            response.statusCode = 400;
            return response;
          }

          const { password } = pendingData;

          // Tạo user và account
          let user = await this.userRepository.findOne({ where: { email } });
          
          if (!user) {
            user = this.userRepository.create({
              email,
              role: 'customer',
            });
            user = await this.userRepository.save(user);
          } else {
            user.role = 'customer';
            await this.userRepository.save(user);
          }

          // Tạo account
          const hash_password = await this.hashPassword(password);
          const account = this.accountRepository.create({
            email,
            password: hash_password,
            provider: 'local',
            user,
          });

          await this.accountRepository.save(account);

          // Xóa thông tin tạm thời
          this.pendingRegistrations.delete(email);

          response.success = true;
          response.message = 'Đăng ký thành công';
          response.data = account;
          response.statusCode = 201;

        } catch (error) {
          console.error(error);
          response.success = false;
          response.message = error.message || "Có lỗi xảy ra khi xác thực OTP";
          response.statusCode = 500;
        }
        return response;
      }

      // Cập nhật method register để lưu thông tin tạm thời thay vì tạo account ngay
      async registerPending(registerLocalDto: RegisterLocalDto) {
        let response = { ...common_response };
        try {
          const { email, password } = registerLocalDto;
          
          // Kiểm tra xem email đã được đăng ký chưa
          const existingUser = await this.userRepository.findOne({ where: { email } });
          const existingAccount = await this.accountRepository.findOne({ where: { email } });
          
          if (existingUser && existingAccount && existingUser.role !== 'guest') {
            response.success = false;
            response.message = 'Email đã được đăng ký';
            response.errorCode = 'USER_EXISTS';
            return response;
          }

          // Lưu thông tin đăng ký tạm thời
          this.pendingRegistrations.set(email, { email, password });

          response.success = true;
          response.message = 'Thông tin đăng ký đã được lưu. Vui lòng xác thực OTP.';
          response.statusCode = 200;

        } catch (error) {
          console.error(error);
          response.success = false;
          response.message = error.message || "Có lỗi xảy ra khi đăng ký";
          response.statusCode = 500;
        }
        return response;
      }
}
