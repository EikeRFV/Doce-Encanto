import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { WalletsService } from './wallets.service';
import { AddCreditsDto } from './dto/add-credits.dto';
import { UseCreditsDto } from './dto/use-credits.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { Permissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/enums/user-role.enum';

@ApiTags('Wallets')
@ApiBearerAuth()
@Controller('wallets')
@UseGuards(JwtAuthGuard, RolesGuard, PermissionsGuard)
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Get('balance')
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  @Permissions('wallet:read')
  @ApiOperation({ summary: 'Consultar saldo da carteira' })
  @ApiResponse({ status: 200, description: 'Saldo consultado com sucesso' })
  @ApiResponse({ status: 404, description: 'Carteira não encontrada' })
  async getBalance(@CurrentUser() user: any) {
    return await this.walletsService.getBalance(user.userId);
  }

  @Post('add-credits')
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  @Permissions('wallet:write')
  @ApiOperation({ summary: 'Adicionar créditos à carteira' })
  @ApiResponse({ status: 201, description: 'Créditos adicionados com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async addCredits(
    @CurrentUser() user: any,
    @Body() addCreditsDto: AddCreditsDto,
  ) {
    return await this.walletsService.addCredits(user.userId, addCreditsDto);
  }

  @Post('use-credits')
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  @Permissions('wallet:write')
  @ApiOperation({ summary: 'Usar créditos da carteira' })
  @ApiResponse({ status: 201, description: 'Créditos utilizados com sucesso' })
  @ApiResponse({ status: 400, description: 'Saldo insuficiente ou dados inválidos' })
  async useCredits(
    @CurrentUser() user: any,
    @Body() useCreditsDto: UseCreditsDto,
  ) {
    return await this.walletsService.useCredits(user.userId, useCreditsDto);
  }

  @Post('refund/:transactionId')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Permissions('wallet:refund')
  @ApiOperation({ summary: 'Estornar uma transação' })
  @ApiResponse({ status: 201, description: 'Transação estornada com sucesso' })
  @ApiResponse({ status: 404, description: 'Transação não encontrada' })
  @ApiResponse({ status: 400, description: 'Transação não pode ser estornada' })
  async refundCredits(
    @CurrentUser() user: any,
    @Param('transactionId') transactionId: string,
    @Body('reason') reason: string,
  ) {
    return await this.walletsService.refundCredits(
      user.userId,
      transactionId,
      reason,
    );
  }

  @Get('transactions')
  @Roles(UserRole.CUSTOMER, UserRole.ADMIN)
  @Permissions('wallet:read')
  @ApiOperation({ summary: 'Listar transações da carteira' })
  @ApiResponse({ status: 200, description: 'Transações listadas com sucesso' })
  async getTransactions(
    @CurrentUser() user: any,
    @Query() query: QueryTransactionsDto,
  ) {
    return await this.walletsService.getTransactions(user.userId, query);
  }

  @Post('welcome-bonus')
  @Roles(UserRole.ADMIN)
  @Permissions('wallet:bonus')
  @ApiOperation({ summary: 'Adicionar bônus de boas-vindas (Admin)' })
  @ApiResponse({ status: 201, description: 'Bônus adicionado com sucesso' })
  async addWelcomeBonus(@Body('userId') userId: string) {
    return await this.walletsService.addWelcomeBonus(userId);
  }

  @Post('cashback')
  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Permissions('wallet:bonus')
  @ApiOperation({ summary: 'Adicionar cashback (Admin/Manager)' })
  @ApiResponse({ status: 201, description: 'Cashback adicionado com sucesso' })
  async addCashback(
    @Body('userId') userId: string,
    @Body('orderValue') orderValue: number,
    @Body('orderId') orderId: string,
  ) {
    return await this.walletsService.addCashback(userId, orderValue, orderId);
  }

  @Get('admin/balance/:userId')
  @Roles(UserRole.ADMIN)
  @Permissions('wallet:admin')
  @ApiOperation({ summary: 'Consultar saldo de qualquer usuário (Admin)' })
  @ApiResponse({ status: 200, description: 'Saldo consultado com sucesso' })
  async getBalanceAdmin(@Param('userId') userId: string) {
    return await this.walletsService.getBalance(userId);
  }

  @Get('admin/transactions/:userId')
  @Roles(UserRole.ADMIN)
  @Permissions('wallet:admin')
  @ApiOperation({ summary: 'Listar transações de qualquer usuário (Admin)' })
  @ApiResponse({ status: 200, description: 'Transações listadas com sucesso' })
  async getTransactionsAdmin(
    @Param('userId') userId: string,
    @Query() query: QueryTransactionsDto,
  ) {
    return await this.walletsService.getTransactions(userId, query);
  }
}

