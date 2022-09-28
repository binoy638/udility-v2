import '@lavaclient/queue/register';

import { load } from '@lavaclient/spotify';
import dotenv from 'dotenv';
import path from 'path';
import WOKCommands from 'wokcommands';

import logger from './config/logger';
import redisClient from './config/redis';
import { onInteractionCreate } from './events/interactionCreate';
import { onConnect } from './events/music/connect';
import { onQueueFinish } from './events/music/queueFinish';
import { onTrackEnd } from './events/music/trackEnd';
import { onTrackStart } from './events/music/trackStart';
import { Bot } from './lib';
import registerAgendaJobs from './lib/agenda';

dotenv.config();

load({
  client: {
    id: process.env.SPOTIFY_CLIENT_ID!,
    secret: process.env.SPOTIFY_CLIENT_SECRET!,
  },
  autoResolveYoutubeTracks: false,
});

export const client = new Bot();

client.on('ready', async () => {
  await redisClient.connect();
  new WOKCommands(client, {
    commandsDir: path.join(__dirname, 'commands'),
    typeScript: process.env.NODE_ENV !== 'production',
    testServers: '757216229508513833',
    botOwners: ['312265605715722240'],
    mongoUri: process.env.MONGO_URI!,
    disabledDefaultCommands: ['channelonly', 'command', 'language', 'requiredrole', 'help'],
  }).setDefaultPrefix(process.env.PREFIX!);
  client.music.connect(client.user!.id);
  redisClient.FLUSHALL();
});

client.music.on('connect', onConnect);

client.music.on('queueFinish', onQueueFinish);

client.music.on('trackStart', onTrackStart);

client.music.on('trackEnd', onTrackEnd);

client.on('interactionCreate', onInteractionCreate);

process.on('uncaughtException', error => {
  logger.error(error);
});

process.on('SIGTERM', () => process.exit());

registerAgendaJobs(client);

client.login(process.env.TOKEN);
