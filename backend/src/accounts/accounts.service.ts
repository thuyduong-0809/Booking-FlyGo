import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateLocalAccountDto } from 'src/accounts/dto/create-localAccount.dto';
import { Account } from 'src/accounts/entities/accounts.entity';
import { common_response } from 'src/untils/common';
import { CreateUserDto } from 'src/users/dto/create_user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { User } from 'src/users/entities/users.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AccountsService {
    
   constructor(@InjectRepository(Account) private accountRepository:Repository<Account>,
               @InjectRepository(User) private userRepository: Repository<User>,){}

    async create(createLocalAccountDto: CreateLocalAccountDto): Promise<Account> {
             let response = common_response;
            try {
                const { email, password } = createLocalAccountDto;
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
               response.success = false;
               response.message = "An unexpected error occurred."
               response.statusCode=500
            }
            return response;
      
          
     
       }

       
  private async hashPassword(password: string): Promise<string> {
    const saltRound = 10;
    const salt = await bcrypt.genSalt(saltRound);
    const hash = await bcrypt.hash(password, saltRound);
    return hash;
  }

    


}
