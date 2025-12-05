import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyResetOtpDto {
    @IsEmail({}, { message: 'Email không hợp lệ' })
    @IsNotEmpty({ message: 'Email là bắt buộc' })
    email: string;

    @IsString({ message: 'OTP phải là chuỗi' })
    @IsNotEmpty({ message: 'OTP là bắt buộc' })
    @Length(6, 6, { message: 'OTP phải có đúng 6 ký tự' })
    otp: string;
}