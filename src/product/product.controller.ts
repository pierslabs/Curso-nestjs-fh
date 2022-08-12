import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  ParseUUIDPipe,
  Query,
} from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationDTO } from './dto/pagination.dto';
import { Auth, GetUser } from 'src/auth/decorators';
import { EValidRoles } from 'src/auth/interfaces';
import { User } from '../auth/entities/auth.entity';

@Controller('product')
// @Auth()
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Post()
  @Auth(EValidRoles.admin)
  create(@Body() createProductDto: CreateProductDto, @GetUser() user: User) {
    return this.productService.create(createProductDto, user);
  }

  @Get()
  findAll(@Query() paginationDTO: PaginationDTO) {
    return this.productService.findAll(paginationDTO);
  }

  @Get(':id')
  findOne(@Param('id') term: string) {
    return this.productService.findOnePlain(term);
  }

  @Patch(':id')
  @Auth(EValidRoles.admin)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateProductDto: UpdateProductDto,
    @GetUser() user: User,
  ) {
    return this.productService.update(id, updateProductDto, user);
  }

  @Delete(':id')
  @Auth(EValidRoles.admin)
  remove(@Param('id') id: string) {
    return this.productService.remove(id);
  }
}
