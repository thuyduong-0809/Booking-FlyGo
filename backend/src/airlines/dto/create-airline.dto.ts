import { IsBoolean, IsOptional, IsString, Length, MaxLength, IsUrl } from 'class-validator';

export class CreateAirlinesDto {
  @IsString({ message: 'Airline code must be a string' })
  @Length(2, 3, { message: 'Airline code must be between 2 and 3 characters long' })
  airlineCode: string;

  @IsString({ message: 'Airline name must be a string' })
  @MaxLength(100, { message: 'Airline name must not exceed 100 characters' })
  airlineName: string;

  @IsOptional()
  @IsUrl({}, { message: 'Logo URL must be a valid URL' })
  logoURL?: string;

  @IsOptional()
  @IsString({ message: 'Contact number must be a string' })
  @MaxLength(20, { message: 'Contact number must not exceed 20 characters' })
  contactNumber?: string;

  @IsOptional()
  @IsString({ message: 'Website must be a string' })
  @MaxLength(100, { message: 'Website must not exceed 100 characters' })
  website?: string;

  @IsOptional()
  @IsBoolean({ message: 'Active status must be a boolean value (true/false)' })
  isActive?: boolean;
}
