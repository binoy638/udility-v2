/* eslint-disable unicorn/numeric-separators-style */
/* eslint-disable unicorn/number-literal-case */
import { Queue } from '@lavaclient/queue';
import {
  ButtonInteraction,
  ColorResolvable,
  MessageActionRow,
  MessageButton,
  MessageEmbed,
  MessageEmbedOptions,
  NewsChannel,
  TextChannel,
  ThreadChannel,
} from 'discord.js';
import { getBasicInfo } from 'ytdl-core';

import { Button, ButtonEmojis } from '../@types';
import redisClient from '../config/redis';

export type MessageChannel = TextChannel | ThreadChannel | NewsChannel;

export abstract class Utils {
  //   static PRIMARY_COLOR = 0xfff269;
  static PRIMARY_COLOR = 'DARK_AQUA' as ColorResolvable;

  static embed(embed: MessageEmbedOptions | string): MessageEmbed {
    const options: MessageEmbedOptions = typeof embed === 'string' ? { description: embed } : embed;
    options.color ??= Utils.PRIMARY_COLOR;

    return new MessageEmbed(options);
  }

  static async getThumbnail(url: string): Promise<string> {
    const info = await getBasicInfo(url);
    if (!info) return 'https://pbs.twimg.com/profile_images/1431129444362579971/jGrgSKDD_400x400.jpg';
    return (
      info.videoDetails?.thumbnails[0]?.url ||
      'https://pbs.twimg.com/profile_images/1431129444362579971/jGrgSKDD_400x400.jpg'
    );
  }

  static async deleteMusicPlayerEmbed(queue: Queue): Promise<void> {
    if (!queue) return;
    const guildID = queue.channel.guildId;
    if (guildID) {
      const oldMsgID = await redisClient.get(guildID);
      if (oldMsgID) {
        const oldMsg = await queue.channel.messages.fetch(oldMsgID);
        await oldMsg.delete();
        await redisClient.del(guildID);
      }
    }
  }

  //* Button Interaction Handlers

  static async handlePlayButton(interaction: ButtonInteraction): Promise<void> {
    const player = interaction.client.music.players.get(interaction.guild!.id);
    if (!player?.connected) {
      return interaction.reply({ content: 'I am not connected to a voice channel', ephemeral: true });
    }
  }

  static getMusicPlayerButtons(isPlaying: boolean): MessageActionRow {
    return new MessageActionRow().addComponents(
      new MessageButton().setCustomId(Button.loop).setEmoji(ButtonEmojis.loop).setStyle('SECONDARY'),
      new MessageButton().setCustomId(Button.skip).setEmoji(ButtonEmojis.skip).setStyle('SECONDARY'),
      isPlaying
        ? new MessageButton().setCustomId(Button.pause).setEmoji(ButtonEmojis.pause).setStyle('SECONDARY')
        : new MessageButton().setCustomId(Button.play).setEmoji(ButtonEmojis.play).setStyle('SECONDARY'),
      new MessageButton().setCustomId(Button.stop).setEmoji(ButtonEmojis.stop).setStyle('SECONDARY'),
      new MessageButton().setCustomId(Button.shuffle).setEmoji(ButtonEmojis.shuffle).setStyle('SECONDARY')
    );
  }
}
