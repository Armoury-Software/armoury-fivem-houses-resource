import { bootstrap } from '@armoury/fivem-roleplay-gamemode-server';

import { Server } from './controllers/server.controller';

import { HouseRepository } from './repository/house.repository';
import { HouseService } from './service/house.service';
import { HouseLoader } from './service/house.loader';
import { HouseBlipSpawner } from './service/blip/house-blip.spawner';
import { HouseEntranceInteractionService } from './service/interaction/house-entrance.interaction';
import { HouseZones } from './repository/house.zones';

bootstrap(Server, {
  eager: [HouseService, HouseBlipSpawner, HouseLoader, HouseEntranceInteractionService],
  providers: [HouseRepository, HouseZones],
});
