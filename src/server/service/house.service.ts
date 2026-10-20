import { PickupService } from '@armoury/fivem-framework-server';
import { House as ɵHouse } from '@armoury/fivem-roleplay-gamemode-server';
import { Injectable } from 'injection-js';

import { HouseRepository } from '../repository/house.repository';

@Injectable()
export class HouseService {
  private _houses = new Map<number, House>();
  private _pickupsToHouseIds = new Map<number, number>();

  public constructor(private readonly _repository: HouseRepository, private readonly _pickups: PickupService) {}

  public async create(
    entrance: [number, number, number],
    exit: [number, number, number],
    value: number,
    requiredLevel = 1
  ): Promise<House> {
    const house = <House>await this._repository.create(entrance, exit, value, requiredLevel);
    house.pickups = this.spawnPickupsFor(house);
    this._houses.set(house.id, house);

    this._pickupsToHouseIds.set(house.pickups.entrance, house.id);
    this._pickupsToHouseIds.set(house.pickups.exit, house.id);

    console.log(`A house has been created. (id: ${house.id}, value: ${value}, level: ${requiredLevel})`);

    return house;
  }

  /**
   * Replaces all known data about houses with the data from inside the database.
   */
  public async fetchAll(): Promise<House[]> {
    const houses = (await this._repository.fetchAll()).map((h) => <House>h);

    for (const house of houses) {
      house.pickups = this.spawnPickupsFor(house);
      this._houses.set(house.id, house);

      this._pickupsToHouseIds.set(house.pickups.entrance, house.id);
      this._pickupsToHouseIds.set(house.pickups.exit, house.id);
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

  private spawnPickupsFor(house: House): House['pickups'] {
    const entrance = this._pickups.create(
      [house.entrance.x, house.entrance.y, house.entrance.z],
      'PICKUP_CUSTOM_SCRIPT',
      {
        modelHash: 'prop_ld_health_pack',
        rotating: true,
        destroyOnCollect: false,
        rearmRadius: 2,
      }
    );

    const exit = this._pickups.create([house.exit.x, house.exit.y, house.exit.z], 'PICKUP_CUSTOM_SCRIPT', {
      modelHash: 'prop_ld_health_pack',
      rotating: true,
      destroyOnCollect: false,
      rearmRadius: 2,
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
