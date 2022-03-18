/* eslint-disable unicorn/prefer-module */
/* eslint-disable unicorn/prefer-node-protocol */
import { load } from '@lavaclient/spotify';
import '@lavaclient/queue/register';
import type { NewsChannel, TextChannel, ThreadChannel } from 'discord.js';
import { Client, Intents } from 'discord.js';
import dotenv from 'dotenv';
import { Node } from 'lavaclient';
import path from 'path';
import WOKCommands from 'wokcommands';

dotenv.config();

// declare module 'discord.js' {
//   interface Client {
//     readonly music: Node;
//   }
// }

export type MessageChannel = TextChannel | ThreadChannel | NewsChannel;

declare module 'discord.js' {
  interface Client {
    readonly music: Node;
  }
}

declare module 'lavaclient' {
  interface Player {
    nightcore: boolean;
  }
}

declare module '@lavaclient/queue' {
  interface Queue {
    channel: MessageChannel;
  }
}

class Bot extends Client {
  readonly music: Node;

  constructor() {
    super({
      intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
        Intents.FLAGS.GUILD_VOICE_STATES,
        Intents.FLAGS.GUILD_MEMBERS,
      ],
    });

    this.music = new Node({
      sendGatewayPayload: (id, payload) => this.guilds.cache.get(id)?.shard?.send(payload),
      connection: {
        host: process.env.LAVA_HOST!,
        password: process.env.LAVA_PASS!,
        port: 2333,
      },
    });

    this.ws.on('VOICE_SERVER_UPDATE', data => this.music.handleVoiceUpdate(data));
    this.ws.on('VOICE_STATE_UPDATE', data => this.music.handleVoiceUpdate(data));
  }
}

load({
  client: {
    id: process.env.SPOTIFY_CLIENT_ID!,
    secret: process.env.SPOTIFY_CLIENT_SECRET!,
  },
  autoResolveYoutubeTracks: false,
});

const client = new Bot();

client.on('ready', () => {
  const cmd = new WOKCommands(client, {
    commandsDir: path.join(__dirname, 'commands'),
    typeScript: true,
    testServers: '757216229508513833',
  });
  client.music.connect(client.user!.id);
});

client.music.on('connect', () => {
  console.log(`[music] now connected to lavalink`);
});

client.login(process.env.TOKEN);
