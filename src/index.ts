/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable unicorn/prefer-module */
/* eslint-disable unicorn/prefer-node-protocol */
import '@lavaclient/queue/register';

import { load } from '@lavaclient/spotify';
import { MessageActionRow, MessageButton } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';
import WOKCommands from 'wokcommands';

import { Button, ButtonEmojis } from './@types';
import logger from './config/logger';
import redisClient from './config/redis';
import { Bot, Utils } from './lib';
import { MusicPlayer } from './lib/MusicPlayer';

dotenv.config();

load({
  client: {
    id: process.env.SPOTIFY_CLIENT_ID!,
    secret: process.env.SPOTIFY_CLIENT_SECRET!,
  },
  autoResolveYoutubeTracks: false,
});

const client = new Bot();

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
});

client.music.on('connect', () => {
  console.log(`[music] now connected to lavalink`);
});

client.music.on('queueFinish', async queue => {
  queue.player.disconnect();
  await Utils.deleteMusicPlayerEmbed(queue);
  queue.player.node.destroyPlayer(queue.player.guildId);
});

client.music.on('trackStart', async (queue, song) => {
  const nextTrack = queue.tracks.length > 0 ? queue.tracks[0] : null;
  const thumbnailUrl = await Utils.getThumbnail(song.uri);
  const embed = {
    url: song.uri,
    title: song.title,
    // eslint-disable-next-line sonarjs/no-nested-template-literals
    description: `${song.requester ? `<@${song.requester}>` : ''}`,
    thumbnail: { url: thumbnailUrl },
    fields: [] as any,
  };

  if (nextTrack) {
    embed.fields = [{ name: 'Up Next', value: nextTrack.title }];
  }
  const row = new MessageActionRow().addComponents(
    new MessageButton().setCustomId(Button.loop).setEmoji(ButtonEmojis.loop).setStyle('SECONDARY'),
    new MessageButton().setCustomId(Button.play).setEmoji(ButtonEmojis.play).setStyle('SECONDARY'),
    new MessageButton().setCustomId(Button.skip).setEmoji(ButtonEmojis.skip).setStyle('SECONDARY'),
    // new MessageButton().setCustomId('pause').setEmoji(ButtonEmojis.pause).setStyle('SECONDARY'),
    new MessageButton().setCustomId(Button.stop).setEmoji(ButtonEmojis.stop).setStyle('SECONDARY'),

    new MessageButton().setCustomId(Button.shuffle).setEmoji(ButtonEmojis.shuffle).setStyle('SECONDARY')
  );

  const msg = await queue.channel.send({ embeds: [embed], components: [row] });

  if (msg.guildId) {
    redisClient.set(msg.guildId, msg.id);
  }
});

client.music.on('trackEnd', async queue => {
  await Utils.deleteMusicPlayerEmbed(queue);
});

client.on('interactionCreate', interaction => {
  if (!interaction.isButton()) return;
  const buttonID = interaction.customId;
  switch (buttonID) {
    case Button.play: {
      const player = new MusicPlayer(interaction, undefined);
      player.resume();
      break;
    }
    case Button.pause: {
      const player = new MusicPlayer(interaction, undefined);
      player.pause();
      break;
    }
    case Button.skip: {
      const player = new MusicPlayer(interaction, undefined);
      player.skip();
      break;
    }
    case Button.stop: {
      const player = new MusicPlayer(interaction, undefined);
      player.disconnect();
      break;
    }
    case Button.shuffle: {
      const player = new MusicPlayer(interaction, undefined);
      player.shuffle();
      break;
    }
    case Button.loop: {
      const player = new MusicPlayer(interaction, undefined);
      player.loop();
      break;
    }
    default:
      logger.info(`Unknown button interaction: ${buttonID}`);
  }
});

client.login(process.env.TOKEN);
