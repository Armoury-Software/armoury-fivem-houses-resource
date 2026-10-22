import { Injectable } from 'injection-js';

@Injectable()
export class HouseZones {
  private _zones: Zone[];

  public constructor() {
    this._zones = JSON.parse(Cfx.Server.LoadResourceFile('armoury', 'data/zones.json')!);
  }

  public getFirstZoneAt(x: number, y: number, z: number): Zone | null {
    for (const zone of this._zones) {
      if (
        zone.Bounds.some(
          ({ Minimum: min, Maximum: max }) =>
            x >= min.X && x <= max.X && y >= min.Y && y <= max.Y && z >= min.Z && z <= max.Z
        )
      ) {
        return zone;
      }
    }

    return null;
  }

  public static toAddress(zone: Zone, x: number, y: number, z: number): string {
    const bounds = this.getBoundsAt(zone, x, y, z);
    if (!bounds) {
      return 'Unknown';
    }

    const cell = this.getGridCell(bounds, x, y, z);

    return `${zone.DisplayName} ${cell + 1}`;
  }

  private static getGridCell(bounds: Zone['Bounds'][number], oldX: number, oldY: number, oldZ: number): number {
    const divisions = 14;

    const { Minimum: min, Maximum: max } = bounds;

    const x = Math.min(divisions - 1, Math.max(0, Math.floor(((oldX - min.X) / (max.X - min.X)) * divisions)));

    const y = Math.min(divisions - 1, Math.max(0, Math.floor(((oldY - min.Y) / (max.Y - min.Y)) * divisions)));

    const z = Math.min(divisions - 1, Math.max(0, Math.floor(((oldZ - min.Z) / (max.Z - min.Z)) * divisions)));

    return x + y * divisions + z * divisions * divisions;
  }

  private static getBoundsAt(zone: Zone, x: number, y: number, z: number): Zone['Bounds'][number] | undefined {
    return zone.Bounds.find(
      ({ Minimum: min, Maximum: max }) =>
        x >= min.X && x <= max.X && y >= min.Y && y <= max.Y && z >= min.Z && z <= max.Z
    );
  }
}

interface Vector3 {
  X: number;
  Y: number;
  Z: number;
}

interface Zone {
  Name: string;
  DisplayName: string | null;
  Bounds: {
    Minimum: Vector3;
    Maximum: Vector3;
  }[];
}
