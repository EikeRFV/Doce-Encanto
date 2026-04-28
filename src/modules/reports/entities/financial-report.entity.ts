import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum ReportType {
  DAILY = 'DAILY',
  WEEKLY = 'WEEKLY',
  MONTHLY = 'MONTHLY',
  QUARTERLY = 'QUARTERLY',
  YEARLY = 'YEARLY',
  CUSTOM = 'CUSTOM',
}

export enum ReportStatus {
  GENERATING = 'GENERATING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Entity('financial_reports')
export class FinancialReport {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  reportNumber: string;

  @Column({
    type: 'enum',
    enum: ReportType,
  })
  type: ReportType;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date' })
  endDate: Date;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalRevenue: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalRefunds: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  netRevenue: number;

  @Column({ type: 'int' })
  totalOrders: number;

  @Column({ type: 'int' })
  completedOrders: number;

  @Column({ type: 'int' })
  cancelledOrders: number;

  @Column({ type: 'int' })
  refundedOrders: number;

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  averageOrderValue: number;

  @Column({ type: 'int' })
  newCustomers: number;

  @Column({ type: 'int' })
  returningCustomers: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalDiscounts: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  totalShipping: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  walletCreditsUsed: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  walletCreditsAdded: number;

  @Column({ type: 'jsonb', nullable: true })
  topProducts: any;

  @Column({ type: 'jsonb', nullable: true })
  topCategories: any;

  @Column({ type: 'jsonb', nullable: true })
  paymentMethods: any;

  @Column({ type: 'jsonb', nullable: true })
  additionalMetrics: any;

  @Column({
    type: 'enum',
    enum: ReportStatus,
    default: ReportStatus.GENERATING,
  })
  status: ReportStatus;

  @Column({ nullable: true })
  generatedById: string;

  @Column({ nullable: true })
  filePath: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => User, { nullable: true })
  @JoinColumn({ name: 'generatedById' })
  generatedBy: User;
}

