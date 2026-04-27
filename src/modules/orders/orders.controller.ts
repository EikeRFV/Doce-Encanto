import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Orders')
@Controller('orders')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Criar novo pedido' })
  @ApiResponse({ status: 201, description: 'Pedido criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou estoque insuficiente' })
  create(@CurrentUser('id') userId: string, @Body() createOrderDto: CreateOrderDto) {
    return this.ordersService.create(userId, createOrderDto);
  }

  @Get()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar pedidos do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de pedidos retornada com sucesso' })
  findMyOrders(@CurrentUser('id') userId: string, @Query() query: QueryOrdersDto) {
    return this.ordersService.findAll(query, userId);
  }

  @Get('all')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.FINANCIAL)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Listar todos os pedidos (Admin/Manager/Financial)' })
  @ApiResponse({ status: 200, description: 'Lista de todos os pedidos' })
  findAll(@Query() query: QueryOrdersDto) {
    return this.ordersService.findAll(query);
  }

  @Get('stats')
  @Roles(UserRole.ADMIN, UserRole.MANAGER, UserRole.FINANCIAL)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Estatísticas de pedidos (Admin/Manager/Financial)' })
  @ApiResponse({ status: 200, description: 'Estatísticas retornadas com sucesso' })
  getStats() {
    return this.ordersService.getOrderStats();
  }

  @Get('my-stats')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Estatísticas dos meus pedidos' })
  @ApiResponse({ status: 200, description: 'Estatísticas retornadas com sucesso' })
  getMyStats(@CurrentUser('id') userId: string) {
    return this.ordersService.getOrderStats(userId);
  }

  @Get('number/:orderNumber')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar pedido por número' })
  @ApiResponse({ status: 200, description: 'Pedido encontrado' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  findByOrderNumber(@Param('orderNumber') orderNumber: string) {
    return this.ordersService.findByOrderNumber(orderNumber);
  }

  @Get(':id')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Buscar pedido por ID' })
  @ApiResponse({ status: 200, description: 'Pedido encontrado' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  findOne(@Param('id') id: string) {
    return this.ordersService.findOne(id);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Atualizar status do pedido (Admin/Manager)' })
  @ApiResponse({ status: 200, description: 'Status atualizado com sucesso' })
  @ApiResponse({ status: 400, description: 'Transição de status inválida' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  updateStatus(@Param('id') id: string, @Body() updateStatusDto: UpdateOrderStatusDto) {
    return this.ordersService.updateStatus(id, updateStatusDto);
  }

  @Post(':id/cancel')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Cancelar pedido' })
  @ApiResponse({ status: 200, description: 'Pedido cancelado com sucesso' })
  @ApiResponse({ status: 400, description: 'Pedido não pode ser cancelado' })
  @ApiResponse({ status: 404, description: 'Pedido não encontrado' })
  cancelOrder(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.ordersService.cancelOrder(id, userId);
  }
}

