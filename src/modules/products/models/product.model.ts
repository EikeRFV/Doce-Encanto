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
import { Category } from '../../categories/models/category.model';
import { ProductImage } from './product-image.model';
import { OrderItem } from '../../orders/models/order-item.model';
import { Review } from '../../reviews/models/review.model';

@Table({
  tableName: 'products',
  timestamps: true,
})
export class Product extends Model<Product> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  slug: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description: string;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: false,
  })
  price: number;

  @Column({
    type: DataType.DECIMAL(10, 2),
    allowNull: true,
  })
  compareAtPrice: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  stockQuantity: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  sku: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  weight: number;

  @ForeignKey(() => Category)
  @Column({
    type: DataType.UUID,
    allowNull: false,
  })
  categoryId: string;

  @Default(true)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  isActive: boolean;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  isFeatured: boolean;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
  })
  tags: string[];

  @Default(0)
  @Column({
    type: DataType.DECIMAL(3, 2),
    allowNull: false,
  })
  averageRating: number;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  reviewCount: number;

  @CreatedAt
  @Column({
    type: DataType.DATE,
    field: 'createdAt',
  })
  createdAt: Date;

  @UpdatedAt
  @Column({
    type: DataType.DATE,
    field: 'updatedAt',
  })
  updatedAt: Date;

  // Relationships
  @BelongsTo(() => Category)
  category: Category;

  @HasMany(() => ProductImage)
  images: ProductImage[];

  @HasMany(() => OrderItem)
  orderItems: OrderItem[];

  @HasMany(() => Review)
  reviews: Review[];
}

// Made with Bob
