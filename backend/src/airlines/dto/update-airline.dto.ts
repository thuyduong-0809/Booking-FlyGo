import { PartialType } from '@nestjs/mapped-types';
import { CreateAirlinesDto } from 'src/airlines/dto/create-airline.dto';

export class UpdateAirlinesDto extends PartialType(CreateAirlinesDto) {}
