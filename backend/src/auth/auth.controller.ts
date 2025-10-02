import { Body, Controller, Get, Post, Req, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from 'src/auth/auth.service';
import { LoginLocalDto } from 'src/auth/dto/login-local.dto';
import { RegisterLocalDto } from 'src/auth/dto/register-local.dto';
import { SendOtpDto } from 'src/auth/dto/send-otp.dto';
import { VerifyOtpDto } from 'src/auth/dto/verify-otp.dto';
import { GoogleOAuthGuard } from 'src/auth/guards/google.guard';
import { JwtAuthGuard } from 'src/auth/guards/jwt-auth.guard';
import { LocalAuthGuard } from 'src/auth/guards/local-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @UsePipes(ValidationPipe)
        async register(@Body() registerLocalDto: RegisterLocalDto) {
            //  console.log('BODY:', registerLocalDto);
        return this.authService.registerPending(registerLocalDto);
    }

    @Post('send-otp')
    @UsePipes(ValidationPipe)
    async sendOtp(@Body() sendOtpDto: SendOtpDto) {
        return this.authService.sendOtp(sendOtpDto);
    }

    @Post('verify-otp')
    @UsePipes(ValidationPipe)
    async verifyOtp(@Body() verifyOtpDto: VerifyOtpDto) {
        return this.authService.verifyOtpAndRegister(verifyOtpDto);
    }

   // login dùng local strategy
    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Req() req) {
        console.log('req:',req.user.role.roleName)
        return this.authService.login(req.user);
    }

//    @Get('google')
//    @UseGuards(AuthGuard('google'))
//    async googleAuth() {

//     }

    // @Get('google/callback')
    // @UseGuards(GoogleOAuthGuard)
    // async googleAuthRedirect(@Req() req, @Res() res) {
    // const tokens = await this.authService.login(req.user);

  
    // const redirectUrl = `http://localhost:3000/auth/callback?accessToken=${tokens.data.accessToken}&refreshToken=${tokens.data.refreshToken}`;
    // return res.redirect(redirectUrl);
    // }


   
   // test bảo vệ route bằng JWT
//    @UseGuards(JwtAuthGuard)
//    @Get('profile')
//     getProfile(@Req() req) {
    
//         return req.user;
//     }
        
    



    // @Post('refresh')
    // async refresh(@Body() body: { accountId: number; refreshToken: string }) {
    // return this.authService.refreshTokens(body.accountId, body.refreshToken);
// }



}
