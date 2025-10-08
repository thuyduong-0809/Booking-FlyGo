import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Airport } from 'src/airports/entities/airports.entity';
import { Terminal } from 'src/terminals/entities/terminals.entity';
import { TerminalsController } from 'src/terminals/terminals.controller';
import { TerminalsService } from 'src/terminals/terminals.service';

@Module({
    imports:[TypeOrmModule.forFeature([Terminal,Airport])],
    providers:[TerminalsService],
    controllers:[TerminalsController],
})
export class TerminalsModule {}
