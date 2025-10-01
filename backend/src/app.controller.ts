import { Controller, Get, Post, Req, Request, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthGuard } from '@nestjs/passport';
import { LocalAuthGuard } from 'src/auth/guards/local-auth.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  // @UseGuards(AuthGuard('local'))
  // @Post('auth/login')
  // async login(@Request() req) {
  //   console.log(req.user)
  //   return req.user;
  // }

  @UseGuards(JwtAuthGuard)
  @Get('home')
  getHome(@Req() req) {
    return { message: `Welcome ${req.user.email}` };
  }

    @UseGuards(LocalAuthGuard)
    @Post('auth/logout')
    async logout(@Request() req) {
      return req.logout();
    }
}
