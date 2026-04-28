import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Addresses')
@Controller('addresses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo endereço' })
  @ApiResponse({ status: 201, description: 'Endereço criado com sucesso' })
  create(@CurrentUser('id') userId: string, @Body() createAddressDto: CreateAddressDto) {
    return this.addressesService.create(userId, createAddressDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os endereços do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de endereços retornada com sucesso' })
  findAll(@CurrentUser('id') userId: string) {
    return this.addressesService.findAll(userId);
  }

  @Get('default')
  @ApiOperation({ summary: 'Buscar endereço padrão' })
  @ApiResponse({ status: 200, description: 'Endereço padrão encontrado' })
  @ApiResponse({ status: 404, description: 'Endereço padrão não encontrado' })
  findDefault(@CurrentUser('id') userId: string) {
    return this.addressesService.findDefault(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar endereço por ID' })
  @ApiResponse({ status: 200, description: 'Endereço encontrado' })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado' })
  findOne(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.addressesService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar endereço' })
  @ApiResponse({ status: 200, description: 'Endereço atualizado com sucesso' })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado' })
  update(
    @Param('id') id: string,
    @CurrentUser('id') userId: string,
    @Body() updateAddressDto: UpdateAddressDto,
  ) {
    return this.addressesService.update(id, userId, updateAddressDto);
  }

  @Patch(':id/set-default')
  @ApiOperation({ summary: 'Definir endereço como padrão' })
  @ApiResponse({ status: 200, description: 'Endereço definido como padrão' })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado' })
  setAsDefault(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.addressesService.setAsDefault(id, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir endereço' })
  @ApiResponse({ status: 204, description: 'Endereço excluído com sucesso' })
  @ApiResponse({ status: 404, description: 'Endereço não encontrado' })
  remove(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.addressesService.remove(id, userId);
  }
}

