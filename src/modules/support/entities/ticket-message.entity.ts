import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { SupportTicket } from './support-ticket.entity';
import { User } from '../../users/entities/user.entity';

@Entity('ticket_messages')
export class TicketMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  ticketId: string;

  @Column()
  userId: string;

  @Column({ type: 'text' })
  message: string;

  @Column({ default: false })
  isInternal: boolean;

  @Column({ type: 'simple-array', nullable: true })
  attachments: string[];

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => SupportTicket, (ticket) => ticket.messages)
  @JoinColumn({ name: 'ticketId' })
  ticket: SupportTicket;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;
}

