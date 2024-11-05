import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class BasicLoginDTO {
  @IsEmail()
  @IsString()
  @IsNotEmpty()
  email: string

  @IsString()
  @IsNotEmpty()
  password: string
}
