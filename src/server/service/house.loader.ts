import { Injectable } from 'injection-js';

import { HouseService } from './house.service';

@Injectable()
export class HouseLoader {
  public constructor(private readonly _houses: HouseService) {
    this.execute();
  }

  private async execute(): Promise<void> {
    console.log('House loader triggered. Loading all houses from the database..');

    const houses = await this._houses.getAll();
    for (const house of houses) {
      this._houses.spawn(house);
    }
  }
}
