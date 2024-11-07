import { IsNotEmpty, IsString } from 'class-validator'

export class MarkDoneKerjainDTO {
  @IsString()
  @IsNotEmpty()
  id: string
}
