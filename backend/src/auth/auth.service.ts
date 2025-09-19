import { Injectable, UnauthorizedException } from '@nestjs/common';
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
    
                    const existingAccount = await this.accountRepository.findOne({ where: { email: email } });
                      if (existingAccount) {
                      response.success = false;
                      response.message = 'You are already registered. Please log in.';
                      response.errorCode = 'Account_EXISTS';
                      return response;
                    }
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



       async login(account: Account) {
           

            // if (!accountWithUser || !accountWithUser.user) {
            //     throw new UnauthorizedException('User not found');
            let response = { ...common_response };
            //  }

            let account_invalid = await this.accountRepository.findOne({where:{email:account.email}})
            if(!account_invalid){
                  response.success = false;
                  response.errorCode = 'Account_INVALID';
                  return response;

            }
            const payload = { id: account.id, email: account.email, role: account.user.role };

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
            response.data={
                accessToken,
                refreshToken,
                payload
            }
            return response;
             
       }     

     // dùng cho LocalStrategy
      async validateAccountLocal(email: string, password: string): Promise<any> {
        
       const account = await this.accountRepository.findOne({
            where: { email },
            relations: ['user'],
        });

        if (account && (await bcrypt.compare(password, account.password))) {
          const { password, ...result } = account;
          return result;
        }
         return null;
      }


       // dùng cho GoogleStrategy

  async validateAccountGoogle(email: string): Promise<any> {
 
      let account = await this.accountRepository.findOne({
        where: { email },
        relations: ['user'],
      });

      if (!account) {
        // nếu chưa có thì tạo user + account mới (provider = google)
        let user = this.userRepository.create({
          email,
          role: 'customer',
        });
        user = await this.userRepository.save(user);

        account = this.accountRepository.create({
          email,
          provider: 'google',
          user,
        });
        await this.accountRepository.save(account);
      }

      return account;
   }

    

     
           
      private async hashPassword(password: string): Promise<string> {
        const saltRound = 10;
        // const salt = await bcrypt.genSalt(saltRound);
        const hash = await bcrypt.hash(password, saltRound);
        return hash;
      }




    

}
