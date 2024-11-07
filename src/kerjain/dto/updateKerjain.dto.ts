import { PartialType } from '@nestjs/mapped-types'
import { CreateKerjainDTO } from './createKerjain.dto'
import { IsNotEmpty, IsString } from 'class-validator'

export class UpdateKerjainDTO extends PartialType(CreateKerjainDTO) {
  @IsString()
  @IsNotEmpty()
  id: string
}
