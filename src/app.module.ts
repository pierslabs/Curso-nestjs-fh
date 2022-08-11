import { join } from 'path';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedModule } from './seed/seed.module';

import { ProductModule } from './product/product.module';
import { HandleFilesModule } from './handle-files/handle-files.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.HOST_DB,
      port: +process.env.PORT_DB,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.NAME_DB,
      autoLoadEntities: true,
      synchronize: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public/products'),
    }),
    ProductModule,
    SeedModule,
    HandleFilesModule,
    AuthModule,
  ],
})
export class AppModule {}
