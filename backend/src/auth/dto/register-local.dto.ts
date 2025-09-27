import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class RegisterLocalDto {
  @IsEmail()
  email: string;

  @IsNotEmpty({
    message:'vui lòng nhập mật khẩu'
  })
  @MinLength(6,{
     message:'mật khẩu phải trên 6 ký tự'
  })
   @MaxLength(16, {
        message: 'mật khẩu quá dài',
    })
  passwordHash: string;
}