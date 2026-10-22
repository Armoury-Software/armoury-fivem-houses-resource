import { EventListener } from '@armoury/fivem-framework-server';
import { House } from '@armoury/fivem-roleplay-gamemode-server';
import { Injectable } from 'injection-js';

import { HouseService } from '../house.service';

@Injectable()
export class HouseEntranceInteractionService {
  public constructor(private readonly _houses: HouseService) {}

  @EventListener()
  public onPickupCollect(playerId: number, pickupId: number): void {
    const house = this._houses.findByPickupId(pickupId);
    if (house != null) {
      Cfx.emit('armoury:safe:house:entrance:hover', playerId, house);
      Cfx.emitNet('armoury:safe:house:entrance:hover', playerId, House.toStub(house));
    }
  }

  @EventListener()
  public onPickupLeave(playerId: number, pickupId: number): void {
    const house = this._houses.findByPickupId(pickupId);
    if (house != null) {
      Cfx.emit('armoury:safe:house:entrance:unhover', playerId, house);
      Cfx.emitNet('armoury:safe:house:entrance:unhover', playerId, house.id);
    }
  }
}
