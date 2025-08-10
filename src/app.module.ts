import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { createRootTypeOrmModule } from './db';
import { VesselsModule } from './vessels/vessels.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: createRootTypeOrmModule,
    }),
    VesselsModule,
  ],
})
export class AppModule {}
