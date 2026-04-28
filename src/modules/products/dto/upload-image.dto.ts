import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsOptional } from 'class-validator';

export class UploadImageDto {
  @ApiProperty({
    description: 'Imagem é a principal',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean = false;

  @ApiProperty({
    description: 'Ordem de exibição',
    example: 1,
    required: false,
  })
  @IsOptional()
  displayOrder?: number;
}

