import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountsController } from 'src/accounts/accounts.controller';
import { AccountsService } from 'src/accounts/accounts.service';
import { Account } from 'src/accounts/entities/accounts.entity';
import { User } from 'src/users/entities/users.entity';
import { UsersService } from 'src/users/users.service';

@Module({
    imports:[TypeOrmModule.forFeature([Account,User]),ConfigModule],
    providers:[AccountsService,UsersService],
    controllers:[AccountsController]
})
export class AccountsModule {
      


}
