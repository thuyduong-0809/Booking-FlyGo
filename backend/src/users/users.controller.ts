import { Body, Controller, Get, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create_user.dto';
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

    

}
