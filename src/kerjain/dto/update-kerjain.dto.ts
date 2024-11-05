import { PartialType } from '@nestjs/mapped-types'
import { CreateKerjainDto } from './create-kerjain.dto'

export class UpdateKerjainDto extends PartialType(CreateKerjainDto) {}
