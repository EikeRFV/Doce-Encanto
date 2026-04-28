import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class AddCreditsDto {
  @ApiProperty({
    description: 'Valor em créditos a ser adicionado',
    example: 50.0,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01, { message: 'O valor mínimo é R$ 0,01' })
  amount: number;

  @ApiProperty({
    description: 'Descrição da transação',
    example: 'Recarga de créditos via PIX',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

