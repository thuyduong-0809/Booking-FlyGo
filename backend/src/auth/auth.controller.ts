import { Body, Controller, Get, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { LoginLocalDto } from 'src/auth/dto/login-local.dto';
import { RegisterLocalDto } from 'src/auth/dto/register-local.dto';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { LocalAuthGuard } from 'src/auth/guards/local-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @UsePipes(ValidationPipe)
    async register(@Body() registerLocalDto: RegisterLocalDto) {
        //  console.log('BODY:', registerLocalDto);
    return this.authService.register(registerLocalDto);
    }

   // login dùng local strategy
   @UseGuards(LocalAuthGuard)
   @Post('login')
   async login(@Req() req) {
    console.log(req.user)
    return this.authService.login(req.user);
   }
   
   // test bảo vệ route bằng JWT
   @UseGuards(JwtAuthGuard)
   @Get('profile')
    getProfile(@Req() req) {
        console.log(req.user)
        return req.user;
    }
        
    



    // @Post('refresh')
    // async refresh(@Body() body: { accountId: number; refreshToken: string }) {
    // return this.authService.refreshTokens(body.accountId, body.refreshToken);
// }



}
