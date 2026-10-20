import { EventListener } from '@armoury/fivem-framework-server';
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
      Cfx.emitNet('armoury:safe:house:entrance:hover', playerId, {
        // TODO: Replace this manually constructed object with "House.toStub()". Preferably, have a Stub<House> which House inherits. This would be added in the gamemode framework.
        id: house.id,
        rentPrice: house.rentPrice,
        requiredLevel: house.requiredLevel,
        sellingPrice: house.sellingPrice,
      });
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
