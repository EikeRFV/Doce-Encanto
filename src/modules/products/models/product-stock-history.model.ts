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
import { Product } from './product.model';
import { User } from '../../users/models/user.model';

export enum StockMovementType {
  PURCHASE = 'PURCHASE',
  SALE = 'SALE',
  ADJUSTMENT = 'ADJUSTMENT',
  RETURN = 'RETURN',
  DAMAGE = 'DAMAGE',
  LOSS = 'LOSS',
}

@Table({
  tableName: 'product_stock_history',
  timestamps: false,
})
export class ProductStockHistory extends Model<ProductStockHistory> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => Product)
  @Column(DataType.UUID)
  productId: string;

  @Column({
    type: DataType.ENUM(...Object.values(StockMovementType)),
    allowNull: false,
  })
  movementType: StockMovementType;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  quantity: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  previousStock: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  newStock: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  reason: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  orderId: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  userId: string;

  @CreatedAt
  createdAt: Date;

  @BelongsTo(() => Product)
  product: Product;

  @BelongsTo(() => User, { foreignKey: 'userId' })
  user: User;
}
