import { Body, Controller, Delete, Get, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { CreateTerminalDto } from 'src/terminals/dto/create-terminal.dto';
import { UpdateTerminalDto } from 'src/terminals/dto/update-terminal';
import { TerminalsService } from 'src/terminals/terminals.service';

@Controller('terminals')
export class TerminalsController {
    constructor(private terminalsService: TerminalsService) {}
    @Get()
    findAll() {
        return this.terminalsService.findAll();
    }

    @UsePipes(ValidationPipe)
    @Post()
    create(@Body() createTerminalDto:CreateTerminalDto) {
        return this.terminalsService.create(createTerminalDto);
    }

    @Get(':id')
    findOne(@Param('id') id:string) {
        return this.terminalsService.findOne(Number(id));
    }

    @Get('airport/:id')
    findByAirportId(@Param('id') id:string) {
        return this.terminalsService.findByAirportId(Number(id));
    }
    
    @UsePipes(ValidationPipe)
    @Put(':id')
    update(@Param('id') id:string, @Body() updateTerminalDto:UpdateTerminalDto) {
        return this.terminalsService.update(Number(id), updateTerminalDto);
    }

    @Delete(':id')
    delete(@Param('id') id:string) {
        return this.terminalsService.delete(Number(id));
    }
}
