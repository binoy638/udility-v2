/* eslint-disable no-unused-vars */
import {
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
} from 'discord.js';
import { Player } from 'lavaclient';

type MessageChannel = TextChannel | ThreadChannel | NewsChannel;

export class CommandContext {
  readonly interaction: CommandInteraction | Message;

  readonly isMessage: boolean;

  constructor(interaction: CommandInteraction | undefined, message: Message | undefined) {
    if (!interaction && !message) {
      throw new Error('No interaction or message provided');
    }

    if (message instanceof Message) {
      this.interaction = message;
      this.isMessage = true;
    } else if (interaction instanceof CommandInteraction) {
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

  reply(options: InteractionReplyOptions & { fetchReply: true }): Promise<Message>;

  /* actual method */
  reply(content: string | MessageEmbed | InteractionReplyOptions, options: InteractionReplyOptions = {}): Promise<any> {
    if (typeof content === 'string' || content instanceof MessageEmbed) {
      return this.interaction.reply({
        [typeof content === 'string' ? 'content' : 'embeds']: typeof content === 'string' ? content : [content],
        ...options,
      });
    }

    return this.interaction.reply(content);
  }
}
