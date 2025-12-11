import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CancelHistory } from './entities/cancel-history.entity';
import { CancelHistoryService } from './cancel-history.service';
import { CancelHistoryController } from './cancel-history.controller';

@Module({
    imports: [TypeOrmModule.forFeature([CancelHistory])],
    controllers: [CancelHistoryController],
    providers: [CancelHistoryService],
    exports: [CancelHistoryService],
})
export class CancelHistoryModule { }
