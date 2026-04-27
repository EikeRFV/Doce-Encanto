import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString, IsOptional, Min } from 'class-validator';

export class UseCreditsDto {
  @ApiProperty({
    description: 'Valor em créditos a ser utilizado',
    example: 25.0,
    minimum: 0.01,
  })
  @IsNumber()
  @Min(0.01, { message: 'O valor mínimo é R$ 0,01' })
  amount: number;

  @ApiProperty({
    description: 'ID do pedido relacionado',
    example: 'uuid-do-pedido',
    required: false,
  })
  @IsString()
  @IsOptional()
  orderId?: string;

  @ApiProperty({
    description: 'Descrição da transação',
    example: 'Pagamento do pedido #12345',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;
}

