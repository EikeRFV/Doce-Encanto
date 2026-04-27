import {
  Injectable,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, DataSource } from 'typeorm';
import { UserWallet } from './entities/user-wallet.entity';
import {
  WalletTransaction,
  TransactionType,
  TransactionStatus,
} from './entities/wallet-transaction.entity';
import { AddCreditsDto } from './dto/add-credits.dto';
import { UseCreditsDto } from './dto/use-credits.dto';
import { QueryTransactionsDto } from './dto/query-transactions.dto';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(UserWallet)
    private readonly walletRepository: Repository<UserWallet>,
    @InjectRepository(WalletTransaction)
    private readonly transactionRepository: Repository<WalletTransaction>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Regra de Negócio #11: Criação automática de carteira
   * Ao criar um usuário, uma carteira é automaticamente criada com saldo zero
   */
  async createWallet(userId: string): Promise<UserWallet> {
    const existingWallet = await this.walletRepository.findOne({
      where: { userId },
    });

    if (existingWallet) {
      throw new BadRequestException('Usuário já possui uma carteira');
    }

    const wallet = this.walletRepository.create({
      userId,
      balance: 0,
    });

    return await this.walletRepository.save(wallet);
  }

  /**
   * Regra de Negócio #12: Consulta de saldo
   * Retorna o saldo atual da carteira do usuário
   */
  async getBalance(userId: string): Promise<UserWallet> {
    const wallet = await this.walletRepository.findOne({
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

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Busca ou cria carteira
      let wallet = await queryRunner.manager.findOne(UserWallet, {
        where: { userId },
      });

      if (!wallet) {
        wallet = queryRunner.manager.create(UserWallet, {
          userId,
          balance: 0,
        });
        await queryRunner.manager.save(wallet);
      }

      const previousBalance = wallet.balance;
      const newBalance = previousBalance + amount;

      // Atualiza saldo
      wallet.balance = newBalance;
      await queryRunner.manager.save(wallet);

      // Cria transação
      const transaction = queryRunner.manager.create(WalletTransaction, {
        walletId: wallet.id,
        type: TransactionType.CREDIT,
        amount,
        previousBalance,
        newBalance,
        description: description || 'Recarga de créditos',
        status: TransactionStatus.COMPLETED,
      });

      await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();

      return transaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new InternalServerErrorException(
        'Erro ao adicionar créditos: ' + error.message,
      );
    } finally {
      await queryRunner.release();
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

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await queryRunner.manager.findOne(UserWallet, {
        where: { userId },
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
      await queryRunner.manager.save(wallet);

      // Cria transação
      const transaction = queryRunner.manager.create(WalletTransaction, {
        walletId: wallet.id,
        type: TransactionType.DEBIT,
        amount,
        previousBalance,
        newBalance,
        orderId,
        description: description || 'Uso de créditos',
        status: TransactionStatus.COMPLETED,
      });

      await queryRunner.manager.save(transaction);
      await queryRunner.commitTransaction();

      return transaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Erro ao usar créditos: ' + error.message,
      );
    } finally {
      await queryRunner.release();
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
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await queryRunner.manager.findOne(UserWallet, {
        where: { userId },
      });

      if (!wallet) {
        throw new NotFoundException('Carteira não encontrada');
      }

      const originalTransaction = await queryRunner.manager.findOne(
        WalletTransaction,
        {
          where: { id: transactionId, walletId: wallet.id },
        },
      );

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
      await queryRunner.manager.save(wallet);

      // Marca transação original como estornada
      originalTransaction.status = TransactionStatus.REFUNDED;
      await queryRunner.manager.save(originalTransaction);

      // Cria transação de estorno
      const refundTransaction = queryRunner.manager.create(WalletTransaction, {
        walletId: wallet.id,
        type: TransactionType.REFUND,
        amount: originalTransaction.amount,
        previousBalance,
        newBalance,
        orderId: originalTransaction.orderId,
        description: `Estorno: ${reason}`,
        status: TransactionStatus.COMPLETED,
      });

      await queryRunner.manager.save(refundTransaction);
      await queryRunner.commitTransaction();

      return refundTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Erro ao estornar créditos: ' + error.message,
      );
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Lista transações da carteira com filtros e paginação
   */
  async getTransactions(userId: string, query: QueryTransactionsDto) {
    const { page = 1, limit = 10, type, startDate, endDate } = query;

    const wallet = await this.walletRepository.findOne({
      where: { userId },
    });

    if (!wallet) {
      throw new NotFoundException('Carteira não encontrada');
    }

    const queryBuilder = this.transactionRepository
      .createQueryBuilder('transaction')
      .where('transaction.walletId = :walletId', { walletId: wallet.id });

    // Filtro por tipo
    if (type) {
      queryBuilder.andWhere('transaction.type = :type', { type });
    }

    // Filtro por data
    if (startDate && endDate) {
      queryBuilder.andWhere('transaction.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('transaction.createdAt >= :startDate', {
        startDate,
      });
    } else if (endDate) {
      queryBuilder.andWhere('transaction.createdAt <= :endDate', { endDate });
    }

    // Ordenação e paginação
    queryBuilder
      .orderBy('transaction.createdAt', 'DESC')
      .skip((page - 1) * limit)
      .take(limit);

    const [transactions, total] = await queryBuilder.getManyAndCount();

    return {
      data: transactions,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Regra de Negócio #17: Bônus de boas-vindas
   * Adiciona créditos de bônus para novos usuários
   */
  async addWelcomeBonus(userId: string): Promise<WalletTransaction> {
    const WELCOME_BONUS = 10.0; // R$ 10,00 de bônus

    return await this.addCredits(userId, {
      amount: WELCOME_BONUS,
      description: 'Bônus de boas-vindas',
    });
  }

  /**
   * Regra de Negócio #18: Cashback em compras
   * Adiciona cashback de 5% do valor da compra
   */
  async addCashback(
    userId: string,
    orderValue: number,
    orderId: string,
  ): Promise<WalletTransaction> {
    const CASHBACK_PERCENTAGE = 0.05; // 5%
    const cashbackAmount = orderValue * CASHBACK_PERCENTAGE;

    return await this.addCredits(userId, {
      amount: cashbackAmount,
      description: `Cashback de 5% do pedido #${orderId}`,
    });
  }

  async findByUserId(userId: string): Promise<UserWallet> {
    return this.getBalance(userId);
  }

  async addBalance(userId: string, amount: number, description: string): Promise<WalletTransaction> {
    return this.addCredits(userId, { amount, description });
  }

  async deductBalance(userId: string, amount: number, description: string): Promise<WalletTransaction> {
    return this.useCredits(userId, { amount, description });
  }
}
