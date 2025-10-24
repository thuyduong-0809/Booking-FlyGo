import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsJSON,
  IsObject,
  IsOptional,
  IsString,
  Length,
} from 'class-validator';

export class UpdateSeatDto {

  @IsOptional()
  @IsBoolean({ message: 'isAvailable must be a boolean value' })
  isAvailable?: boolean;

  @IsOptional()
  @IsObject({ message: 'Features must be a valid JSON object' })
  features?: object;

}
