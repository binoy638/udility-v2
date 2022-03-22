/* eslint-disable consistent-return */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable sonarjs/no-duplicate-string */
import { Addable } from '@lavaclient/queue';
import { SpotifyItemType } from '@lavaclient/spotify';
import { ICommand } from 'wokcommands';

import logger from '../config/logger';
import { CommandContext, MessageChannel, Utils } from '../lib';

export default {
  category: 'Music',
  description: 'Play a song',
  aliases: ['p'],
  slash: 'both',
  guildOnly: true,
  options: [
    {
      name: 'query',
      type: 'STRING',
      description: 'The search query',
      required: true,
    },
    {
      name: 'next',
      description: 'Whether to add the results to the top of the queue.',
      type: 'BOOLEAN',
      required: false,
    },
  ],
  expectedArgs: '<query>',
  syntaxError: { error: 'Incorrect usage! Please use "{PREFIX}add {ARGUMENTS}"' },
  callback: async ({ interaction, message, args }): Promise<unknown> => {
    const next = interaction?.options.getBoolean('next') || false;

    const query = interaction?.options.getString('query') || args.join(' ');

    const context = new CommandContext(interaction, message);

    const userID = interaction?.user?.id || message?.author.id;

    if (!query) {
      logger.info('No query provided');
      context.reply('No query provided', { ephemeral: true });
      return;
    }

    logger.info('Interaction found: play');

    const vc = context.guild?.voiceStates?.cache?.get(userID)?.channel;

    if (!vc) {
      logger.info('No voice channel found');
      context.reply(Utils.embed('Join a voice channel first.'), { ephemeral: true });
      return;
    }
    let player = context.client.music.players.get(context.guild!.id);

    if (player && player.channelId !== vc.id) {
      context.reply(Utils.embed(`Join <#${player.channelId}>`), { ephemeral: true });
      return;
    }

    let tracks: Addable[] = [];
    let msg = '';
    if (context.client.music.spotify.isSpotifyUrl(query)) {
      logger.info('Spotify url found');
      const item = await context.client.music.spotify.load(query);
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
          tracks = await item.resolveYoutubeTracks();
          msg = `Queued ${tracks.length} tracks** for [**${item.name}**](${query}).`;
          break;
        case SpotifyItemType.Playlist:
          tracks = await item.resolveYoutubeTracks();

          msg = `Queued **${tracks.length} tracks** from ${SpotifyItemType[item.type].toLowerCase()} [**${
            item.name
          }**](${query}).`;
          break;
        default:
          context.reply(Utils.embed("Sorry, couldn't find anything :/"), { ephemeral: true });
          return;
      }
    } else {
      const results = await context.client.music.rest.loadTracks(
        /^https?:\/\//.test(query) ? query : `ytsearch:${query}`
      );

      switch (results.loadType) {
        case 'LOAD_FAILED':
          logger.info(`Failed to load ${query}\n${results}`);
          context.reply(Utils.embed('uh oh something went wrong'), { ephemeral: true });
          return;

        case 'NO_MATCHES':
          logger.info(`No match found ${query}\n${results}`);
          context.reply(Utils.embed('uh oh something went wrong'), { ephemeral: true });
          return;

        case 'PLAYLIST_LOADED':
          logger.info(`Playlist loaded ${query}`);
          tracks = results.tracks;
          msg = `Queued playlist [**${results.playlistInfo.name}**](${query}), it has a total of **${tracks.length}** tracks.`;
          break;
        case 'TRACK_LOADED': {
          logger.info(`track loaded ${query}\n${results}`);
          const [track] = results.tracks;
          tracks = [track];
          msg = `Queued [**${track.info.title}**](${track.info.uri})`;
          break;
        }

        case 'SEARCH_RESULT': {
          logger.info(`Search result found ${query}`);
          const [track] = results.tracks;
          tracks = [track];
          msg = `Queued [**${track.info.title}**](${track.info.uri})`;
          break;
        }
        default:
          logger.info(`No case matched ${query}\n${results}`);
          context.reply(Utils.embed("Sorry, couldn't find anything :/"), { ephemeral: true });
          return;
      }
    }

    /* create a player and/or join the member's vc. */
    if (!player?.connected) {
      player ??= context.client.music.createPlayer(context.guild!.id);
      player.queue.channel = context.channel as MessageChannel;
      player.connect(vc.id, { deafened: true });
    }
    /* reply with the queued message. */
    const started = player.playing || player.paused;

    context.reply(Utils.embed(msg));

    /* do queue tings. */
    player.queue.add(tracks, { requester: userID, next });
    if (!started) {
      await player.queue.start();
    }
  },
} as ICommand;
