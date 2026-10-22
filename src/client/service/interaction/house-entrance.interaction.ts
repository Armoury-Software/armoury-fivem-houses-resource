import { EVENT_DIRECTIONS, EventListener, UI } from '@armoury/fivem-framework-client';
import { House, type Stub } from '@armoury/fivem-roleplay-gamemode-client';
import { Injectable } from 'injection-js';

@Injectable()
export class HouseEntranceInteractionService {
  private _hovered = new Map<number, Stub<House>>();

  @EventListener({ eventName: 'armoury:safe:house:entrance:hover', direction: EVENT_DIRECTIONS.SERVER_TO_CLIENT })
  public _onHouseEntranceHover(house: Stub<House>) {
    if (this._hovered.has(house.id!)) {
      return;
    }

    UI.sendMessage({
      type: MESSAGE_TYPE_ENTRANCE_HOVER,
      ...house,
    });

    this._hovered.set(house.id!, house);
  }

  @EventListener({ eventName: 'armoury:safe:house:entrance:unhover', direction: EVENT_DIRECTIONS.SERVER_TO_CLIENT })
  public _onHouseEntranceUnhover(houseId: number) {
    if (!this._hovered.has(houseId)) {
      return;
    }

    UI.sendMessage({
      type: MESSAGE_TYPE_ENTRANCE_UNHOVER,
    });

    this._hovered.delete(houseId);
  }
}

const MESSAGE_TYPE_ENTRANCE_HOVER = 'houses:entrance:hover';
const MESSAGE_TYPE_ENTRANCE_UNHOVER = 'houses:entrance:unhover';
