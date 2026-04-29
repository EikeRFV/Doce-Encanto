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
import { TicketMessage } from './ticket-message.model';

export enum TicketStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  WAITING_CUSTOMER = 'WAITING_CUSTOMER',
  RESOLVED = 'RESOLVED',
  CLOSED = 'CLOSED',
}

export enum TicketPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

export enum TicketCategory {
  GENERAL = 'GENERAL',
  ORDER = 'ORDER',
  PAYMENT = 'PAYMENT',
  PRODUCT = 'PRODUCT',
  REFUND = 'REFUND',
  TECHNICAL = 'TECHNICAL',
  ACCOUNT = 'ACCOUNT',
}

@Table({
  tableName: 'support_tickets',
  timestamps: true,
})
export class SupportTicket extends Model<SupportTicket> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
  })
  ticketNumber: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId: string;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  assignedToId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  subject: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description: string;

  @Default(TicketStatus.OPEN)
  @Column({
    type: DataType.ENUM(...Object.values(TicketStatus)),
    allowNull: false,
  })
  status: TicketStatus;

  @Default(TicketPriority.MEDIUM)
  @Column({
    type: DataType.ENUM(...Object.values(TicketPriority)),
    allowNull: false,
  })
  priority: TicketPriority;

  @Default(TicketCategory.GENERAL)
  @Column({
    type: DataType.ENUM(...Object.values(TicketCategory)),
    allowNull: false,
  })
  category: TicketCategory;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  orderId: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  resolvedAt: Date;

  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  resolvedById: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  resolutionNotes: string;

  @CreatedAt
  createdAt: Date;

  @BelongsTo(() => User, { foreignKey: 'userId' })
  user: User;

  @BelongsTo(() => User, { foreignKey: 'assignedToId' })
  assignedTo: User;

  @BelongsTo(() => User, { foreignKey: 'resolvedById' })
  resolvedBy: User;

  @HasMany(() => TicketMessage)
  messages: TicketMessage[];
}
