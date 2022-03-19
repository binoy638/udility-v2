/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable no-shadow */

import { Client, Intents } from 'discord.js';
import dotenv from 'dotenv';
import { Node } from 'lavaclient';

dotenv.config();

declare module 'discord.js' {
  interface Client {
    readonly music: Node;
  }
}

export class Bot extends Client {
  readonly music: Node;

  constructor() {
    super({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_VOICE_STATES,
        // Intents.FLAGS.GUILD_MEMBERS,
      ],
    });

    this.music = new Node({
      sendGatewayPayload: (id, payload) => this.guilds.cache.get(id)?.shard?.send(payload),
      connection: {
        host: process.env.NODE_ENV === 'production' ? process.env.LAVA_HOST! : 'localhost',
        password: process.env.LAVA_PASS!,
        port: 2333,
      },
    });

    this.ws.on('VOICE_SERVER_UPDATE', data => this.music.handleVoiceUpdate(data));
    this.ws.on('VOICE_STATE_UPDATE', data => this.music.handleVoiceUpdate(data));
  }
}
