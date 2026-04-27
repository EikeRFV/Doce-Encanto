import { IsNotEmpty, IsArray, ValidateNested, IsOptional, IsString, IsEnum, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum PaymentMethodType {
  PIX = 'PIX',
  CREDIT_CARD = 'CREDIT_CARD',
  WALLET = 'WALLET',
}

export class OrderItemDto {
  @ApiProperty({ description: 'ID do produto' })
  @IsNotEmpty({ message: 'ID do produto é obrigatório' })
  @IsUUID('4', { message: 'ID do produto deve ser um UUID válido' })
  productId: string;

  @ApiProperty({ description: 'Quantidade do produto', minimum: 1 })
  @IsNotEmpty({ message: 'Quantidade é obrigatória' })
  quantity: number;
}

export class CreateOrderDto {
  @ApiProperty({ description: 'Itens do pedido', type: [OrderItemDto] })
  @IsNotEmpty({ message: 'Itens do pedido são obrigatórios' })
  @IsArray({ message: 'Itens devem ser um array' })
  @ValidateNested({ each: true })
  @Type(() => OrderItemDto)
  items: OrderItemDto[];

  @ApiProperty({ description: 'ID do endereço de entrega' })
  @IsNotEmpty({ message: 'Endereço de entrega é obrigatório' })
  @IsUUID('4', { message: 'ID do endereço deve ser um UUID válido' })
  addressId: string;

  @ApiProperty({ description: 'Método de pagamento', enum: PaymentMethodType })
  @IsNotEmpty({ message: 'Método de pagamento é obrigatório' })
  @IsEnum(PaymentMethodType, { message: 'Método de pagamento inválido' })
  paymentMethod: PaymentMethodType;

  @ApiPropertyOptional({ description: 'Código do voucher de desconto' })
  @IsOptional()
  @IsString()
  voucherCode?: string;

  @ApiPropertyOptional({ description: 'Observações do pedido' })
  @IsOptional()
  @IsString()
  notes?: string;
}

