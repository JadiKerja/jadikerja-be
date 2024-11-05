import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator'

export class ApplyKerjainDTO {
  @IsString()
  @IsNotEmpty()
  kerjainId: string

  @IsNumber()
  @IsOptional()
  bidPrice: number
}
