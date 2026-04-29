import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { Order } from './models/order.model';
import { OrderItem } from './models/order-item.model';
import { Product } from '../products/models/product.model';
import { Address } from '../addresses/models/address.model';
import { Voucher } from '../vouchers/models/voucher.model';
import { WalletsModule } from '../wallets/wallets.module';

@Module({
  imports: [
    SequelizeModule.forFeature([Order, OrderItem, Product, Address, Voucher]),
    WalletsModule,
  ],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}

