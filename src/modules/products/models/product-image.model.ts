import {
  Table,
  Column,
  Model,
  DataType,
  PrimaryKey,
  Default,
  CreatedAt,
  UpdatedAt,
  ForeignKey,
  BelongsTo,
} from 'sequelize-typescript';
import { Product } from './product.model';

@Table({
  tableName: 'product_images',
  timestamps: true,
})
export class ProductImage extends Model<ProductImage> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

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
  url: string;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  isPrimary: boolean;

  @Default(0)
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  order: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  altText: string;

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
  @BelongsTo(() => Product)
  product: Product;
}

// Made with Bob
