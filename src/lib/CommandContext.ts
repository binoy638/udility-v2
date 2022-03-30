/* eslint-disable no-unused-vars */
import {
  ButtonInteraction,
  Client,
  CommandInteraction,
  Guild,
  InteractionReplyOptions,
  Message,
  MessageEmbed,
  NewsChannel,
  TextChannel,
  ThreadChannel,
  User,
  VoiceBasedChannel,
} from 'discord.js';
import type { APIMessage } from 'discord-api-types/v10';
import { Player } from 'lavaclient';

type MessageChannel = TextChannel | ThreadChannel | NewsChannel;

export class CommandContext {
  readonly interaction: CommandInteraction | Message | ButtonInteraction;

  readonly isMessage: boolean;

  constructor(interaction: CommandInteraction | ButtonInteraction | undefined, message: Message | undefined) {
    if (!interaction && !message) {
      throw new Error('No interaction or message provided');
    }

    if (message instanceof Message) {
      this.interaction = message;
      this.isMessage = true;
    } else if (interaction instanceof CommandInteraction || interaction instanceof ButtonInteraction) {
      this.interaction = interaction;

      this.isMessage = false;
    } else {
      throw new TypeError('No interaction or message provided');
    }
  }

  get client(): Client {
    return this.interaction.client;
  }

  get user(): User {
    if (this.interaction instanceof Message) {
      return this.interaction.author;
    }
    return this.interaction.user;
  }

  get guild(): Guild | null {
    return this.interaction.guild;
  }

  get player(): Player | null {
    return (this.guild && this.client.music.players.get(this.guild.id)) ?? null;
  }

  get channel(): MessageChannel {
    return this.interaction.channel as MessageChannel;
  }

  get voiceChannel(): VoiceBasedChannel | null | undefined {
    return this.guild?.voiceStates?.cache?.get(this.user.id)?.channel;
  }

  /* overloads: not fetching the reply */
  reply(content: MessageEmbed, options?: Omit<InteractionReplyOptions, 'embeds'>): Promise<void>;

  reply(content: string, options?: Omit<InteractionReplyOptions, 'content'>): Promise<void>;

  reply(options: InteractionReplyOptions): Promise<void>;

  /* overloads: fetch reply */
  reply(
    content: MessageEmbed,
    options?: Omit<InteractionReplyOptions, 'embeds'> & { fetchReply: true }
  ): Promise<Message>;

  reply(content: string, options?: Omit<InteractionReplyOptions, 'content'> & { fetchReply: true }): Promise<Message>;

  reply(options: InteractionReplyOptions & { fetchReply: true }): Promise<Message | APIMessage>;

  /* actual method */
  reply(content: string | MessageEmbed | InteractionReplyOptions, options: InteractionReplyOptions = {}): Promise<any> {
    if (this.interaction instanceof ButtonInteraction) {
      return this.interaction.reply({
        [typeof content === 'string' ? 'content' : 'embeds']: typeof content === 'string' ? content : [content],
        ...options,
      });
    }
    if (typeof content === 'string' || content instanceof MessageEmbed) {
      return this.interaction.reply({
        [typeof content === 'string' ? 'content' : 'embeds']: typeof content === 'string' ? content : [content],
        ...options,
      });
    }

    return this.interaction.reply(content);
  }

  sendFeedback(message: MessageEmbed): void {
    if (this.isMessage) {
      this.reply(message);
    } else {
      this.reply(message, { ephemeral: true });
    }
  }
}
