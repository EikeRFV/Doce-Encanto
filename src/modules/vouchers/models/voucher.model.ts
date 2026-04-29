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
} from 'sequelize-typescript';

@Table({
  tableName: 'vouchers',
  timestamps: true,
})
export class Voucher extends Model<Voucher> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  code: string;

  @Default('FIXED')
  @Column({
    type: DataType.ENUM('PERCENTAGE', 'FIXED'),
    allowNull: false,
  })
  discountType: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  discountValue: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  minPurchaseAmount: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  maxDiscountAmount: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  usageLimit: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  usedCount: number;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  isActive: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  expiresAt: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
