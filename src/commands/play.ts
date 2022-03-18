import { Addable } from '@lavaclient/queue';
import { SpotifyItemType } from '@lavaclient/spotify';
import type { NewsChannel, TextChannel, ThreadChannel } from 'discord.js';
import { ICommand } from 'wokcommands';

type MessageChannel = TextChannel | ThreadChannel | NewsChannel;

export default {
  category: 'Testing',
  description: 'Replies with pong aaa',
  slash: 'both',
  options: [
    {
      name: 'query',
      type: 'STRING',
      description: 'provide song name or youtube/spotify link',
    },
  ],
  testOnly: true,
  callback: async ({ interaction, message, client, args }) => {
    const next = false;
    const query = interaction.options.getString('query') || args[0];
    if (!query) {
      return interaction.reply({ content: 'Please provide a query', ephemeral: true });
    }
    if (interaction) {
      const vc = interaction.guild?.voiceStates?.cache?.get(interaction.user.id)?.channel;

      let player = interaction.client.music.players.get(interaction.guild!.id);

      let tracks: Addable[] = [];
      let msg = '';
      if (client.music.spotify.isSpotifyUrl(query)) {
        const item = await client.music.spotify.load(query);
        switch (item?.type) {
          case SpotifyItemType.Track:
            tracks = [await item.resolveYoutubeTrack()];
            msg = `Queued track [**${item.name}**](${query}).`;
            break;
          case SpotifyItemType.Artist:
            tracks = await item.resolveYoutubeTracks();
            msg = `Queued the **Top ${tracks.length} tracks** for [**${item.name}**](${query}).`;
            break;
          case SpotifyItemType.Album:
          case SpotifyItemType.Playlist:
            tracks = await item.resolveYoutubeTracks();

            msg = `Queued **${tracks.length} tracks** from ${SpotifyItemType[item.type].toLowerCase()} [**${
              item.name
            }**](${query}).`;
            break;
          default:
            return interaction.reply({ content: "Sorry, couldn't find anything :/", ephemeral: true });
        }
      } else {
        const results = await client.music.rest.loadTracks(/^https?:\/\//.test(query) ? query : `ytsearch:${query}`);

        switch (results.loadType) {
          case 'LOAD_FAILED':
          case 'NO_MATCHES':
            return interaction.reply({ content: 'uh oh something went wrong', ephemeral: true });
          case 'PLAYLIST_LOADED':
            tracks = results.tracks;
            msg = `Queued playlist [**${results.playlistInfo.name}**](${query}), it has a total of **${tracks.length}** tracks.`;
            break;
          case 'TRACK_LOADED':
          case 'SEARCH_RESULT': {
            const [track] = results.tracks;
            tracks = [track];
            msg = `Queued [**${track.info.title}**](${track.info.uri})`;
            break;
          }
          default:
            return interaction.reply({ content: "Sorry, couldn't find anything :/", ephemeral: true });
        }
      }

      /* create a player and/or join the member's vc. */
      if (!player?.connected) {
        player ??= client.music.createPlayer(interaction.guild!.id);
        player.queue.channel = interaction.channel as MessageChannel;
        await player.connect(vc.id, { deafened: true });
      }
      /* reply with the queued message. */
      const started = player.playing || player.paused;
      await interaction.reply({ content: msg, ephemeral: true });

      /* do queue tings. */
      player.queue.add(tracks, { requester: interaction.user.id, next });
      if (!started) {
        await player.queue.start();
      }
    } else {
      const vc = message.guild?.voiceStates?.cache?.get(message.author.id)?.channel;
      console.log(vc);
    }
  },
} as ICommand;
