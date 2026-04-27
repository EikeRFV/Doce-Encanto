import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  Min,
  MaxLength,
  IsUUID,
} from 'class-validator';

export class CreateProductDto {
  @ApiProperty({
    description: 'Nome do produto',
    example: 'Vela Aromática Lavanda',
    maxLength: 200,
  })
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty({
    description: 'Descrição detalhada do produto',
    example: 'Vela artesanal com aroma de lavanda, perfeita para relaxamento',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Preço do produto',
    example: 49.9,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01, { message: 'O preço deve ser maior que zero' })
  price: number;

  @ApiProperty({
    description: 'Quantidade em estoque',
    example: 100,
    minimum: 0,
  })
  @IsNumber()
  @Min(0, { message: 'O estoque não pode ser negativo' })
  stockQuantity: number;

  @ApiProperty({
    description: 'ID da categoria',
    example: 'uuid-da-categoria',
  })
  @IsUUID()
  categoryId: string;

  @ApiProperty({
    description: 'SKU do produto',
    example: 'VEL-LAV-001',
    required: false,
  })
  @IsString()
  @IsOptional()
  sku?: string;

  @ApiProperty({
    description: 'Peso do produto em gramas',
    example: 250,
    required: false,
  })
  @IsNumber()
  @IsOptional()
  weight?: number;

  @ApiProperty({
    description: 'Dimensões do produto (LxAxP em cm)',
    example: '10x10x8',
    required: false,
  })
  @IsString()
  @IsOptional()
  dimensions?: string;

  @ApiProperty({
    description: 'Produto está ativo',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiProperty({
    description: 'Produto está em destaque',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;
}

