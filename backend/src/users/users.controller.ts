import { Body, Controller, Delete, Get, Param, Post, Put } from '@nestjs/common';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { User } from 'src/users/entities/users.entity';
import { UsersService } from 'src/users/users.service';

@Controller('users')
export class UsersController {
    constructor(private userService:UsersService){}
    @Get()
    FindAll(){
        // console.log(query);
        return this.userService.findAll();
    }

    @Get(':id')
    FindOne(@Param('id') id:string){
        // console.log(query);
        return this.userService.findOne(Number(id));
    }

    // @UseGuards(AuthGuard)
    // @UsePipes(ValidationPipe)
    @Post()
    create(@Body() createUserDto:CreateUserDto){
        return this.userService.create(createUserDto);
    }

    @Put(':id')
    update(@Param('id') id:string,@Body() updateUserDto:UpdateUserDto){
        return this.userService.update(Number(id),updateUserDto)
    }

    @Delete(':id')
    delete(@Param('id') id:string){
        return this.userService.delete(Number(id))
    }









}
