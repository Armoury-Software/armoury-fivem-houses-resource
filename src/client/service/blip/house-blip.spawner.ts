import { EVENT_DIRECTIONS, EventListener, I18n } from '@armoury/fivem-framework-client';
import { House, type Stub } from '@armoury/fivem-roleplay-gamemode-client';
import { Injectable } from 'injection-js';

@Injectable()
export class HouseBlipSpawner {
  private readonly _blipIdsByServerBlipId = new Map<
    number,
    {
      blipId: number;
      timeout: ReturnType<typeof setTimeout>;
    }
  >();

  private readonly _pendingBlipUpdates = new Map<number, (blipId: number) => void>();

  private drawNiceBlipFor(house: Stub<House>, blipId: number): void {
    let text: string = '';
    if (house.metadata?.isOwned) {
      text = I18n.translate('house_blip_owned', { address: house.metadata?.address ?? 'house_blip_address' });
      Cfx.Client.SetBlipHiddenOnLegend(blipId, true);
    } else {
      text = I18n.translate('house_blip_unowned');
      Cfx.Client.SetBlipHiddenOnLegend(blipId, false);
    }

    Cfx.Client.SetBlipAsShortRange(blipId, true);
    Cfx.Client.BeginTextCommandSetBlipName('STRING');
    Cfx.Client.AddTextComponentString(text);
    Cfx.Client.EndTextCommandSetBlipName(blipId);
  }

  @EventListener({ eventName: 'armoury:safe:house:blip:entrance:create', direction: EVENT_DIRECTIONS.SERVER_TO_CLIENT })
  protected _onHouseBlipEntranceShouldCreate(house: Stub<House>, serverBlipId: number): void {
    const cachedBlip = this._blipIdsByServerBlipId.get(serverBlipId);

    if (cachedBlip) {
      clearTimeout(cachedBlip.timeout);
      this._blipIdsByServerBlipId.delete(serverBlipId);
      this.drawNiceBlipFor(house, cachedBlip.blipId);
      return;
    }

    this._pendingBlipUpdates.set(serverBlipId, (blipId) => this.drawNiceBlipFor(house, blipId));
  }

  @EventListener()
  protected onBlipCreateUnsafe(serverBlipId: number, blipId: number): void {
    const pendingSpriteUpdate = this._pendingBlipUpdates.get(serverBlipId);

    if (pendingSpriteUpdate) {
      this._pendingBlipUpdates.delete(serverBlipId);
      pendingSpriteUpdate(blipId);
      return;
    }

    const previousCachedBlip = this._blipIdsByServerBlipId.get(serverBlipId);
    if (previousCachedBlip) {
      clearTimeout(previousCachedBlip.timeout);
    }

    const timeout = setTimeout(() => this._blipIdsByServerBlipId.delete(serverBlipId), 5_000);
    this._blipIdsByServerBlipId.set(serverBlipId, { blipId, timeout });
  }
}
