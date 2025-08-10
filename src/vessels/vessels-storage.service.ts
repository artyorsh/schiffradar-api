import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Vessel } from './vessel.entity';
import { CreateVesselDto } from './vessel.dto';
import { Point, Repository } from 'typeorm';
import { BBox } from 'geojson';

@Injectable()
export class VesselStorageService {
  constructor(
    @InjectRepository(Vessel)
    private readonly vesselRepository: Repository<Vessel>,
  ) {}

  public async create(vessel: CreateVesselDto): Promise<Vessel> {
    const coordinates: Point = {
      type: 'Point',
      coordinates: [vessel.longitude, vessel.latitude],
    };

    await this.vesselRepository.upsert(
      {
        mmsi: vessel.mmsi,
        name: vessel.name,
        cog: vessel.cog,
        coordinates,
      },
      ['mmsi'],
    );

    return this.vesselRepository.findOneOrFail({
      where: { mmsi: vessel.mmsi },
    });
  }

  public async findActive(
    bbox: BBox,
    activeSeconds: number,
  ): Promise<Vessel[]> {
    const query: string = `
      vessel.updated_at > NOW() - INTERVAL '${activeSeconds} seconds'
      AND ST_Intersects(vessel.coordinates, ST_MakeEnvelope(:minLon, :minLat, :maxLon, :maxLat, 4326))
      `;

    return this.vesselRepository
      .createQueryBuilder('vessel')
      .where(query, {
        minLon: bbox[0],
        minLat: bbox[1],
        maxLon: bbox[2],
        maxLat: bbox[3],
      })
      .getMany();
  }
}
