import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Address } from './models/address.model';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectModel(Address)
    private readonly addressModel: typeof Address,
  ) {}

  async create(userId: string, createAddressDto: CreateAddressDto): Promise<Address> {
    const { isDefault, ...addressData } = createAddressDto;

    if (isDefault) {
      await this.removeDefaultFromAll(userId);
    } else {
      const hasDefault = await this.addressModel.findOne({
        where: { userId, isDefault: true },
      });

      if (!hasDefault) {
        createAddressDto.isDefault = true;
      }
    }

    return await this.addressModel.create({
      ...addressData,
      userId,
      isDefault: createAddressDto.isDefault || false,
    });
  }

  async findAll(userId: string): Promise<Address[]> {
    return await this.addressModel.findAll({
      where: { userId },
      order: [['isDefault', 'DESC'], ['createdAt', 'DESC']],
    });
  }

  async findOne(id: string, userId: string): Promise<Address> {
    const address = await this.addressModel.findOne({
      where: { id, userId },
    });

    if (!address) {
      throw new NotFoundException('Endereço não encontrado');
    }

    return address;
  }

  async findDefault(userId: string): Promise<Address | null> {
    return await this.addressModel.findOne({
      where: { userId, isDefault: true },
    });
  }

  async update(id: string, userId: string, updateAddressDto: UpdateAddressDto): Promise<Address> {
    const address = await this.findOne(id, userId);

    if (updateAddressDto.isDefault) {
      await this.removeDefaultFromAll(userId);
    }

    await address.update(updateAddressDto);

    return await this.addressModel.findOne({
      where: { id, userId },
    });
  }

  async setAsDefault(id: string, userId: string): Promise<Address> {
    const address = await this.findOne(id, userId);

    await this.removeDefaultFromAll(userId);

    await address.update({ isDefault: true });

    return await this.addressModel.findOne({
      where: { id, userId },
    });
  }

  async remove(id: string, userId: string): Promise<void> {
    const address = await this.findOne(id, userId);

    if (address.isDefault) {
      const otherAddresses = await this.addressModel.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
      });

      if (otherAddresses.length > 1) {
        const newDefault = otherAddresses.find((addr) => addr.id !== id);
        if (newDefault) {
          await newDefault.update({ isDefault: true });
        }
      }
    }

    await address.destroy();
  }

  private async removeDefaultFromAll(userId: string): Promise<void> {
    await this.addressModel.update(
      { isDefault: false },
      { where: { userId, isDefault: true } },
    );
  }
}

