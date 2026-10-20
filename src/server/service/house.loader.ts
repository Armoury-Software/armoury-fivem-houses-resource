import { Injectable } from 'injection-js';

import { HouseService } from './house.service';

@Injectable()
export class HouseLoader {
  public constructor(private readonly _houses: HouseService) {
    console.log('House loader triggered. Loading all houses from the database..');
    this._houses.fetchAll();
  }
}
