import { PartialType } from '@nestjs/mapped-types';
import { CreateRefundHistoryDto } from './create-refund-history.dto';
import { IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';

export class UpdateRefundHistoryDto extends PartialType(CreateRefundHistoryDto) {
    @IsOptional()
    @IsEnum(['Pending', 'Approved', 'Rejected', 'Completed'])
    status?: string;

    @IsOptional()
    @IsString()
    adminNotes?: string;

    @IsOptional()
    @IsString()
    processedBy?: string;

    @IsOptional()
    @IsDateString()
    processedAt?: Date;
}
