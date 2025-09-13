import { Body, Controller, Delete, Get, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create_user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { User } from 'src/users/entities/users.entity';
import { UsersService } from 'src/users/users.service';

@Controller('users')
export class UsersController {
      constructor(private userService: UsersService) {}
       @Get()
        FindAll():Promise<User[]>{
        return this.userService.findAll();

    }
    @UsePipes(ValidationPipe)
        @Post()
        create(@Body() createUserDto:CreateUserDto):Promise<User>{
        return this.userService.create(createUserDto);
                
     }

    @Get(':id')
    findOne(@Param('id') id:string):Promise<User>{
    return this.userService.findOne(Number(id));
    }

    @UsePipes(ValidationPipe)
    @Put(':id')
    update(@Param('id') id:string,@Body() updateUserDto:UpdateUserDto){
        return this.userService.update(Number(id),updateUserDto);
    }
    
    @Delete(':id')
    delete(@Param('id') id:string){
        return this.userService.delete(Number(id));
    }  

}
