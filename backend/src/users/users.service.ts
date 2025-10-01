import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { common_response } from 'src/untils/common';
import { UserRole } from 'src/user-roles/entities/user-roles.entity';
import { User } from 'src/users/entities/users.entity';
import { DeleteResult, QueryFailedError, Repository, UpdateResult } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(
          @InjectRepository(User) private userRepository: Repository<User>,
           @InjectRepository(UserRole) private userRoleRepository: Repository<UserRole>,
    ){}


     async findAll(): Promise<any> {
           let response = {...common_response};
        try {
            const users = await this.userRepository.find({
            select: [
                'userId', 'email', 'firstName', 'lastName', 'phone', 
                'dateOfBirth', 'passportNumber', 'passportExpiry', 
                'loyaltyPoints', 'loyaltyTier', 'isActive', 
                'createdAt', 'lastLogin'
            ],
            relations: ['role'], // load role của user
            });

            response.success = true;
            response.data = users;
        } catch (error) {
            console.error(error);
            response.success = false;
            response.message = 'Error fetching users';
        }
        return response;
        }

   
    async create(createUserDto:CreateUserDto):Promise<User>{
       let response = {...common_response};
       try {
          const hashPassword = await this.hashPassword(createUserDto.passwordHash);
          const user = await this.userRepository.save({
            ...createUserDto,
            passwordHash: hashPassword,
            roleId: createUserDto.roleId?? 1
            });
            if(user){
                response.success = true
                response.user = user
            }else{
                response.success = false
            }
            
       return response;
       } catch (error) {
          console.error('Error:', error); 
        if (error instanceof QueryFailedError) {
         if (error.driverError.code === 'ER_DUP_ENTRY') { 
                response.success = false;
                response.message = `User with email  ${createUserDto.email} already exists.`
                response.statusCode =400
                return response;
                // throw new BadRequestException(`Category with name  ${createCategoryDto.name} already exists.`);
                
                }
            }
            response.success = false;
            response.message = "An unexpected error occurred."
            response.statusCode=500
            
            // throw new InternalServerErrorException("An unexpected error occurred.");
            
            }
         return response;
       
    }

         async findOne(id:number): Promise<any> {
           let response = {...common_response};
        try {
            const user = await this.userRepository.findOneBy({userId:id})

            response.success = true;
            response.data = user;
        } catch (error) {
            console.error(error);
            response.success = false;
            response.message = 'Error fetching user by id';
        }
        return response;
        }


           
    async update(id:number,updateUserDto:UpdateUserDto):Promise<UpdateResult>{
       let response = {...common_response};
       try {
           
            if (updateUserDto.passwordHash) {
            
                const hashPassword = await this.hashPassword(updateUserDto.passwordHash);
                updateUserDto.passwordHash = hashPassword;
            }
            let updateUser =  await this.userRepository.update(id,updateUserDto);
                if(updateUser){
                    response.success = true;
                    return response;
                }else{
                    response.success = false;
                }

            return response;
       } catch (error) {
            response.success = false;
            response.message = "An unexpected error occurred."
            response.error=error
            }
         return response;
       
    }


    async delete(id:number):Promise<DeleteResult>{
      let response = {...common_response};
      try {
         let result = await this.userRepository.delete({userId:id})
         if(result.affected ==1){
           response.success = true;
         }else{
             response.success = false;
         }
        
         return response;

      } catch (error) {
            response.success = false;
            response.message = "An unexpected error occurred."
            response.error=error
      }
       return response;
    }



    private async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
    }



}
