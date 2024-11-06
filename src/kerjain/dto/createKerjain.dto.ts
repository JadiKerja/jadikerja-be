import { IsNotEmpty, IsNumber, IsString } from 'class-validator'

export class CreateKerjainDTO {
  @IsString()
  @IsNotEmpty()
  title: string

  @IsNumber()
  @IsNotEmpty()
  salary: number

  @IsString()
  @IsNotEmpty()
  address: string

  @IsNumber()
  @IsNotEmpty()
  lat: number

  @IsNumber()
  @IsNotEmpty()
  lng: number

  @IsString()
  @IsNotEmpty()
  contactPersonName: string

  @IsString()
  @IsNotEmpty()
  contactPersonPhone: string
}
