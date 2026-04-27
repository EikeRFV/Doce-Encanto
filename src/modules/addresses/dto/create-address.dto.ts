import { IsNotEmpty, IsString, IsBoolean, IsOptional, Matches, Length } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAddressDto {
  @ApiProperty({ description: 'Nome do destinatário' })
  @IsNotEmpty({ message: 'Nome do destinatário é obrigatório' })
  @IsString()
  recipientName: string;

  @ApiProperty({ description: 'CEP', example: '01310-100' })
  @IsNotEmpty({ message: 'CEP é obrigatório' })
  @IsString()
  @Matches(/^\d{5}-?\d{3}$/, { message: 'CEP inválido' })
  zipCode: string;

  @ApiProperty({ description: 'Rua/Avenida' })
  @IsNotEmpty({ message: 'Rua é obrigatória' })
  @IsString()
  street: string;

  @ApiProperty({ description: 'Número' })
  @IsNotEmpty({ message: 'Número é obrigatório' })
  @IsString()
  number: string;

  @ApiPropertyOptional({ description: 'Complemento' })
  @IsOptional()
  @IsString()
  complement?: string;

  @ApiProperty({ description: 'Bairro' })
  @IsNotEmpty({ message: 'Bairro é obrigatório' })
  @IsString()
  neighborhood: string;

  @ApiProperty({ description: 'Cidade' })
  @IsNotEmpty({ message: 'Cidade é obrigatória' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'Estado (UF)', example: 'SP' })
  @IsNotEmpty({ message: 'Estado é obrigatório' })
  @IsString()
  @Length(2, 2, { message: 'Estado deve ter 2 caracteres' })
  state: string;

  @ApiPropertyOptional({ description: 'Telefone de contato' })
  @IsOptional()
  @IsString()
  @Matches(/^\(\d{2}\)\s?\d{4,5}-?\d{4}$/, { message: 'Telefone inválido' })
  phone?: string;

  @ApiPropertyOptional({ description: 'Definir como endereço padrão', default: false })
  @IsOptional()
  @IsBoolean()
  isDefault?: boolean;
}

