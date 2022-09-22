/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable security/detect-object-injection */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable unicorn/prefer-module */
/* eslint-disable unicorn/prefer-node-protocol */
import '@lavaclient/queue/register';

import { load } from '@lavaclient/spotify';
import { MessageEmbed } from 'discord.js';
import dotenv from 'dotenv';
import path from 'path';
import WOKCommands from 'wokcommands';

import { Button } from './@types';
import agenda from './config/agenda';
import logger from './config/logger';
import redisClient from './config/redis';
import { Bot, Utils } from './lib';
import { MusicPlayer } from './lib/MusicPlayer';
import Reddit, { Post } from './lib/Reddit';

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
  await redisClient.flushAll();
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

  const row = Utils.getMusicPlayerButtons(true);
  const guildID = queue.channel.guildId;

  if (guildID) {
    const oldMsgID = await redisClient.get(guildID);
    if (oldMsgID) {
      const oldMsg = await queue.channel.messages.fetch(oldMsgID);
      await oldMsg.edit({ embeds: [embed], components: [row] });
    } else {
      const newMsg = await queue.channel.send({ embeds: [embed], components: [row] });
      await redisClient.set(guildID, newMsg.id);
    }
  }
});

client.music.on('trackEnd', async queue => {
  console.log('[music] track ended');
  await Utils.deleteMusicPlayerEmbed(queue);
});

client.on('interactionCreate', async interaction => {
  if (!interaction.isButton()) return;
  const buttonID = interaction.customId;
  switch (buttonID) {
    case Button.play: {
      interaction.deferUpdate();
      const player = new MusicPlayer(interaction, undefined);
      await player.resume();

      break;
    }
    case Button.pause: {
      interaction.deferUpdate();
      const player = new MusicPlayer(interaction, undefined);
      await player.pause();
      break;
    }
    case Button.skip: {
      interaction.deferUpdate();
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

process.on('uncaughtException', error => {
  logger.error(error);
});

process.on('SIGTERM', () => process.exit());

client.login(process.env.TOKEN);

const getUniquePost = async (subreddits: string[], channelID: string): Promise<Post> => {
  const index = Math.round(Math.random() * (subreddits.length - 1));
  const subreddit = subreddits[index];
  const reddit = new Reddit(subreddit);
  const post = await reddit.getRandomPost();

  if (!post) throw new Error('Could not fetch post');
  const key = `${channelID}-${post.id}`;
  const exists = await redisClient.GET(key);
  if (exists) {
    logger.info(`[reddit] post ${post.id} already exists in cache`);
    return getUniquePost(subreddits, channelID);
  }
  // eslint-disable-next-line unicorn/numeric-separators-style
  await redisClient.SETEX(key, 604800, 'true');
  return post;
};

agenda.define('automeme', {}, async (job, done) => {
  try {
    const { data } = job.attrs;
    if (data) {
      const { channelID, subreddits } = data;
      if (!channelID || !subreddits) return;
      const channel = client.channels.cache.get(channelID);
      if (channel && channel?.isText()) {
        const post = await getUniquePost(subreddits, channelID);

        if (post) {
          if (post.is_video) {
            const embed = new MessageEmbed({ title: post.title, url: post.permalink });
            await channel.send({ embeds: [embed] });
            if (post.media) await channel.send(post.media);
          }
          if (post.post_hint === 'link' || post.post_hint === 'rich:video') {
            const embed = new MessageEmbed({ title: post.title, url: post.permalink });
            await channel.send({ embeds: [embed] });
            if (post.url) await channel.send(post.url);
          }
          const embed = new MessageEmbed({ title: post.title, url: post.permalink, image: { url: post.url } });
          await channel.send({ embeds: [embed] });
        }
      }
      done();
    }
  } catch (error) {
    logger.error(error);
    done();
  }
});
