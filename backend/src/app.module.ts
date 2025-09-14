import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { dataSourceOptions } from 'db/data-source';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AccountsController } from './accounts/accounts.controller';
import { AccountsService } from './accounts/accounts.service';
import { AccountsModule } from './accounts/accounts.module';


@Module({
  imports: [ TypeOrmModule.forRoot(dataSourceOptions), UsersModule,ConfigModule.forRoot(), AccountsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
