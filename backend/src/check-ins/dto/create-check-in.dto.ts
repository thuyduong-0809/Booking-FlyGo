import { IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, IsUrl, Min } from 'class-validator';
import { CheckInType, BoardingStatus } from '../entities/check-ins.entity';

export class CreateCheckInDto {
  @IsNotEmpty()
  @IsNumber()
  bookingFlightId: number;

  @IsNotEmpty()
  @IsNumber()
  passengerId: number;

  @IsNotEmpty()
  @IsEnum(CheckInType, {
    message: 'checkInType must be either Online or Airport',
  })
  checkInType: CheckInType;

  @IsOptional()
  @IsUrl({}, { message: 'boardingPassUrl must be a valid URL' })
  boardingPassUrl?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  baggageCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  baggageWeight?: number;

  @IsOptional()
  @IsEnum(BoardingStatus, {
    message: 'boardingStatus must be one of: NotBoarded, Boarded, GateClosed',
  })
  boardingStatus?: BoardingStatus;
}
