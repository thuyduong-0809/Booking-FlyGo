import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/users.entity';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { ConfigModule } from '@nestjs/config';

@Module({
     imports: [TypeOrmModule.forFeature([User]),ConfigModule],
     providers: [UsersService],
     controllers: [UsersController],
})
export class UsersModule {}
