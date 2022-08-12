import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsPositive } from 'class-validator';

export class PaginationDTO {
  @ApiProperty({
    default: 10,
    description: 'how many rows do you need',
  })
  @IsOptional()
  @IsPositive()
  limit: number;

  @ApiProperty({
    default: 0,
    description: 'how many rows do you want to skip',
  })
  @IsOptional()
  @IsPositive()
  offset: number;
}
