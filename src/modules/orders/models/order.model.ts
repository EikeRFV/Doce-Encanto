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
  HasMany,
} from 'sequelize-typescript';
import { User } from '../../users/models/user.model';
import { OrderItem } from './order-item.model';
import { OrderStatus } from '../../../common/enums/order-status.enum';
import { PaymentMethod } from '../../../common/enums/payment-method.enum';

@Table({
  tableName: 'orders',
  timestamps: true,
})
export class Order extends Model<Order> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId: string;

  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  orderNumber: string;

  @Column({
    type: DataType.ENUM(...Object.values(OrderStatus)),
    defaultValue: OrderStatus.PENDING,
    allowNull: false,
  })
  status: OrderStatus;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  subtotal: number;

  @Default(0)
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  discount: number;

  @Default(0)
  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  shippingCost: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  total: number;

  @Column({
    type: DataType.ENUM(...Object.values(PaymentMethod)),
    allowNull: false,
  })
  paymentMethod: PaymentMethod;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  paymentId: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  pixQrCode: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  pixQrCodeUrl: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  shippingAddress: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  paidAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  shippedAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  deliveredAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  cancelledAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => User)
  user: User;

  @HasMany(() => OrderItem)
  items: OrderItem[];
}
