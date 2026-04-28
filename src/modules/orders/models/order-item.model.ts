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
import { Product } from '../../products/models/product.model';

@Table({
  tableName: 'order_items',
  timestamps: true,
  updatedAt: false,
})
export class OrderItem extends Model<OrderItem> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  orderId: string;

  @ForeignKey(() => Product)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  productId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  productName: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  unitPrice: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  quantity: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  subtotal: number;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'createdAt',
  })
  createdAt: Date;

  // Relationships
  @BelongsTo(() => Product)
  product: Product;
}

// Made with Bob
