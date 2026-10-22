import { I18n } from '@armoury/fivem-framework-client';
import { bootstrap } from '@armoury/fivem-roleplay-gamemode-client';

import { Client } from './controllers/client.controller';

import { HouseEntranceInteractionService } from './service/interaction/house-entrance.interaction';
import { HouseBlipSpawner } from './service/blip/house-blip.spawner';

bootstrap(Client, {
  providers: [I18n.withOptions({})],
  eager: [HouseEntranceInteractionService, HouseBlipSpawner],
});
