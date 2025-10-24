import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterLocalDto {
  @IsNotEmpty({
    message: 'Vui lòng nhập họ'
  })
  @IsString()
  firstName: string;

  @IsNotEmpty({
    message: 'Vui lòng nhập tên'
  })
  @IsString()
  lastName: string;

  @IsEmail()
  email: string;

  @IsNotEmpty({
    message: 'vui lòng nhập mật khẩu'
  })
  @MinLength(6, {
    message: 'mật khẩu phải trên 6 ký tự'
  })
  @MaxLength(16, {
    message: 'mật khẩu quá dài',
  })
  passwordHash: string;
}