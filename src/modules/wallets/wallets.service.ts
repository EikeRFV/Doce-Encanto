import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Sequelize } from 'sequelize-typescript';
import { UserWallet } from './models/user-wallet.model';
import {
  WalletTransaction,
  TransactionType,
  TransactionStatus,
} from './models/wallet-transaction.model';
import { AddCreditsDto } from './dto/add-credits.dto';
import { UseCreditsDto } from './dto/use-credits.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';

@Injectable()
export class WalletsService {
  constructor(
    @InjectModel(UserWallet)
    private readonly walletModel: typeof UserWallet,
    @InjectModel(WalletTransaction)
    private readonly transactionModel: typeof WalletTransaction,
    private readonly sequelize: Sequelize,
  ) {}

  /**
   * Regra de Negócio #11: Criação automática de carteira
   * Ao criar um usuário, uma carteira é automaticamente criada com saldo zero
   */
  async createWallet(userId: string): Promise<UserWallet> {
    const existingWallet = await this.walletModel.findOne({
      where: { userId },
    });

    if (existingWallet) {
      throw new BadRequestException('Usuário já possui uma carteira');
    }

    return await this.walletModel.create({
      userId,
      balance: 0,
      totalEarned: 0,
      totalSpent: 0,
    });
  }

  /**
   * Regra de Negócio #12: Consulta de saldo
   * Retorna o saldo atual da carteira do usuário
   */
  async getBalance(userId: string): Promise<UserWallet> {
    const wallet = await this.walletModel.findOne({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Carteira não encontrada');
    }

    return wallet;
  }

  /**
   * Regra de Negócio #13: Adição de créditos
   * Permite adicionar créditos à carteira com validações de valor mínimo
   * Cria transação de crédito e atualiza saldo
   */
  async addCredits(
    userId: string,
    addCreditsDto: AddCreditsDto,
  ): Promise<WalletTransaction> {
    const { amount, description } = addCreditsDto;

    // Validação: valor mínimo de R$ 0,01
    if (amount < 0.01) {
      throw new BadRequestException('Valor mínimo para recarga é R$ 0,01');
    }

    // Validação: valor máximo de R$ 10.000,00 por transação
    if (amount > 10000) {
      throw new BadRequestException(
        'Valor máximo para recarga é R$ 10.000,00',
      );
    }

    const transaction = await this.sequelize.transaction();

    try {
      // Busca ou cria carteira
      let wallet = await this.walletModel.findOne({
        where: { userId },
        transaction,
        lock: true,
      });

      if (!wallet) {
        wallet = await this.walletModel.create(
          {
            userId,
            balance: 0,
            totalEarned: 0,
            totalSpent: 0,
          },
          { transaction },
        );
      }

      const previousBalance = wallet.balance;
      const newBalance = previousBalance + amount;

      // Atualiza saldo
      wallet.balance = newBalance;
      wallet.totalEarned = wallet.totalEarned + amount;
      await wallet.save({ transaction });

      // Cria transação
      const walletTransaction = await this.transactionModel.create(
        {
          walletId: wallet.id,
          type: TransactionType.CREDIT,
          amount,
          previousBalance,
          newBalance,
          description: description || 'Recarga de créditos',
          status: TransactionStatus.COMPLETED,
        },
        { transaction },
      );

      await transaction.commit();
      return walletTransaction;
    } catch (error) {
      await transaction.rollback();
      throw new InternalServerErrorException(
        'Erro ao adicionar créditos: ' + error.message,
      );
    }
  }

  /**
   * Regra de Negócio #14: Uso de créditos
   * Permite usar créditos da carteira com validação de saldo suficiente
   * Cria transação de débito e atualiza saldo
   */
  async useCredits(
    userId: string,
    useCreditsDto: UseCreditsDto,
  ): Promise<WalletTransaction> {
    const { amount, orderId, description } = useCreditsDto;

    // Validação: valor mínimo de R$ 0,01
    if (amount < 0.01) {
      throw new BadRequestException('Valor mínimo para uso é R$ 0,01');
    }

    const transaction = await this.sequelize.transaction();

    try {
      const wallet = await this.walletModel.findOne({
        where: { userId },
        transaction,
        lock: true,
      });

      if (!wallet) {
        throw new NotFoundException('Carteira não encontrada');
      }

      // Regra de Negócio #15: Validação de saldo suficiente
      if (wallet.balance < amount) {
        throw new BadRequestException(
          `Saldo insuficiente. Saldo atual: R$ ${wallet.balance.toFixed(2)}`,
        );
      }

      const previousBalance = wallet.balance;
      const newBalance = previousBalance - amount;

      // Atualiza saldo
      wallet.balance = newBalance;
      wallet.totalSpent = wallet.totalSpent + amount;
      await wallet.save({ transaction });

      // Cria transação
      const walletTransaction = await this.transactionModel.create(
        {
          walletId: wallet.id,
          type: TransactionType.DEBIT,
          amount,
          previousBalance,
          newBalance,
          orderId,
          description: description || 'Uso de créditos',
          status: TransactionStatus.COMPLETED,
        },
        { transaction },
      );

      await transaction.commit();
      return walletTransaction;
    } catch (error) {
      await transaction.rollback();
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Erro ao usar créditos: ' + error.message,
      );
    }
  }

  /**
   * Regra de Negócio #16: Estorno de créditos
   * Permite estornar uma transação de débito, devolvendo os créditos
   */
  async refundCredits(
    userId: string,
    transactionId: string,
    reason: string,
  ): Promise<WalletTransaction> {
    const transaction = await this.sequelize.transaction();

    try {
      const wallet = await this.walletModel.findOne({
        where: { userId },
        transaction,
        lock: true,
      });

      if (!wallet) {
        throw new NotFoundException('Carteira não encontrada');
      }

      const originalTransaction = await this.transactionModel.findOne({
        where: { id: transactionId, walletId: wallet.id },
        transaction,
      });

      if (!originalTransaction) {
        throw new NotFoundException('Transação não encontrada');
      }

      if (originalTransaction.type !== TransactionType.DEBIT) {
        throw new BadRequestException(
          'Apenas transações de débito podem ser estornadas',
        );
      }

      if (originalTransaction.status === TransactionStatus.REFUNDED) {
        throw new BadRequestException('Transação já foi estornada');
      }

      const previousBalance = wallet.balance;
      const newBalance = previousBalance + originalTransaction.amount;

      // Atualiza saldo
      wallet.balance = newBalance;
      wallet.totalEarned = wallet.totalEarned + originalTransaction.amount;
      await wallet.save({ transaction });

      // Marca transação original como estornada
      originalTransaction.status = TransactionStatus.REFUNDED;
      await originalTransaction.save({ transaction });

      // Cria transação de estorno
      const refundTransaction = await this.transactionModel.create(
        {
          walletId: wallet.id,
          type: TransactionType.REFUND,
          amount: originalTransaction.amount,
          previousBalance,
          newBalance,
          orderId: originalTransaction.orderId,
          description: `Estorno: ${reason}`,
          status: TransactionStatus.COMPLETED,
        },
        { transaction },
      );

      await transaction.commit();
      return refundTransaction;
    } catch (error) {
      await transaction.rollback();
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Erro ao estornar créditos: ' + error.message,
      );
    }
  }

  /**
   * Lista transações da carteira com filtros e paginação
   */
  async listTransactions(
    userId: string,
    query: QueryTransactionsDto,
  ): Promise<{
    data: WalletTransaction[];
    meta: { total: number; page: number; limit: number; totalPages: number };
  }> {
    const {
      page = 1,
      limit = 10,
      type,
      status,
      startDate,
      endDate,
    } = query;

    const wallet = await this.walletModel.findOne({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Carteira não encontrada');
    }

    const where: any = { walletId: wallet.id };

    if (type) {
      where.type = type;
    }

    if (status) {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};

      if (startDate) {
        where.createdAt[Op.gte] = new Date(startDate);
      }

      if (endDate) {
        where.createdAt[Op.lte] = new Date(endDate);
      }
    }

    const skip = (page - 1) * limit;

    const { count, rows: transactions } =
      await this.transactionModel.findAndCountAll({
        where,
        order: [['createdAt', 'DESC']],
        offset: skip,
        limit,
      });

    return {
      data: transactions,
      meta: {
        total: count,
        page,
        limit,
        totalPages: Math.ceil(count / limit),
      },
    };
  }
}
