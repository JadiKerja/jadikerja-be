import { Type } from 'class-transformer'
import { IsString, IsOptional, IsNotEmpty, IsInt } from 'class-validator'

export class PaginationDto {
  @IsInt()
  @Type(() => Number)
  @IsNotEmpty()
  page: number

  @IsString()
  @IsOptional()
  pageSize?: string
}
