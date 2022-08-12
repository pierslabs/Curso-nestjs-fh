import {
  BadRequestException,
  Controller,
  Get,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { diskStorage } from 'multer';
import { HandleFilesService } from './handle-files.service';
import { fileFilter, fileNamer } from './helpers';

@ApiTags('Products')
@Controller('files')
export class HandleFilesController {
  constructor(
    private readonly handleFilesService: HandleFilesService,
    private readonly configService: ConfigService,
  ) {}

  @Get('product/:imageName')
  getImage(@Res() res: Response, @Param('imageName') imageName: string) {
    const path = this.handleFilesService.getStaticproductImage(imageName);
    // res.status(403).json({
    //   ok: false,
    //   path: path,
    // });
    res.sendFile(path);
  }

  @Post('product')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      // limits: { fileSize: 1000 },
      storage: diskStorage({
        destination: './static/products',
        filename: fileNamer,
      }),
    }),
  )
  uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file)
      throw new BadRequestException('Make shure that file is an image');

    const secureURl = `${this.configService.get('HOST_API')}/files/product/${
      file.filename
    }`;

    return { secureURl };
  }
}
