/* eslint-disable unicorn/numeric-separators-style */
/* eslint-disable unicorn/number-literal-case */
import {
  ColorResolvable,
  MessageEmbed,
  MessageEmbedOptions,
  NewsChannel,
  TextChannel,
  ThreadChannel,
} from 'discord.js';

export type MessageChannel = TextChannel | ThreadChannel | NewsChannel;

export abstract class Utils {
  //   static PRIMARY_COLOR = 0xfff269;
  static PRIMARY_COLOR = 'DARK_AQUA' as ColorResolvable;

  static embed(embed: MessageEmbedOptions | string): MessageEmbed {
    const options: MessageEmbedOptions = typeof embed === 'string' ? { description: embed } : embed;
    options.color ??= Utils.PRIMARY_COLOR;

    return new MessageEmbed(options);
  }
}
