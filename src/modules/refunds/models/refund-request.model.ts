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
import { Order } from '../../orders/models/order.model';

export enum RefundStatus {
  PENDING = 'PENDING',
  UNDER_REVIEW = 'UNDER_REVIEW',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
}

export enum RefundReason {
  DEFECTIVE_PRODUCT = 'DEFECTIVE_PRODUCT',
  WRONG_PRODUCT = 'WRONG_PRODUCT',
  NOT_AS_DESCRIBED = 'NOT_AS_DESCRIBED',
  DAMAGED_SHIPPING = 'DAMAGED_SHIPPING',
  LATE_DELIVERY = 'LATE_DELIVERY',
  CHANGED_MIND = 'CHANGED_MIND',
  OTHER = 'OTHER',
}

@Table({
  tableName: 'refund_requests',
  timestamps: true,
})
export class RefundRequest extends Model<RefundRequest> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  refundNumber: string;

  @ForeignKey(() => Order)
  @Column(DataType.UUID)
  orderId: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId: string;

  @Column({
    type: DataType.ENUM(...Object.values(RefundReason)),
    allowNull: false,
  })
  reason: RefundReason;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  requestedAmount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  approvedAmount: number;

  @Default(RefundStatus.PENDING)
  @Column({
    type: DataType.ENUM(...Object.values(RefundStatus)),
    allowNull: false,
  })
  status: RefundStatus;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
  })
  attachments: string[];

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  reviewedById: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  reviewedAt: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  reviewNotes: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  approvedById: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  approvedAt: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  approvalNotes: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  processedById: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  processedAt: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  processingNotes: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @BelongsTo(() => Order)
  order: Order;

  @BelongsTo(() => User, { foreignKey: 'userId' })
  user: User;

  @BelongsTo(() => User, { foreignKey: 'reviewedById' })
  reviewedBy: User;

  @BelongsTo(() => User, { foreignKey: 'approvedById' })
  approvedBy: User;

  @BelongsTo(() => User, { foreignKey: 'processedById' })
  processedBy: User;
}
