import { Controller, Get, Logger, Query } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { VesselStorageService } from './vessels-storage.service';
import { Vessel } from './vessel.entity';
import { ITile, TileService } from './tile.service';

export interface ITileData {
  id: string;
  vessels: Vessel[];
  surrounding_ids: string[];
}

@Controller('vessels')
export class VesselsController {
  private logger = new Logger(VesselsController.name);

  private activeSeconds: number;

  constructor(
    private readonly vesselService: VesselStorageService,
    private readonly tileService: TileService,
    private readonly configService: ConfigService,
  ) {
    this.activeSeconds = this.configService.get<number>(
      'VESSEL_ACTIVE_SECONDS',
      120,
    );
  }

  /**
   * @returns the vessels in the given and surrounding tiles, updated_at in the past VESSEL_ACTIVE_SECONDS.
   * @example for the tileId x_y_z, queries the 3x3 grid:
   * ```
   * x-1_y-1 | x_y-1 | x+1_y-1
   * x-1_y   | x_y   | x+1_y
   * x-1_y+1 | x_y+1 | x+1_y+1
   * ```
   */
  @Get()
  public async getNearby(@Query('tile') tileId: string): Promise<ITileData[]> {
    const parentTile: ITile = this.tileService.createTile(tileId);
    const queryTiles: ITile[] = [parentTile, ...parentTile.getSurrounding()];

    const result: ITileData[] = [];

    for (const tile of queryTiles) {
      const vessels = await this.vesselService.findActive(
        tile.getBBox(),
        this.activeSeconds,
      );

      this.logger.debug(`[${tile.id}]: found ${vessels.length} vessels.`);

      result.push({
        id: tile.id,
        vessels,
        surrounding_ids: tile.getSurrounding().map((t) => t.id),
      });
    }

    return result;
  }
}
