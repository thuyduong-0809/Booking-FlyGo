import {
  IsString,
  IsEmail,
  IsOptional,
  IsDateString,
  IsEnum,
  IsBoolean,
  MinLength,
  MaxLength,
  IsInt,
} from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6,{
     message:'mật khẩu phải trên 6 ký tự'
  })
  @MaxLength(255)
  passwordHash: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  firstName: string;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  lastName: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: Date;

  @IsOptional()
  @IsString()
  @MaxLength(50)
  passportNumber?: string;

  @IsOptional()
  @IsDateString()
  passportExpiry?: Date;

  // @IsInt()
  roleId: number;

  @IsOptional()
  @IsInt()
  loyaltyPoints?: number;

  @IsOptional()
  @IsEnum(['Standard', 'Silver', 'Gold', 'Platinum'])
  loyaltyTier?: 'Standard' | 'Silver' | 'Gold' | 'Platinum';

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
