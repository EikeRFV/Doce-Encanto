import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { WalletsService } from './wallets.service';
import { WalletsController } from './wallets.controller';
import { UserWallet } from './models/user-wallet.model';
import { WalletTransaction } from './models/wallet-transaction.model';

@Module({
  imports: [SequelizeModule.forFeature([UserWallet, WalletTransaction])],
  controllers: [WalletsController],
  providers: [WalletsService],
  exports: [WalletsService],
})
export class WalletsModule {}

