import { IsEmail, IsNotEmpty, IsString, MinLength, Matches } from 'class-validator';

export class ResetPasswordDto {
    @IsEmail({}, { message: 'Email không hợp lệ' })
    @IsNotEmpty({ message: 'Email là bắt buộc' })
    email: string;

    @IsString({ message: 'Mật khẩu mới phải là chuỗi' })
    @IsNotEmpty({ message: 'Mật khẩu mới là bắt buộc' })
    @MinLength(6, { message: 'Mật khẩu phải có ít nhất 6 ký tự' })
    @Matches(/(?=.*\d)/, { message: 'Mật khẩu phải chứa ít nhất 1 số' })
    newPassword: string;

    @IsString({ message: 'Reset token phải là chuỗi' })
    @IsNotEmpty({ message: 'Reset token là bắt buộc' })
    resetToken: string;
}