import { Resource, ResourceRef } from '@armoury/fivem-framework-server';
import { House, PersistableService } from '@armoury/fivem-roleplay-gamemode-server';
import { Injectable } from 'injection-js';

import { HouseZones } from './house.zones';

@Injectable()
export class HouseRepository {
  public constructor(
    @Resource('oxmysql') private readonly _db: ResourceRef,
    private readonly _persistables: PersistableService,
    private readonly _zones: HouseZones
  ) {}

  public async create(
    entrance: [number, number, number],
    exit: [number, number, number],
    value: number,
    requiredLevel = 1
  ): Promise<House> {
    const persistable = await this._persistables.create(null, entrance, exit);

    const id = await this._db.instance.insert_async(
      `INSERT INTO houses (
        owningPersistableId, exitX, exitY, exitZ, originalValue, requiredLevel
      )
      VALUES (?, ?, ?, ?, ?, ?)`,
      [persistable.id, exit[0], exit[1], exit[2], value, requiredLevel]
    );

    const zone = this._zones.getFirstZoneAt(entrance[0], entrance[1], entrance[2]);

    return new House(
      id,
      null,
      { x: entrance[0], y: entrance[1], z: entrance[2] },
      { x: exit[0], y: exit[1], z: exit[2] },
      value,
      zone ? HouseZones.toAddress(zone, entrance[0], entrance[1], entrance[2]) : 'Unknown'
    );
  }

  public async fetchAll(): Promise<House[]> {
    const result = await this._db.instance.query_async(
      `SELECT
        h.*,
        p.owner AS owner,
        p.lastKnownPosX AS entranceX,
        p.lastKnownPosY AS entranceY,
        p.lastKnownPosZ AS entranceZ
      FROM houses h
      LEFT JOIN persistables p ON p.id = h.owningPersistableId`,
      []
    );

    return result.map((row) => this.rowToHouse(row));
  }

  private rowToHouse(row: any): House {
    const zone = this._zones.getFirstZoneAt(row.entranceX, row.entranceY, row.entranceZ);

    return new House(
      row.id,
      row.owner,
      { x: row.entranceX, y: row.entranceY, z: row.entranceZ },
      { x: row.exitX, y: row.exitY, z: row.exitZ },
      row.originalValue,
      zone ? HouseZones.toAddress(zone, row.entranceX, row.entranceY, row.entranceZ) : 'Unknown',
      row.sellingPrice ?? 0,
      row.rentPrice ?? 0,
      row.requiredLevel ?? 1
    );
  }
}
