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
  HasMany,
  BelongsToMany,
  BeforeCreate,
  BeforeSave,
} from 'sequelize-typescript';
import { Order } from '../../orders/models/order.model';
import { Review } from '../../reviews/models/review.model';
import { Address } from '../../addresses/models/address.model';
import { UserRole } from '../../../common/enums/user-role.enum';
import { Exclude } from 'class-transformer';

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model<User> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  @Exclude()
  password: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  fullName: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  phone: string;

  @Unique
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  cpf: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    defaultValue: UserRole.CUSTOMER,
    allowNull: false,
  })
  role: UserRole;

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
  emailVerifiedAt: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastLoginAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => Order)
  orders: Order[];

  @HasMany(() => Review)
  reviews: Review[];

  @HasMany(() => Address)
  addresses: Address[];
}
