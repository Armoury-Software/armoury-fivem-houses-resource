import { bootstrap } from '@armoury/fivem-roleplay-gamemode-server';

import { Server } from './controllers/server.controller';

import { HouseRepository } from './repository/house.repository';
import { HouseService } from './service/house.service';
import { HouseLoader } from './service/house.loader';
import { HouseEntranceInteractionService } from './service/interaction/house-entrance.interaction';

bootstrap(Server, {
  eager: [HouseService, HouseLoader, HouseEntranceInteractionService],
  providers: [HouseRepository],
});
