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
  HasMany,
} from 'sequelize-typescript';
import { User } from '../../users/models/user.model';
import { WalletTransaction } from './wallet-transaction.model';

@Table({
  tableName: 'user_wallets',
  timestamps: true,
})
export class UserWallet extends Model<UserWallet> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId: string;

  @Default(0)
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  balance: number;

  @Default(0)
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  totalEarned: number;

  @Default(0)
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  totalSpent: number;

  @CreatedAt
  createdAt: Date;

  @BelongsTo(() => User)
  user: User;

  @HasMany(() => WalletTransaction)
  transactions: WalletTransaction[];
}
