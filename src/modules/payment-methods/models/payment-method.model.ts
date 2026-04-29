import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  Unique,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { User } from '../../users/models/user.model';

export enum PaymentMethodType {
  CREDIT_CARD = 'CREDIT_CARD',
  DEBIT_CARD = 'DEBIT_CARD',
  PIX = 'PIX',
  WALLET = 'WALLET',
}

@Table({
  tableName: 'payment_methods',
  timestamps: true,
})
export class PaymentMethod extends Model<PaymentMethod> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId: string;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentMethodType)),
    allowNull: false,
  })
  type: PaymentMethodType;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  cardLastFourDigits: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  cardBrand: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  cardHolderName: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  cardExpiryMonth: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  cardExpiryYear: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  cardToken: string;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  isDefault: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => User)
  user: User;
}
