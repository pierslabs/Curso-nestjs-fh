import { BadRequestException, Injectable } from '@nestjs/common';
import { existsSync } from 'fs';
import { join } from 'path';

@Injectable()
export class HandleFilesService {
  getStaticproductImage(imageName: string) {
    const path = join(__dirname, '../../static/products', imageName);

    if (!existsSync)
      throw new BadRequestException(`No product found with image`);

    return path;
  }
}
