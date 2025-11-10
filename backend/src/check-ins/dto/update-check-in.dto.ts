import { IsEnum, IsNumber, IsOptional, IsUrl, Min } from 'class-validator';
import { CheckInType, BoardingStatus } from '../entities/check-ins.entity';

export class UpdateCheckInDto {

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
