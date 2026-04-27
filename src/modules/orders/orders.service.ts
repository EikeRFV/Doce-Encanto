import { Injectable, NotFoundException, BadRequestException, Inject } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto, PaymentMethodType } from './dto/create-order.dto';
import { UpdateOrderStatusDto } from './dto/update-order-status.dto';
import { QueryOrdersDto } from './dto/query-orders.dto';
import { OrderStatus } from '../../common/enums/order-status.enum';
import { PaymentMethod } from '../../common/enums/payment-method.enum';
import { Product } from '../products/entities/product.entity';
import { Address } from '../addresses/entities/address.entity';
import { Voucher } from '../vouchers/entities/voucher.entity';
import { WalletsService } from '../wallets/wallets.service';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
    @InjectRepository(Voucher)
    private readonly voucherRepository: Repository<Voucher>,
    private readonly walletsService: WalletsService,
    @Inject(CACHE_MANAGER)
    private cacheManager: Cache,
  ) {}

  async create(userId: string, createOrderDto: CreateOrderDto): Promise<Order> {
    const { items, addressId, paymentMethod, voucherCode, notes } = createOrderDto;

    const address = await this.addressRepository.findOne({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Endereço não encontrado');
    }

    let subtotal = 0;
    const orderItems: OrderItem[] = [];

    for (const item of items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException(`Produto ${item.productId} não encontrado`);
      }

      if (!product.isActive) {
        throw new BadRequestException(`Produto ${product.name} não está disponível`);
      }

      if (product.stockQuantity < item.quantity) {
        throw new BadRequestException(
          `Estoque insuficiente para ${product.name}. Disponível: ${product.stockQuantity}`,
        );
      }

      const itemTotal = Number(product.price) * item.quantity;
      subtotal += itemTotal;

      const orderItem = this.orderItemRepository.create({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: product.price,
        subtotal: itemTotal,
      });

      orderItems.push(orderItem);

      product.stockQuantity -= item.quantity;
      await this.productRepository.save(product);
    }

    let discount = 0;
    if (voucherCode) {
      const voucher = await this.voucherRepository.findOne({
        where: { code: voucherCode, isActive: true },
      });

      if (voucher) {
        if (voucher.expiresAt && new Date(voucher.expiresAt) < new Date()) {
          throw new BadRequestException('Voucher expirado');
        }

        if (voucher.usageLimit && voucher.usedCount >= voucher.usageLimit) {
          throw new BadRequestException('Voucher atingiu o limite de uso');
        }

        if (voucher.minPurchaseAmount && subtotal < Number(voucher.minPurchaseAmount)) {
          throw new BadRequestException(
            `Valor mínimo de compra para este voucher: R$ ${voucher.minPurchaseAmount}`,
          );
        }

        if (voucher.discountType === 'PERCENTAGE') {
          discount = (subtotal * Number(voucher.discountValue)) / 100;
          if (voucher.maxDiscountAmount) {
            discount = Math.min(discount, Number(voucher.maxDiscountAmount));
          }
        } else {
          discount = Number(voucher.discountValue);
        }

        voucher.usedCount += 1;
        await this.voucherRepository.save(voucher);
      }
    }

    const shippingCost = this.calculateShipping(subtotal);
    const total = subtotal - discount + shippingCost;

    if (paymentMethod === PaymentMethodType.WALLET) {
      const wallet = await this.walletsService.findByUserId(userId);
      if (Number(wallet.balance) < total) {
        throw new BadRequestException('Saldo insuficiente na carteira');
      }
    }

    const orderNumber = await this.generateOrderNumber();

    const order = this.orderRepository.create({
      userId,
      orderNumber,
      status: OrderStatus.PENDING,
      subtotal,
      discount,
      shippingCost,
      total,
      paymentMethod: this.mapPaymentMethod(paymentMethod),
      shippingAddress: this.formatAddress(address),
      notes,
      items: orderItems,
    });

    const savedOrder = await this.orderRepository.save(order);

    if (paymentMethod === PaymentMethodType.WALLET) {
      await this.walletsService.deductBalance(userId, total, `Pagamento do pedido ${orderNumber}`);
      savedOrder.status = OrderStatus.PAYMENT_CONFIRMED;
      savedOrder.paidAt = new Date();
      await this.orderRepository.save(savedOrder);
    } else if (paymentMethod === PaymentMethodType.PIX) {
      savedOrder.pixQrCode = this.generatePixQrCode(total, orderNumber);
      savedOrder.pixQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${savedOrder.pixQrCode}`;
      await this.orderRepository.save(savedOrder);
    }

    await this.cacheManager.del(`user_orders_${userId}`);

    return this.findOne(savedOrder.id);
  }

  async findAll(query: QueryOrdersDto, userId?: string) {
    const {
      page = 1,
      limit = 10,
      status,
      paymentMethod,
      orderNumber,
      startDate,
      endDate,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = query;

    const queryBuilder = this.orderRepository
      .createQueryBuilder('order')
      .leftJoinAndSelect('order.items', 'items')
      .leftJoinAndSelect('order.user', 'user');

    if (userId) {
      queryBuilder.andWhere('order.userId = :userId', { userId });
    }

    if (status) {
      queryBuilder.andWhere('order.status = :status', { status });
    }

    if (paymentMethod) {
      queryBuilder.andWhere('order.paymentMethod = :paymentMethod', { paymentMethod });
    }

    if (orderNumber) {
      queryBuilder.andWhere('order.orderNumber ILIKE :orderNumber', {
        orderNumber: `%${orderNumber}%`,
      });
    }

    if (startDate && endDate) {
      queryBuilder.andWhere('order.createdAt BETWEEN :startDate AND :endDate', {
        startDate,
        endDate,
      });
    } else if (startDate) {
      queryBuilder.andWhere('order.createdAt >= :startDate', { startDate });
    } else if (endDate) {
      queryBuilder.andWhere('order.createdAt <= :endDate', { endDate });
    }

    const validSortFields = ['createdAt', 'total', 'status', 'orderNumber'];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'createdAt';
    queryBuilder.orderBy(`order.${sortField}`, sortOrder);

    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [orders, total] = await queryBuilder.getManyAndCount();

    return {
      data: orders,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: ['items', 'user'],
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    return order;
  }

  async findByOrderNumber(orderNumber: string): Promise<Order> {
    const order = await this.orderRepository.findOne({
      where: { orderNumber },
      relations: ['items', 'user'],
    });

    if (!order) {
      throw new NotFoundException('Pedido não encontrado');
    }

    return order;
  }

  async updateStatus(id: string, updateStatusDto: UpdateOrderStatusDto): Promise<Order> {
    const order = await this.findOne(id);
    const { status, notes } = updateStatusDto;

    this.validateStatusTransition(order.status, status);

    order.status = status;

    if (notes) {
      order.notes = order.notes ? `${order.notes}\n${notes}` : notes;
    }

    if (status === OrderStatus.PAYMENT_CONFIRMED && !order.paidAt) {
      order.paidAt = new Date();
    } else if (status === OrderStatus.SHIPPED && !order.shippedAt) {
      order.shippedAt = new Date();
    } else if (status === OrderStatus.DELIVERED && !order.deliveredAt) {
      order.deliveredAt = new Date();
    } else if (status === OrderStatus.CANCELLED && !order.cancelledAt) {
      order.cancelledAt = new Date();
      await this.restoreStock(order);
    }

    await this.cacheManager.del(`user_orders_${order.userId}`);

    return await this.orderRepository.save(order);
  }

  async cancelOrder(id: string, userId: string): Promise<Order> {
    const order = await this.findOne(id);

    if (order.userId !== userId) {
      throw new BadRequestException('Você não tem permissão para cancelar este pedido');
    }

    if (![OrderStatus.PENDING, OrderStatus.PAYMENT_PENDING, OrderStatus.PAYMENT_CONFIRMED].includes(order.status)) {
      throw new BadRequestException('Pedido não pode ser cancelado neste status');
    }

    if (order.status === OrderStatus.PAYMENT_CONFIRMED && order.paymentMethod === PaymentMethod.WALLET) {
      await this.walletsService.addBalance(
        userId,
        Number(order.total),
        `Reembolso do pedido cancelado ${order.orderNumber}`,
      );
    }

    order.status = OrderStatus.CANCELLED;
    order.cancelledAt = new Date();

    await this.restoreStock(order);
    await this.cacheManager.del(`user_orders_${userId}`);

    return await this.orderRepository.save(order);
  }

  async getOrderStats(userId?: string) {
    const queryBuilder = this.orderRepository.createQueryBuilder('order');

    if (userId) {
      queryBuilder.where('order.userId = :userId', { userId });
    }

    const [total, pending, paid, shipped, delivered, cancelled] = await Promise.all([
      queryBuilder.getCount(),
      queryBuilder.clone().andWhere('order.status = :status', { status: OrderStatus.PENDING }).getCount(),
      queryBuilder.clone().andWhere('order.status = :status', { status: OrderStatus.PAYMENT_CONFIRMED }).getCount(),
      queryBuilder.clone().andWhere('order.status = :status', { status: OrderStatus.SHIPPED }).getCount(),
      queryBuilder.clone().andWhere('order.status = :status', { status: OrderStatus.DELIVERED }).getCount(),
      queryBuilder.clone().andWhere('order.status = :status', { status: OrderStatus.CANCELLED }).getCount(),
    ]);

    const totalRevenue = await queryBuilder
      .clone()
      .select('SUM(order.total)', 'sum')
      .where('order.status IN (:...statuses)', {
        statuses: [OrderStatus.PAYMENT_CONFIRMED, OrderStatus.SHIPPED, OrderStatus.DELIVERED],
      })
      .getRawOne();

    return {
      total,
      byStatus: {
        pending,
        paid,
        shipped,
        delivered,
        cancelled,
      },
      totalRevenue: Number(totalRevenue?.sum || 0),
    };
  }

  private async generateOrderNumber(): Promise<string> {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');

    return `ORD-${year}${month}${day}-${random}`;
  }

  private calculateShipping(subtotal: number): number {
    if (subtotal >= 200) return 0;
    if (subtotal >= 100) return 10;
    return 15;
  }

  private mapPaymentMethod(method: PaymentMethodType): PaymentMethod {
    const mapping = {
      [PaymentMethodType.PIX]: PaymentMethod.PIX,
      [PaymentMethodType.CREDIT_CARD]: PaymentMethod.CREDIT_CARD,
      [PaymentMethodType.WALLET]: PaymentMethod.WALLET,
    };
    return mapping[method];
  }

  private formatAddress(address: Address): string {
    return `${address.street}, ${address.number}${address.complement ? ` - ${address.complement}` : ''}, ${address.neighborhood}, ${address.city} - ${address.state}, CEP: ${address.zipCode}`;
  }

  private generatePixQrCode(amount: number, orderNumber: string): string {
    return `00020126580014br.gov.bcb.pix0136${orderNumber}520400005303986540${amount.toFixed(2)}5802BR5925Doce Encanto6009SAO PAULO62070503***6304`;
  }

  private validateStatusTransition(currentStatus: OrderStatus, newStatus: OrderStatus): void {
    const validTransitions: Record<OrderStatus, OrderStatus[]> = {
      [OrderStatus.PENDING]: [OrderStatus.PAYMENT_PENDING, OrderStatus.CANCELLED],
      [OrderStatus.PAYMENT_PENDING]: [OrderStatus.PAYMENT_CONFIRMED, OrderStatus.CANCELLED],
      [OrderStatus.PAYMENT_CONFIRMED]: [OrderStatus.PROCESSING, OrderStatus.CANCELLED],
      [OrderStatus.PROCESSING]: [OrderStatus.SHIPPED, OrderStatus.CANCELLED],
      [OrderStatus.SHIPPED]: [OrderStatus.DELIVERED],
      [OrderStatus.DELIVERED]: [OrderStatus.REFUNDED],
      [OrderStatus.CANCELLED]: [],
      [OrderStatus.REFUNDED]: [],
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new BadRequestException(
        `Transição de status inválida: ${currentStatus} -> ${newStatus}`,
      );
    }
  }

  private async restoreStock(order: Order): Promise<void> {
    for (const item of order.items) {
      const product = await this.productRepository.findOne({
        where: { id: item.productId },
      });

      if (product) {
        product.stockQuantity += item.quantity;
        await this.productRepository.save(product);
      }
    }
  }
}

