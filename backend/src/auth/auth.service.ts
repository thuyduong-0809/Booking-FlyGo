import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { QueryFailedError, Repository } from 'typeorm';
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
  ) { }

  async register(registerLocalDto: RegisterLocalDto): Promise<any> {
    let response = { ...common_response };

    try {
      // hash password
      const password = await this.hashPassword(registerLocalDto.passwordHash)

      // tạo user
      const newUser = this.userRepository.create({
        email: registerLocalDto.email,
        passwordHash: password,
        firstName: registerLocalDto.firstName,
        lastName: registerLocalDto.lastName,
        roleId: 1, // default Passenger
      });

      const savedUser = await this.userRepository.save(newUser);

      response.success = true;
      response.data = {
        userId: savedUser.userId,
        email: savedUser.email,
        firstName: savedUser.firstName,
        lastName: savedUser.lastName,
        roleId: savedUser.roleId,
      };
      return response;
    } catch (error) {
      console.error('Register error:', error);

      if (error instanceof QueryFailedError && error.driverError.code === 'ER_DUP_ENTRY') {
        response.success = false;
        response.message = `User with email ${registerLocalDto.email} already exists.`;
        response.statusCode = 400;
        return response;
      }

      response.success = false;
      response.message = 'An unexpected error occurred during registration.';
      response.statusCode = 500;
      return response;
    }

  }

  async validateUserLocal(email: string, password: string): Promise<any> {
    const user = await this.userRepository.findOne({
      where: { email },
      relations: ['role'],
    });


    if (!user) {
      return null; // không tìm thấy user
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return null; // sai mật khẩu
    }

    // Bỏ PasswordHash trước khi return
    const { passwordHash, ...result } = user;
    return result;
  }

  async login(user: User) {
    let response = { ...common_response };

    try {
      // user được lấy từ LocalStrategy -> req.user
      const payload = {
        userId: user.userId,
        email: user.email,
        role: user.role.roleName
      };

      const accessToken = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_ACCESS_SECRET,
        expiresIn: process.env.JWT_ACCESS_EXPIRE,
      });

      const refreshToken = await this.jwtService.signAsync(payload, {
        secret: process.env.JWT_REFRESH_SECRET,
        expiresIn: process.env.JWT_REFRESH_EXPIRE,
      });

      response.success = true;
      response.message = 'Login success';
      response.data = {
        accessToken,
        refreshToken,
        user: payload,
      };

      return response;
    } catch (error) {
      response.success = false;
      response.message = error.message || 'Login failed';
      response.statusCode = 500;
      return response;
    }
  }




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
  private pendingRegistrations = new Map<string, { email: string; passwordHash: string; firstName: string; lastName: string }>();

  async sendOtp(sendOtpDto: SendOtpDto) {
    let response = { ...common_response };
    try {
      const { email } = sendOtpDto;

      // Kiểm tra xem email đã được đăng ký chưa
      const existingUser = await this.userRepository.findOne({ where: { email } });
      // const existingAccount = await this.accountRepository.findOne({ where: { email } });

      if (existingUser) {
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

      const { passwordHash, firstName, lastName } = pendingData;

      // Tạo user và account

      let user = await this.userRepository.findOne({ where: { email } });


      if (!user) {
        const hash_password = await this.hashPassword(passwordHash);
        user = this.userRepository.create({
          email,
          passwordHash: hash_password,
          firstName: firstName || '',
          lastName: lastName || ''
        });
        user = await this.userRepository.save(user);
      } else {
        await this.userRepository.save(user);
      }



      // Xóa thông tin tạm thời
      this.pendingRegistrations.delete(email);

      response.success = true;
      response.message = 'Đăng ký thành công';
      response.data = user;
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
      const { email, passwordHash, firstName, lastName } = registerLocalDto;

      // Kiểm tra xem email đã được đăng ký chưa
      const existingUser = await this.userRepository.findOne({ where: { email } });

      if (existingUser) {
        response.success = false;
        response.message = 'Email đã được đăng ký';
        response.errorCode = 'USER_EXISTS';
        return response;
      }

      // Lưu thông tin đăng ký tạm thời
      this.pendingRegistrations.set(email, { email, passwordHash, firstName, lastName });

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
