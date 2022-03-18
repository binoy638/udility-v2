import { Addable } from '@lavaclient/queue';
import { SpotifyItemType } from '@lavaclient/spotify';
import type { NewsChannel, TextChannel, ThreadChannel } from 'discord.js';
import { ICommand } from 'wokcommands';

type MessageChannel = TextChannel | ThreadChannel | NewsChannel;

export default {
  category: 'Testing',
  description: 'next song',
  slash: 'both',
  options: [
    {
      name: 'query',
      type: 'STRING',
      description: 'query string',
    },
  ],
  testOnly: true,
  callback: async ({ interaction, message, client, args }) => {
    // console.log(interaction);
    const query = 'https://open.spotify.com/playlist/7fXr2l441v26UbGdKnQFqL?si=c158a562ffbb4e39&nd=1';
    if (client.music.spotify.isSpotifyUrl(query)) {
      const item = await client.music.spotify.load(query);
      const type = item?.type;
      if (type && type === SpotifyItemType.Playlist) {
        const tracks = await item.resolveYoutubeTracks();

        console.log(tracks);
      }
    }

    return 'yoyo';
  },
} as ICommand;
