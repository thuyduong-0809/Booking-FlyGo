import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterLocalDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(6)
  password: string;
}