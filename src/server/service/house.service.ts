import { PickupService } from '@armoury/fivem-framework-server';
import { House as ɵHouse } from '@armoury/fivem-roleplay-gamemode-server';
import { Injectable } from 'injection-js';
import { Subject } from 'rxjs';

import { HouseRepository } from '../repository/house.repository';

@Injectable()
export class HouseService {
  private _houses = new Map<number, House>();
  private _pickupsToHouseIds = new Map<number, number>();

  private _houseSpawned$ = new Subject<House>();
  public get houseSpawned$() {
    return this._houseSpawned$.asObservable();
  }

  public constructor(private readonly _repository: HouseRepository, private readonly _pickups: PickupService) {}

  public async insert(
    entrance: [number, number, number],
    exit: [number, number, number],
    value: number,
    requiredLevel = 1
  ): Promise<House> {
    const house = this.spawn(<House>await this._repository.create(entrance, exit, value, requiredLevel));

    console.log(`A house has been created. (id: ${house.id}, value: ${value}, level: ${requiredLevel})`);

    return house;
  }

  public async getAll(): Promise<House[]> {
    const houses: House[] = [];

    if (this._houses.size == 0) {
      return (await this._repository.fetchAll()).map((h) => <House>h);
    }

    const entries = this._houses.values();
    for (let entry = entries.next(); !entry.done; entry = entries.next()) {
      houses.push(entry.value);
    }

    console.log(`${houses.length} houses have been loaded.`);

    return houses;
  }

  public findByPickupId(pickupId: number): House | null {
    const houseId = this._pickupsToHouseIds.get(pickupId);
    if (houseId == null) {
      return null;
    }

    return this._houses.get(houseId) ?? null;
  }

  public spawn(house: House): House {
    house.pickups = this.spawnPickupsFor(house);
    this._houses.set(house.id, house);

    this._pickupsToHouseIds.set(house.pickups.entrance, house.id);
    this._pickupsToHouseIds.set(house.pickups.exit, house.id);

    this._houseSpawned$.next(house);
    Cfx.emit('armoury:safe:house:spawned', house);

    return house;
  }

  private spawnPickupsFor(house: House): House['pickups'] {
    const entrance = this._pickups.create(
      [house.entrance.x, house.entrance.y, house.entrance.z],
      'PICKUP_CUSTOM_SCRIPT',
      {
        modelHash: 'prop_ld_health_pack',
        rotating: true,
        destroyOnCollect: false,
      }
    );

    const exit = this._pickups.create([house.exit.x, house.exit.y, house.exit.z], 'PICKUP_CUSTOM_SCRIPT', {
      modelHash: 'prop_ld_health_pack',
      rotating: true,
      destroyOnCollect: false,
    });

    return { entrance, exit };
  }
}

class House extends ɵHouse {
  public pickups!: {
    entrance: number;
    exit: number;
  };
}
