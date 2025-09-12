import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateUserDto } from 'src/users/dto/create_user.dto';
import { User } from 'src/users/entities/users.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
     constructor(@InjectRepository(User) private userRepository:Repository<User>){}

     async findAll():Promise<User[]>{
        // let response = common_response;
        let users = await this.userRepository.find({
            select:['id','full_name','email','role','status_verify','created_at','updated_at']
        })
        // if(users){
        //     response.success = true;
        //     response.data = users;
        //     return response;
        // }else{
        //     response.success = false
        // }
        return  users;
    }

    async create(createUserDto: CreateUserDto): Promise<User> {
        
        return await this.userRepository.save({...createUserDto});
       
  
    }
}
