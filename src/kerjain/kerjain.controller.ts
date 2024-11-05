import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common'
import { KerjainService } from './kerjain.service'
import { CreateKerjainDto } from './dto/create-kerjain.dto'
import { UpdateKerjainDto } from './dto/update-kerjain.dto'

@Controller('kerjain')
export class KerjainController {
  constructor(private readonly kerjainService: KerjainService) {}

  @Post()
  create(@Body() createKerjainDto: CreateKerjainDto) {
    return this.kerjainService.create(createKerjainDto)
  }

  @Get()
  findAll() {
    return this.kerjainService.findAll()
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.kerjainService.findOne(+id)
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateKerjainDto: UpdateKerjainDto) {
    return this.kerjainService.update(+id, updateKerjainDto)
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.kerjainService.remove(+id)
  }
}
