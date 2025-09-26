import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { dataSourceOptions } from 'db/data-source';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserRolesController } from './user-roles/user-roles.controller';
import { UserRolesService } from './user-roles/user-roles.service';
import { UserRolesModule } from './user-roles/user-roles.module';
import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';


@Module({
  imports: [ TypeOrmModule.forRoot(dataSourceOptions), UsersModule,ConfigModule.forRoot(), AuthModule, UserRolesModule],
  controllers: [AppController, UserRolesController, UsersController],
  providers: [AppService, UserRolesService, UsersService],
})
export class AppModule {}
