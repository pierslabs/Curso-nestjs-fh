import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ProductService } from 'src/product/product.service';
import { initialData } from './data/seed.data';
import { User } from '../auth/entities/auth.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedService {
  constructor(
    private readonly productService: ProductService,

    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async runSeed() {
    await this.deleteTables();

    const adminUser = await this.insertUsers();

    await this.insertNewProducts(adminUser);
    return 'Seed executed';
  }

  private async deleteTables() {
    await this.productService.deleteAllProducts();
    const queryBuilder = this.userRepo.createQueryBuilder();
    //borra todos los usuarios
    await queryBuilder.delete().where({}).execute();
  }

  private async insertUsers() {
    const seedUsers = initialData.users;
    const users: User[] = [];

    seedUsers.forEach((user) => {
      users.push(this.userRepo.create(user));
    });

    const dbUsers = await this.userRepo.save(seedUsers);

    return dbUsers[0];
  }

  private async insertNewProducts(user: User) {
    this.productService.deleteAllProducts();

    const products = initialData.products;

    const insertPromises = [];

    products.forEach((product) => {
      insertPromises.push(this.productService.create(product, user));
    });

    await Promise.all(insertPromises);
    return true;
  }
}
