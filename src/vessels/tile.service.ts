import { Tile, tileToBBOX } from '@mapbox/tilebelt';
import { Injectable } from '@nestjs/common';
import { BBox } from 'geojson';

export interface ITile {
  id: string;
  geometry: Tile;
  getBBox(): BBox;
  getSurrounding(): ITile[];
}

@Injectable()
export class TileService {
  public createTile(id: string): ITile {
    const [x, y, z] = id.split('_').map(Number);

    const getSurroundingIds = (): string[] => [
      this.getTileId([x - 1, y - 1, z]),
      this.getTileId([x, y - 1, z]),
      this.getTileId([x + 1, y - 1, z]),

      this.getTileId([x - 1, y, z]),
      this.getTileId([x + 1, y, z]),

      this.getTileId([x - 1, y + 1, z]),
      this.getTileId([x, y + 1, z]),
      this.getTileId([x + 1, y + 1, z]),
    ];

    return {
      id,
      geometry: [x, y, z],
      getBBox: () => tileToBBOX([x, y, z]),
      getSurrounding: () =>
        getSurroundingIds().map((id) => this.createTile(id)),
    };
  }

  public getTileId(tile: Tile): string {
    return tile.join('_');
  }
}
