import { Body, Controller, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { AccountsService } from 'src/accounts/accounts.service';
import { CreateLocalAccountDto } from 'src/accounts/dto/create-localAccount.dto';
import { CreateUserDto } from 'src/users/dto/create_user.dto';

@Controller('accounts')
export class AccountsController {
    constructor(private readonly accountsService: AccountsService) {}

  @UsePipes()
  @Post('signup')
  async signup(
    @Body() createLocalAccountDto: CreateLocalAccountDto,
  ) {
    return this.accountsService.create(createLocalAccountDto);
  }
}
