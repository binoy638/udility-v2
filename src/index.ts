/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable unicorn/prefer-module */
/* eslint-disable unicorn/prefer-node-protocol */
import '@lavaclient/queue/register';

import { load } from '@lavaclient/spotify';
import dotenv from 'dotenv';
import path from 'path';
import WOKCommands from 'wokcommands';

import { Bot, Utils } from './lib';

dotenv.config();

load({
  client: {
    id: process.env.SPOTIFY_CLIENT_ID!,
    secret: process.env.SPOTIFY_CLIENT_SECRET!,
  },
  autoResolveYoutubeTracks: false,
});

const client = new Bot();

client.on('ready', () => {
  new WOKCommands(client, {
    commandsDir: path.join(__dirname, 'commands'),
    typeScript: process.env.NODE_ENV !== 'production',
    testServers: '757216229508513833',
    botOwners: ['312265605715722240'],
    mongoUri: process.env.MONGO_URI!,
    disabledDefaultCommands: ['channelonly', 'command', 'language', 'requiredrole', 'help'],
  }).setDefaultPrefix(process.env.PREFIX!);
  client.music.connect(client.user!.id);
});

client.music.on('connect', () => {
  console.log(`[music] now connected to lavalink`);
});

client.music.on('queueFinish', queue => {
  queue.player.disconnect();
  queue.player.node.destroyPlayer(queue.player.guildId);
});

client.music.on('trackStart', (queue, song) => {
  const embed = Utils.embed(
    // eslint-disable-next-line sonarjs/no-nested-template-literals
    `Now playing [**${song.title}**](${song.uri}) ${song.requester ? `<@${song.requester}>` : ''}`
  );
  queue.channel.send({ embeds: [embed] });
});

client.on('interactionCreate', interaction => {
  if (!interaction.isButton()) return;
  console.log(interaction);
});

client.login(process.env.TOKEN);
