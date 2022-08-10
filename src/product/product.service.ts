import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { validate as isUUID } from 'uuid';
import { ProductImage } from './entities/product-imgae.entity';
import { PaginationDTO } from './dto/pagination.dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger('Product service');

  constructor(
    @InjectRepository(Product)
    private readonly productRepo: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepo: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepo.create({
        ...productDetails,
        images: images.map((image: any) =>
          this.productImageRepo.create({ url: image }),
        ),
      });
      await this.productRepo.save(product);

      return { ...product, images };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDTO: PaginationDTO) {
    const { limit = 10, offset = 0 } = paginationDTO;

    const products = await this.productRepo.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      },
    });

    return products.map((product) => ({
      ...product,
      images: product.images.map((image) => image.url),
    }));
  }

  async findOne(term: string) {
    let product: Product;

    if (isUUID(term)) {
      product = await this.productRepo.findOneBy({ product_id: term });
    } else {
      // product = await this.productRepo.findOneBy({ slug: term });

      const queryBuilder = this.productRepo.createQueryBuilder('product');
      product = await queryBuilder
        .where('UPPER(title)=:title or slug=:slug', {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('product.images', 'prodImages')
        .getOne();
    }

    if (!product) throw new NotFoundException('Product not found');

    return product;
  }

  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map((image) => image.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...toUpdated } = updateProductDto;

    const product = await this.productRepo.preload({
      product_id: id,
      ...toUpdated,
    });

    // query runner
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    if (!product) throw new NotFoundException(`Product not found`);

    try {
      if (images) {
        await queryRunner.manager.delete(ProductImage, {
          product: { product_id: id },
        });

        product.images = images.map((image) =>
          this.productImageRepo.create({ url: image }),
        );
      }
      await queryRunner.manager.save(product);
      // await this.productRepo.save(product);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return this.findOnePlain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    return await this.productRepo.remove(product);
  }

  private handleDBExceptions(error: any) {
    this.logger.error(error);
    if (error.code === '23505') throw new BadRequestException(error.detail);

    throw new InternalServerErrorException(
      'unexpected error, check the server logs',
    );
  }

  async deleteAllProducts() {
    const query = this.productRepo.createQueryBuilder('product');

    try {
      return query.delete().where({}).execute();
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }
}
