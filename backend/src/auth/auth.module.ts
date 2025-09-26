import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthController } from 'src/auth/auth.controller';
import { AuthService } from 'src/auth/auth.service';
// import { GoogleStrategy } from 'src/auth/strategies/google.strategy';
import { JwtStrategy } from 'src/auth/strategies/jwt.strategy';
// import { LocalStrategy } from 'src/auth/strategies/local.strategy';
import { UserRole } from 'src/user-roles/entities/user-roles.entity';
import { User } from 'src/users/entities/users.entity';
import { EmailModule } from 'src/email/email.module';
import { OtpModule } from 'src/otp/otp.module';



@Module({
  imports:[TypeOrmModule.forFeature([User,UserRole]),
  ConfigModule.forRoot(),
  PassportModule,
  EmailModule,
  OtpModule,
  JwtModule.register({
      global: true,
      secret: process.env.JWT_ACCESS_SECRET,
      signOptions: { expiresIn: process.env.JWT_ACCESS_EXPIRE },
    }),
],
  controllers: [AuthController],
  providers: [AuthService,JwtStrategy],//them GoogleStrategy,,LocalStrategy
})
export class AuthModule {}

