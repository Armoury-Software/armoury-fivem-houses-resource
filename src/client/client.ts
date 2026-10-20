import { bootstrap } from '@armoury/fivem-roleplay-gamemode-client';

import { Client } from './controllers/client.controller';

import { HouseEntranceInteractionService } from './service/interaction/house-entrance.interaction';

bootstrap(Client, {
  eager: [HouseEntranceInteractionService],
});
