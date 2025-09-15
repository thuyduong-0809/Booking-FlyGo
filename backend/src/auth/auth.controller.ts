import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { LoginLocalDto } from 'src/auth/dto/login-local.dto';
import { RegisterLocalDto } from 'src/auth/dto/register-local.dto';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('register')
    @UsePipes(ValidationPipe)
    async register(@Body() registerLocalDto: RegisterLocalDto) {
        //  console.log('BODY:', registerLocalDto);
    return this.authService.register(registerLocalDto);
    }

    @Post('Login')
    @UsePipes(ValidationPipe)
    async login(@Body() loginLocalDto: LoginLocalDto) {
        //  console.log('BODY:', registerLocalDto);
    return this.authService.login(loginLocalDto);
    }

    // @Post('refresh')
    // async refresh(@Body() body: { accountId: number; refreshToken: string }) {
    // return this.authService.refreshTokens(body.accountId, body.refreshToken);
// }



}
