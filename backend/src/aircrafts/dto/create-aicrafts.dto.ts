import {
  IsBoolean,
  IsDateString,
  IsInt,
  IsJSON,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateAircraftDto {
  @IsString({ message: 'Aircraft code must be a string' })
  @Length(2, 10, { message: 'Aircraft code must be between 2 and 10 characters' })
  aircraftCode: string;

  @IsString({ message: 'Model name is required' })
  @MaxLength(100, { message: 'Model name must not exceed 100 characters' })
  model: string;

  @IsInt({ message: 'Airline ID must be an integer' })
  @Min(1, { message: 'Airline ID must be greater than 0' })
  airlineId: number;

  @IsOptional()
  @IsInt({ message: 'Economy capacity must be an integer' })
  @Min(0, { message: 'Economy capacity cannot be negative' })
  economyCapacity: number=0;

  @IsOptional()
  @IsInt({ message: 'Business capacity must be an integer' })
  @Min(0, { message: 'Business capacity cannot be negative' })
  businessCapacity: number=0;

  @IsOptional()
  @IsInt({ message: 'First class capacity must be an integer' })
  @Min(0, { message: 'First class capacity cannot be negative' })
  firstClassCapacity: number=0;

 @IsOptional()
 @IsObject({ message: 'Seat layout must be a valid JSON format' })
  seatLayoutJSON?: object;

  @IsOptional()
  @IsDateString({}, { message: 'Last maintenance must be a valid date' })
  lastMaintenance?: Date;

  @IsOptional()
  @IsDateString({}, { message: 'Next maintenance must be a valid date' })
  nextMaintenance?: Date;

  @IsOptional()
  @IsBoolean({ message: 'isActive must be a boolean value' })
  isActive?: boolean;
}
