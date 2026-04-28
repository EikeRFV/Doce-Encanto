import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  IsOptional,
  IsEnum,
  MinLength,
  Matches,
} from 'class-validator';
import { UserRole } from '../../../common/enums/user-role.enum';

export class CreateUserDto {
  @ApiProperty({
    example: 'João Silva',
    description: 'Nome completo do usuário',
  })
  @IsNotEmpty({ message: 'O nome completo é obrigatório' })
  @IsString({ message: 'O nome completo deve ser uma string' })
  fullName: string;

  @ApiProperty({
    example: 'joao@example.com',
    description: 'Email do usuário',
  })
  @IsNotEmpty({ message: 'O email é obrigatório' })
  @IsEmail({}, { message: 'Email inválido' })
  email: string;

  @ApiProperty({
    example: 'Senha@123',
    description: 'Senha do usuário',
  })
  @IsNotEmpty({ message: 'A senha é obrigatória' })
  @MinLength(8, { message: 'A senha deve ter no mínimo 8 caracteres' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message:
        'A senha deve conter letras maiúsculas, minúsculas, números e caracteres especiais',
    },
  )
  password: string;

  @ApiProperty({
    example: '11987654321',
    description: 'Telefone do usuário',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O telefone deve ser uma string' })
  phone?: string;

  @ApiProperty({
    example: '12345678900',
    description: 'CPF do usuário',
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'O CPF deve ser uma string' })
  @Matches(/^\d{11}$/, { message: 'CPF deve conter 11 dígitos' })
  cpf?: string;

  @ApiProperty({
    example: UserRole.CUSTOMER,
    enum: UserRole,
    description: 'Papel do usuário',
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Papel inválido' })
  role?: UserRole;
}
