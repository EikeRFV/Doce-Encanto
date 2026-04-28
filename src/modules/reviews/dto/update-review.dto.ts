import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReviewDto {
  @ApiPropertyOptional({ description: 'Avaliação (1-5 estrelas)', minimum: 1, maximum: 5 })
  @IsOptional()
  @IsInt({ message: 'Avaliação deve ser um número inteiro' })
  @Min(1, { message: 'Avaliação mínima é 1 estrela' })
  @Max(5, { message: 'Avaliação máxima é 5 estrelas' })
  rating?: number;

  @ApiPropertyOptional({ description: 'Comentário da avaliação' })
  @IsOptional()
  @IsString()
  comment?: string;
}

