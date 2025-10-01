import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserRolesController } from 'src/user-roles/user-roles.controller';
import { UserRolesService } from 'src/user-roles/user-roles.service';

@Module({
    imports:[TypeOrmModule.forFeature([]),ConfigModule],
    providers:[UserRolesService],
    controllers:[UserRolesController]
})
export class UserRolesModule {}
