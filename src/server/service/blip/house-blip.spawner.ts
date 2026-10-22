import { Blip, EventListener } from '@armoury/fivem-framework-server';
import { House } from '@armoury/fivem-roleplay-gamemode-server';
import { Injectable } from 'injection-js';

import { HouseService } from '../house.service';

@Injectable()
export class HouseBlipSpawner {
  public constructor(private readonly _houses: HouseService) {
    _houses.houseSpawned$.subscribe(this.onHouseSpawned.bind(this));
  }

  private spawnEntranceBlipFor(house: House, toPlayerId?: number) {
    const serverBlipId = Blip.create(house.entrance.x, house.entrance.y, house.entrance.z, {
      toPlayerId,
      spriteId: 40,
    });

    Cfx.emitNet('armoury:safe:house:blip:entrance:create', toPlayerId ?? -1, House.toStub(house), serverBlipId);
  }

  private onHouseSpawned(house: House): void {
    this.spawnEntranceBlipFor(house);
  }

  @EventListener()
  protected async onPlayerConnect(): Promise<void> {
    const toPlayerId = Cfx.source;
    for (const house of await this._houses.getAll()) {
      this.spawnEntranceBlipFor(house, toPlayerId);
    }
  }
}
