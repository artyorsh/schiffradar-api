import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryColumn,
  UpdateDateColumn,
} from 'typeorm';
import type { Point } from 'typeorm';

@Entity()
export class Vessel {
  @PrimaryColumn()
  mmsi: number;

  @Column()
  name: string;

  @Column({
    type: 'geography',
    srid: 4326,
    spatialFeatureType: 'Point',
  })
  coordinates: Point;

  @Column('float')
  cog: number;

  @CreateDateColumn({ type: 'timestamptz' })
  public created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  public updated_at: Date;
}
