import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { common_response } from 'src/untils/common';
import { CreateUserDto } from 'src/users/dto/create_user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { User } from 'src/users/entities/users.entity';
import { Repository, UpdateResult } from 'typeorm';
import { DeleteResult } from 'typeorm/browser';

@Injectable()
export class UsersService {
     constructor(@InjectRepository(User) private userRepository:Repository<User>){}

     async findAll():Promise<User[]>{
        let response = common_response;
        try {
            let users = await this.userRepository.find({
               select:['id','full_name','email','phone','cccd','sex','country','role','status_verify','avatar','refresh_token','created_at','updated_at']
            })
            if(users){
               response.success = true;
               response.data = users;
               return response;
            }else{
                response.success = false;
               
            }
            return response;
      
        } catch (error) {

            response.success = false;
            response.message = "An unexpected error occurred."
            response.statusCode=500
        }
        return response;
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
          let response = common_response;
         try {
             const user = await this.userRepository.save({...createUserDto});
             if(user){
                response.success = true;
                response.data = user;
                return response;
             }else{
                response.success = false;
                
             }
         } catch (error) {
            response.success = false;
            response.message = "An unexpected error occurred."
            response.statusCode=500
         }
         return response;
   
       
  
    }

     async findOne(id:number):Promise<User>{
      let response = common_response;
      let user = await this.userRepository.findOne({
            where:{id:id},
            select:['id','full_name','email','phone','cccd','sex','country','role','status_verify','avatar','refresh_token','created_at','updated_at'],
            // relations:['videos']
      })
      if(user){
        response.success = true;
        response.data = user;
        return response;
      }else{
        response.success = false;
        response.message = 'user có id này không tồn tại'

      }
      return response;
    }

     async update(id:number,updateUserDto:UpdateUserDto):Promise<UpdateResult>{
      let response = common_response;
      
      
      let updateUser =  await this.userRepository.update(id,updateUserDto);
      if(updateUser){
        response.success = true;
        return response;
      } else if (!updateUserDto.full_name){
        response.success = false;
        response.message = 'Full name cannot be empty';
      }else{
        response.success = false;
      }
    
      return response;
    }

    
    async delete(id:number):Promise<DeleteResult>{
      let response = common_response;
     try {

     
      let deleteUser  = await this.userRepository.delete(id);
      if(deleteUser){
        response.success = true;
        return response;
      }
      else{
        response.success = false
        response.message= "user invalid"
      }
        return response;
      
     } catch (error) {

      response.success = false;
          response.message = error.message || 'An error occurred while deleting the user';
          return response;
      
     }
    }


}
