import { Type } from 'class-transformer'
import { IsString, IsNotEmpty, IsDate } from 'class-validator'

export class UpdateUserDTO {
  @IsString()
  @IsNotEmpty()
  fullName: string

  @Type(() => Date)
  @IsDate()
  @IsNotEmpty()
  birthDate: Date

  @IsString()
  @IsNotEmpty()
  domicile: string

  @IsString()
  @IsNotEmpty()
  phone: string

  @IsString()
  @IsNotEmpty()
  profileUrl: string
}
