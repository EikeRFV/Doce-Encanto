import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address } from './entities/address.entity';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(Address)
    private readonly addressRepository: Repository<Address>,
  ) {}

  async create(userId: string, createAddressDto: CreateAddressDto): Promise<Address> {
    const { isDefault, ...addressData } = createAddressDto;

    if (isDefault) {
      await this.removeDefaultFromAll(userId);
    } else {
      const hasDefault = await this.addressRepository.findOne({
        where: { userId, isDefault: true },
      });

      if (!hasDefault) {
        createAddressDto.isDefault = true;
      }
    }

    const address = this.addressRepository.create({
      ...addressData,
      userId,
      isDefault: createAddressDto.isDefault || false,
    });

    return await this.addressRepository.save(address);
  }

  async findAll(userId: string): Promise<Address[]> {
    return await this.addressRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  async findOne(id: string, userId: string): Promise<Address> {
    const address = await this.addressRepository.findOne({
      where: { id, userId },
    });

    if (!address) {
      throw new NotFoundException('Endereço não encontrado');
    }

    return address;
  }

  async findDefault(userId: string): Promise<Address | null> {
    return await this.addressRepository.findOne({
      where: { userId, isDefault: true },
    });
  }

  async update(id: string, userId: string, updateAddressDto: UpdateAddressDto): Promise<Address> {
    const address = await this.findOne(id, userId);

    if (updateAddressDto.isDefault) {
      await this.removeDefaultFromAll(userId);
    }

    Object.assign(address, updateAddressDto);

    return await this.addressRepository.save(address);
  }

  async setAsDefault(id: string, userId: string): Promise<Address> {
    const address = await this.findOne(id, userId);

    await this.removeDefaultFromAll(userId);

    address.isDefault = true;

    return await this.addressRepository.save(address);
  }

  async remove(id: string, userId: string): Promise<void> {
    const address = await this.findOne(id, userId);

    if (address.isDefault) {
      const otherAddresses = await this.addressRepository.find({
        where: { userId },
        order: { createdAt: 'DESC' },
      });

      if (otherAddresses.length > 1) {
        const newDefault = otherAddresses.find((addr) => addr.id !== id);
        if (newDefault) {
          newDefault.isDefault = true;
          await this.addressRepository.save(newDefault);
        }
      }
    }

    await this.addressRepository.remove(address);
  }

  private async removeDefaultFromAll(userId: string): Promise<void> {
    await this.addressRepository.update(
      { userId, isDefault: true },
      { isDefault: false },
    );
  }
}

