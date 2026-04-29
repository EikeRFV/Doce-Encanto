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
import { SupportTicket } from './support-ticket.model';
import { User } from '../../users/models/user.model';

@Table({
  tableName: 'ticket_messages',
  timestamps: false,
})
export class TicketMessage extends Model<TicketMessage> {
  @PrimaryKey
  @Default(DataType.UUIDV4)
  @Column(DataType.UUID)
  id: string;

  @ForeignKey(() => SupportTicket)
  @Column(DataType.UUID)
  ticketId: string;

  @ForeignKey(() => User)
  @Column(DataType.UUID)
  userId: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  message: string;

  @Default(false)
  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  isInternal: boolean;

  @Column({
    type: DataType.ARRAY(DataType.STRING),
    allowNull: true,
  })
  attachments: string[];

  @CreatedAt
  createdAt: Date;

  @BelongsTo(() => SupportTicket)
  ticket: SupportTicket;

  @BelongsTo(() => User)
  user: User;
}
