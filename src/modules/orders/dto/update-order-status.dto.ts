import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { OrderStatus } from '../../../common/enums/order-status.enum';

export class UpdateOrderStatusDto {
  @ApiProperty({ description: 'Novo status do pedido', enum: OrderStatus })
  @IsEnum(OrderStatus, { message: 'Status inválido' })
  status: OrderStatus;

  @ApiPropertyOptional({ description: 'Observações sobre a mudança de status' })
  @IsOptional()
  @IsString()
  notes?: string;
}

