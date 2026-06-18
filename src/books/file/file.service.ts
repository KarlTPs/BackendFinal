import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import { v2 as CloudinaryType } from 'cloudinary';
import { Readable } from 'stream';
import { CLOUDINARY } from '../cloudinary.provider';

export interface UploadResult {
  url: string;
  publicId: string;
}

@Injectable()
export class FileService {
  constructor(
    @Inject(CLOUDINARY) private cloudinary: typeof CloudinaryType,
  ) {}

  /**
   * Sube una imagen de portada a Cloudinary desde un buffer en memoria.
   * Multer debe estar configurado con memoryStorage() para que esto funcione.
   */
  async uploadCoverImage(file: Express.Multer.File): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('No se proporcionó ningún archivo');
    }

    return new Promise((resolve, reject) => {
      const uploadStream = this.cloudinary.uploader.upload_stream(
        {
          folder: 'book-reviews/covers',
          resource_type: 'image',
          transformation: [{ width: 600, height: 900, crop: 'limit' }],
        },
        (error, result) => {
          if (error || !result) {
            return reject(
              new BadRequestException(
                `Error al subir la imagen: ${error?.message ?? 'desconocido'}`,
              ),
            );
          }
          resolve({ url: result.secure_url, publicId: result.public_id });
        },
      );

      Readable.from(file.buffer).pipe(uploadStream);
    });
  }

  async deleteCoverImage(publicId: string): Promise<void> {
    await this.cloudinary.uploader.destroy(publicId);
  }
}