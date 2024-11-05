import { IsNotEmpty, IsString } from 'class-validator'

export class OauthLoginDTO {
  @IsString()
  @IsNotEmpty()
  firebaseToken: string
}
