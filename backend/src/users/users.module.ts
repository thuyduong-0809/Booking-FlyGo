import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRole } from 'src/user-roles/entities/user-roles.entity';
import { User } from 'src/users/entities/users.entity';
import { UsersController } from 'src/users/users.controller';
import { UsersService } from 'src/users/users.service';

@Module({
    imports:[TypeOrmModule.forFeature([User,UserRole])],
    providers:[UsersService],
    controllers:[UsersController]
})
export class UsersModule {}
