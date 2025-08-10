import { Module } from '@nestjs/common';
import { VesselStorageService } from './vessels-storage.service';
import { VesselsController } from './vessels.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Vessel } from './vessel.entity';
import { AISStreamIngestService } from './aisstream-ingest.service';
import { TileService } from './tile.service';

@Module({
  imports: [ConfigModule, TypeOrmModule.forFeature([Vessel])],
  controllers: [VesselsController],
  providers: [AISStreamIngestService, TileService, VesselStorageService],
})
export class VesselsModule {}
