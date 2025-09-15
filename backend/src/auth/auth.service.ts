import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Account } from 'src/accounts/entities/accounts.entity';
import { User } from 'src/users/entities/users.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { RegisterLocalDto } from 'src/auth/dto/register-local.dto';
import { common_response } from 'src/untils/common';
import { LoginLocalDto } from 'src/auth/dto/login-local.dto';
import validator from 'validator';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
@Injectable()
export class AuthService {
    constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Account) private accountRepository: Repository<Account>,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

     async register(registerLocalDto:RegisterLocalDto): Promise<Account> {
                let response = { ...common_response };
                try {
                    const { email, password } = registerLocalDto;
                    let user = await this.userRepository.findOne({where:{email:email}})
                 
                    //chưa booking chưa có account 
                    if(!user){
                        user = this.userRepository.create({
                        email,
                        role: 'customer',   // mặc định customer khi đăng ký
                        });
                        user = await this.userRepository.save(user);
                    }
                    //đã booking
                    else{
                        //đã có account
                        if(user.role == 'customer' || user.role == 'admin'){
                            response.success = false;
                            response.message = 'Email đã được đăng ký';
                            response.statusCode = 400;
                            return response;
                        }
                        //chưa có account(đã booking)
                        else{
                             user.role = 'customer';
                             await this.userRepository.save(user);
                        }
                    }
    
                     // Tạo account gắn user
                    const hash_password = await this.hashPassword(password)
                    const account = this.accountRepository.create({
                    email,
                    password:hash_password, 
                    provider: 'local',
                    user,
                    });
    
    
                    await this.accountRepository.save(account);
                    response.success = true;
                    response.message = 'Tạo account thành công';
                    response.data = account;
                    response.statusCode = 201;
               
                } catch (error) {
                    console.error(error);
                    response.success = false;
                    response.message = error.message || "An unexpected error occurred.";
                    response.statusCode = 500;
                }
                return response;
          
              
         
           }



     async login(loginLocalDto: LoginLocalDto) {
          let response = { ...common_response };
          try {
            const account = await this.accountRepository.findOne({
              where: { email: loginLocalDto.email },
              relations: ['user'],
            });

            if (!account) {
              response.success = false;
              response.message = 'Account not existing.';
              response.errorCode = 'ACC_NOT_EXIST';
              return response;
            }

            if (!validator.isEmail(loginLocalDto.email)) {
              response.success = false;
              response.message = 'Email must be a valid email...';
              return response;
            }

            const checkPass = bcrypt.compareSync(
              loginLocalDto.password,
              account.password,
            );
            if (!checkPass) {
              response.success = false;
              response.message = 'Password incorrect.';
              response.errorCode = 'PASSWORD_INCORRECT';
              return response;
            }

            // Payload cho JWT
            const payload = {
              id: account.id, 
              email: account.email,
              role: account.user.role,
            };

            console.log(payload)

           const accessToken = await this.jwtService.signAsync(payload, {
              secret: process.env.JWT_ACCESS_SECRET,
              expiresIn: process.env.JWT_ACCESS_EXPIRE,
            });

            const refreshToken = await this.jwtService.signAsync(payload, {
              secret: process.env.JWT_REFRESH_SECRET,
              expiresIn: process.env.JWT_REFRESH_EXPIRE,
            });

             // Hash refresh token trước khi lưu DB
            const hashedRefresh = await bcrypt.hash(refreshToken, 10);
            account.refresh_token = hashedRefresh;
            await this.accountRepository.save(account);

            response.success = true;
            response.message = 'Login success';
            response.data = {
              account,
              accessToken,
              refreshToken,
            };
            return response;
          } catch (error) {
            response.success = false;
            response.message = error.message;
            response.statusCode = 500;
            return response;
          }
     }


     
           
      private async hashPassword(password: string): Promise<string> {
        const saltRound = 10;
        // const salt = await bcrypt.genSalt(saltRound);
        const hash = await bcrypt.hash(password, saltRound);
        return hash;
      }




    

}
