import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { UserWallet } from './user-wallet.model';

export enum TransactionType {
  CREDIT = 'CREDIT',
  DEBIT = 'DEBIT',
  REFUND = 'REFUND',
  VOUCHER = 'VOUCHER',
  PURCHASE = 'PURCHASE',
}

export enum TransactionStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
}

@Table({
  tableName: 'wallet_transactions',
  timestamps: false,
})
export class WalletTransaction extends Model<WalletTransaction> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => UserWallet)
  @Column(DataType.UUID)
  walletId: string;

  @Column({
    type: DataType.ENUM(...Object.values(TransactionType)),
    allowNull: false,
  })
  type: TransactionType;

  @Default(TransactionStatus.PENDING)
  @Column({
    type: DataType.ENUM(...Object.values(TransactionStatus)),
    allowNull: false,
  })
  status: TransactionStatus;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  amount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  previousBalance: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  newBalance: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  orderId: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  referenceId: string;

  @CreatedAt
  createdAt: Date;

  @BelongsTo(() => UserWallet)
  wallet: UserWallet;
}
