import { IsArray, IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateKerjainDTO {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsNumber()
  @IsNotEmpty()
  salary: number

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  requirements: string[]

  @IsString()
  @IsNotEmpty()
  mapPoint: string
}
