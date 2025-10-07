import { Body, Controller, Delete, Get, Param, Post, Put, UsePipes, ValidationPipe } from '@nestjs/common';
import { AirlinesService } from 'src/airlines/airlines.service';
import { CreateAirlinesDto } from 'src/airlines/dto/create-airline.dto';
import { UpdateAirlinesDto } from 'src/airlines/dto/update-airline.dto';

@Controller('airlines')
export class AirlinesController {
  constructor(private airlinesService:AirlinesService){}

    @Get()
    FindAll(){
        return this.airlinesService.findAll();
    }

    @UsePipes(ValidationPipe)
    @Post()
    create(@Body() createAirlinesDto:CreateAirlinesDto){
        return this.airlinesService.create(createAirlinesDto);
    }

    @Get(':id')
    findOne(@Param('id') id:string){
        return this.airlinesService.findOne(Number(id));
    }
    
    @UsePipes(ValidationPipe)
    @Put(':id')
    update(@Param('id') id:string, @Body() updateAirlinesDto:UpdateAirlinesDto){
        return this.airlinesService.update(Number(id), updateAirlinesDto);
    }

    @Delete(':id')
    delete(@Param('id') id:string){
        return this.airlinesService.delete(Number(id));
    }
    
}
