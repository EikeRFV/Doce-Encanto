import { IsNotEmpty, IsString, IsInt, Min, Max, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: 'ID do produto' })
  @IsNotEmpty({ message: 'ID do produto é obrigatório' })
  @IsUUID('4', { message: 'ID do produto deve ser um UUID válido' })
  productId: string;

  @ApiProperty({ description: 'Avaliação (1-5 estrelas)', minimum: 1, maximum: 5 })
  @IsNotEmpty({ message: 'Avaliação é obrigatória' })
  @IsInt({ message: 'Avaliação deve ser um número inteiro' })
  @Min(1, { message: 'Avaliação mínima é 1 estrela' })
  @Max(5, { message: 'Avaliação máxima é 5 estrelas' })
  rating: number;

  @ApiProperty({ description: 'Comentário da avaliação' })
  @IsNotEmpty({ message: 'Comentário é obrigatório' })
  @IsString()
  comment: string;
}

