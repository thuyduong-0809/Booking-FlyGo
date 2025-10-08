import { Body, Controller, Delete, Get, Param, Post, Put, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { RolesGuard } from 'src/auth/guards/roles.guard';
import { Role } from 'src/auth/roles/role.enum';
import { Roles } from 'src/auth/roles/roles.decorator';
import { CreateUserDto } from 'src/users/dto/create-user.dto';
import { UpdateUserDto } from 'src/users/dto/update-user.dto';
import { User } from 'src/users/entities/users.entity';
import { UsersService } from 'src/users/users.service';

@Controller('users')
export class UsersController {
    constructor(private userService:UsersService){}

    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(Role.SystemAdmin,Role.CheckInStaff)
    @Get()
    FindAll(){
        return this.userService.findAll();
    }

    @UseGuards(JwtAuthGuard)
    @Get(':id')
    FindOne(@Param('id') id:string){
        return this.userService.findOne(Number(id));
    }

    @UseGuards(JwtAuthGuard,RolesGuard)
    @Roles(Role.SystemAdmin)
    @UsePipes(ValidationPipe)
    @Post()
    create(@Body() createUserDto:CreateUserDto){
        return this.userService.create(createUserDto);
    }
    
    @UseGuards(JwtAuthGuard)
    @Put(':id')
    update(@Param('id') id:string,@Body() updateUserDto:UpdateUserDto){
        return this.userService.update(Number(id),updateUserDto)
    }
    
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    delete(@Param('id') id:string){
        return this.userService.delete(Number(id))
    }


}
