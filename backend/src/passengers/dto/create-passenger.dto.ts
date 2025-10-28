import { IsString, IsOptional, IsDateString, IsEnum, MaxLength, IsInt } from 'class-validator';

export class CreatePassengerDto {
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @MaxLength(50, { message: 'First name must not exceed 50 characters' })
  firstName?: string;

  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
  lastName?: string;

  @IsOptional()
  @IsDateString({}, { message: 'Date of birth must be a valid date' })
  dateOfBirth?: Date;

  @IsOptional()
  @IsString({ message: 'Passport number must be a string' })
  @MaxLength(50, { message: 'Passport number must not exceed 50 characters' })
  passportNumber?: string;

  @IsOptional()
  @IsEnum(['Adult', 'Child', 'Infant'], {
    message: 'Passenger type must be one of: Adult, Child, Infant',
  })
  passengerType?: 'Adult' | 'Child' | 'Infant';

  @IsInt({ message: 'bookingId must be an integer' })
  bookingId: number;
}
