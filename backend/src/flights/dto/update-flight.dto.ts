import { PartialType } from '@nestjs/mapped-types';
import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsPositive, IsString, Length, Min } from 'class-validator';
import { CreateFlightDto } from './create-flight.dto';

export class UpdateFlightDto extends PartialType(CreateFlightDto) {
  // Cho phép cập nhật flightNumber (trường hợp thay đổi mã chuyến bay nội bộ)
  @IsOptional()
  @IsString()
  @Length(2, 10)
  flightNumber?: string;

  // Cập nhật giờ bay / giờ đến
  @IsOptional()
  @IsDateString()
  departureTime?: Date;

  @IsOptional()
  @IsDateString()
  arrivalTime?: Date;

  // Thời lượng chuyến bay (phút)
  @IsOptional()
  @IsInt()
  @Min(1)
  duration?: number;

  // Trạng thái chuyến bay
  @IsOptional()
  @IsEnum(['Scheduled', 'Boarding', 'Departed', 'Arrived', 'Delayed', 'Cancelled'])
  status?: string;

  // Cập nhật giá vé
  @IsOptional()
  @IsNumber()
  @IsPositive()
  economyPrice?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  businessPrice?: number;

  @IsOptional()
  @IsNumber()
  @IsPositive()
  firstClassPrice?: number;

  // Cập nhật số ghế khả dụng
  @IsOptional()
  @IsInt()
  @Min(0)
  availableEconomySeats?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  availableBusinessSeats?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  availableFirstClassSeats?: number;

  // Có thể cập nhật thông tin kỹ thuật (terminal hoặc aircraft)
  @IsOptional()
  @IsInt()
  @Min(1)
  departureTerminalId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  arrivalTerminalId?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  aircraftId?: number;



}
