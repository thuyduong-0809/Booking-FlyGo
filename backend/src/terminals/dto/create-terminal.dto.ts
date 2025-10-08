import { IsString, MaxLength, IsOptional, IsInt } from 'class-validator';

export class CreateTerminalDto {
  @IsString({ message: 'Terminal code must be a string' })
  @MaxLength(10, { message: 'Terminal code must not exceed 10 characters' })
  terminalCode: string;

  @IsOptional()
  @IsString({ message: 'Terminal name must be a string' })
  @MaxLength(100, { message: 'Terminal name must not exceed 100 characters' })
  terminalName?: string;

  @IsInt({ message: 'Airport ID must be an integer' })
  airportId: number;
}
