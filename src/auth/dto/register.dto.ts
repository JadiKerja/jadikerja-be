import { Type } from 'class-transformer'
import { IsDate, IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class RegisterDTO {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  password: string

  @IsString()
  @IsNotEmpty()
  confirmationPassword: string

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
