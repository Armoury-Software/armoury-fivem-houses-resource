import { Resource, ResourceRef } from '@armoury/fivem-framework-server';
import { House, PersistableService } from '@armoury/fivem-roleplay-gamemode-server';
import { Injectable } from 'injection-js';

@Injectable()
export class HouseRepository {
  public constructor(
    @Resource('oxmysql') private readonly _db: ResourceRef,
    private readonly _persistables: PersistableService
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

    return new House(
      id,
      null,
      { x: entrance[0], y: entrance[1], z: entrance[2] },
      { x: exit[0], y: exit[1], z: exit[2] },
      value
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
    return new House(
      row.id,
      row.owner,
      { x: row.entranceX, y: row.entranceY, z: row.entranceZ },
      { x: row.exitX, y: row.exitY, z: row.exitZ },
      row.originalValue,
      row.sellingPrice ?? 0,
      row.rentPrice ?? 0,
      row.requiredLevel ?? 1
    );
  }
}
