import {
  IsNotEmpty,
  IsNumber,
  IsEnum,
  IsOptional,
  IsString,
  IsJSON,
  IsDateString,
} from 'class-validator';

export class CreatePaymentDto {
  @IsNotEmpty()
  @IsNumber()
  amount: number;

  @IsNotEmpty()
  @IsEnum(['CreditCard', 'DebitCard', 'PayPal', 'BankTransfer'], {
    message: 'paymentMethod must be one of: CreditCard, DebitCard, PayPal, BankTransfer',
  })
  paymentMethod: string;

  @IsOptional()
  @IsEnum(['Pending', 'Completed', 'Failed', 'Refunded'], {
    message: 'paymentStatus must be one of: Pending, Completed, Failed, Refunded',
  })
  paymentStatus?: string;

  @IsOptional()
  @IsString()
  transactionId?: string;

  @IsOptional()
  paymentDetails?: object;

  @IsOptional()
  @IsDateString()
  paidAt?: Date;

  @IsNotEmpty()
  @IsNumber()
  bookingId: number;
}
