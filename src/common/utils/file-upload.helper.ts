import { BadRequestException } from '@nestjs/common';
import { extname } from 'path';
import { v4 as uuidv4 } from 'uuid';

// Filtro de arquivos de imagem
export const imageFileFilter = (req: any, file: any, callback: any) => {
  if (!file.originalname.match(/\.(jpg|jpeg|png|gif|webp)$/i)) {
    return callback(
      new BadRequestException(
        'Apenas arquivos de imagem são permitidos (jpg, jpeg, png, gif, webp)',
      ),
      false,
    );
  }
  callback(null, true);
};

// Gerar nome único para arquivo
export const editFileName = (req: any, file: any, callback: any) => {
  const fileExtName = extname(file.originalname);
  const randomName = uuidv4();
  callback(null, `${randomName}${fileExtName}`);
};

// Validar tamanho do arquivo (5MB)
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Validar múltiplos arquivos
export const validateFiles = (files: any[]) => {
  if (!files || files.length === 0) {
    throw new BadRequestException('Nenhum arquivo foi enviado');
  }

  if (files.length > 5) {
    throw new BadRequestException('Máximo de 5 imagens por vez');
  }

  files.forEach((file) => {
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(
        `Arquivo ${file.originalname} excede o tamanho máximo de 5MB`,
      );
    }
  });
};

