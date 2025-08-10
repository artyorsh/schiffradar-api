import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import WebSocket from 'ws';
import { VesselStorageService } from './vessels-storage.service';
import { Position } from 'geojson';

@Injectable()
export class AISStreamIngestService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AISStreamIngestService.name);

  private ws: WebSocket;

  constructor(private readonly storageService: VesselStorageService) {}

  public onModuleInit(): void {
    this.connect();
  }

  private connect(): void {
    this.logger.debug(`Connecting to ${process.env.AISSTREAMIO_URL}`);

    this.ws = new WebSocket(process.env.AISSTREAMIO_URL!);

    this.ws.on('open', () => {
      this.logger.log('Connection established');

      this.subscribeToMessages();
    });

    this.ws.on('message', (data) => {
      try {
        const message = JSON.parse(data.toString());
        this.storageService.create({
          mmsi: message.MetaData.MMSI,
          name: message.MetaData.ShipName,
          latitude: message.MetaData.latitude,
          longitude: message.MetaData.longitude,
          cog: message.Message.PositionReport.Cog,
        });
      } catch (err) {
        this.logger.error('Error parsing message', err);
      }
    });

    this.ws.on('close', () => {
      this.logger.warn('WebSocket connection closed, reconnecting...');

      setTimeout(
        () => this.connect(),
        Number(process.env.AISSTREMIO_RECONNECT_DELAY),
      );
    });

    this.ws.on('error', (error) => {
      this.logger.error(`WebSocket error: ${error.message}`);
    });
  }

  public onModuleDestroy(): void {
    this.ws?.close();
  }

  private subscribeToMessages(): void {
    const bbox = this.bboxToNWSEArray(process.env.BBOX!);

    const subscriptionMessage = {
      ApiKey: process.env.AISSTREAMIO_API_KEY,
      BoundingBoxes: [bbox],
      FilterMessageTypes: ['PositionReport'],
    };

    this.ws.send(JSON.stringify(subscriptionMessage));
  }

  private bboxToNWSEArray(bbox: string): [Position, Position] {
    const [minLon, minLat, maxLon, maxLat] = bbox.split(',').map(Number);

    return [
      [maxLat, minLon], // NW
      [minLat, maxLon], // SE
    ];
  }
}
