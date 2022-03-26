/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable prefer-destructuring */
/* eslint-disable sonarjs/no-duplicate-string */
import { Addable } from '@lavaclient/queue';
import { SpotifyItemType } from '@lavaclient/spotify';

import { ButtonEmojis } from '../@types';
import logger from '../config/logger';
import redisClient from '../config/redis';
import { CommandContext, Utils } from '.';

export class MusicPlayer extends CommandContext {
  async play(query: string, next: boolean): Promise<void> {
    const userID = this.user.id;

    if (!query) {
      logger.info('No query provided');
      this.reply('No query provided', { ephemeral: true });
      return;
    }

    logger.info('Interaction found: play');

    const vc = this.guild?.voiceStates?.cache?.get(userID)?.channel;

    if (!vc) {
      logger.info('No voice channel found');
      this.reply(Utils.embed('Join a voice channel first.'), { ephemeral: true });
      return;
    }
    let player = this.client.music.players.get(this.guild!.id);

    if (player && player.channelId !== vc.id) {
      this.reply(Utils.embed(`Join <#${player.channelId}>`), { ephemeral: true });
      return;
    }

    let tracks: Addable[] = [];
    let msg = '';
    if (this.client.music.spotify.isSpotifyUrl(query)) {
      logger.info('Spotify url found');
      const item = await this.client.music.spotify.load(query);
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
          this.reply(Utils.embed("Sorry, couldn't find anything :/"), { ephemeral: true });
          return;
      }
    } else {
      const results = await this.client.music.rest.loadTracks(/^https?:\/\//.test(query) ? query : `ytsearch:${query}`);

      switch (results.loadType) {
        case 'LOAD_FAILED':
          logger.info(`Failed to load ${query}\n${results}`);
          this.reply(Utils.embed('uh oh something went wrong'), { ephemeral: true });
          return;

        case 'NO_MATCHES':
          logger.info(`No match found ${query}\n${results}`);
          this.reply(Utils.embed('uh oh something went wrong'), { ephemeral: true });
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
          this.reply(Utils.embed("Sorry, couldn't find anything :/"), { ephemeral: true });
          return;
      }
    }

    /* create a player and/or join the member's vc. */
    if (!player?.connected) {
      player ??= this.client.music.createPlayer(this.guild!.id);
      player.queue.channel = this.channel;
      player.connect(vc.id, { deafened: true });
    }
    /* reply with the queued message. */
    const started = player.playing || player.paused;

    this.reply(Utils.embed(msg));

    /* do queue tings. */
    player.queue.add(tracks, { requester: userID, next });
    if (!started) {
      await player.queue.start();
    }
  }

  async pause(): Promise<void> {
    // eslint-disable-next-line prefer-destructuring
    const player = this.player;
    if (!player?.connected) {
      this.reply(Utils.embed('I am not connected to any voice channel.'));
      return;
    }

    const vc = this.voiceChannel;
    if (!vc || player.channelId !== vc.id) {
      this.reply(Utils.embed("You're not in my voice channel."), { ephemeral: true });
      return;
    }
    if (player.paused) {
      this.reply(Utils.embed('I am already paused.'), { ephemeral: true });
      return;
    }
    const guildID = player.queue.channel.guildId;
    if (guildID) {
      logger.info(guildID);
      const msg = await redisClient.get(guildID);
      if (msg) {
        const msgObj = await player.queue.channel.messages.fetch(msg);
        if (msgObj) {
          logger.info(`msg obj found`);

          const row = Utils.getMusicPlayerButtons(false);
          await msgObj.edit({ embeds: [msgObj.embeds[0]], components: [row] });
        }
      }
    }

    // if (!this.isMessage) {
    //   this.reply(Utils.embed(`You paused \`${ButtonEmojis.pause}\` the song.`), { ephemeral: true });
    // } else {
    //   this.reply(Utils.embed(`Song paused \`${ButtonEmojis.pause}\` by <@${this.user.id}>`));
    // }
    player.pause();
  }

  async resume(): Promise<void> {
    // eslint-disable-next-line prefer-destructuring
    const player = this.player;
    if (!player?.connected) {
      this.reply(Utils.embed('I am not connected to any voice channel.'), { ephemeral: true });
      return;
    }

    /* check if the user is in the player's voice channel. */
    const vc = this.guild?.voiceStates?.cache?.get(this.user.id)?.channel;
    if (!vc || player.channelId !== vc.id) {
      this.reply(Utils.embed("You're not in my voice channel."), { ephemeral: true });
      return;
    }
    if (player.paused) {
      const guildID = player.queue.channel.guildId;
      if (guildID) {
        logger.info(guildID);
        const msg = await redisClient.get(guildID);
        if (msg) {
          const msgObj = await player.queue.channel.messages.fetch(msg);
          if (msgObj) {
            logger.info(`msg obj found`);

            const row = Utils.getMusicPlayerButtons(true);
            await msgObj.edit({ embeds: [msgObj.embeds[0]], components: [row] });
          }
        }
      }
      player.resume();
      // if (!this.isMessage) {
      //   this.reply(Utils.embed(`You resumed  \`${ButtonEmojis.play}\` the song.`), { ephemeral: true });
      // } else {
      //   this.reply(Utils.embed(`Song resumed \`${ButtonEmojis.play}\` by <@${this.user.id}>`));
      // }
      return;
    }
    this.sendFeedback(Utils.embed(`Song already playing \`${ButtonEmojis.play}\` `));
  }

  skip(): void {
    const player = this.player;
    if (!player?.connected) {
      this.reply(Utils.embed('I am not connected to any voice channel.'), { ephemeral: true });
      return;
    }

    /* check if the user is in the player's voice channel. */
    const vc = this.guild?.voiceStates?.cache?.get(this.user.id)?.channel;
    if (!vc || player.channelId !== vc.id) {
      this.reply(Utils.embed("You're not in my voice channel."), { ephemeral: true });
      return;
    }

    player.queue.next();
  }

  shuffle(): void {
    const player = this.player;
    if (!player?.connected) {
      this.reply(Utils.embed('I am not connected to any voice channel.'), { ephemeral: true });
      return;
    }

    /* check if the user is in the player's voice channel. */
    const vc = this.guild?.voiceStates?.cache?.get(this.user.id)?.channel;
    if (!vc || player.channelId !== vc.id) {
      this.reply(Utils.embed("You're not in my voice channel."), { ephemeral: true });
      return;
    }
    if (player.queue.tracks.length > 1) {
      player.queue.shuffle();
      this.sendFeedback(Utils.embed('Playlist shuffled.'));
    } else {
      this.sendFeedback(Utils.embed("You can't shuffle a single track"));
    }
  }

  async disconnect(): Promise<void> {
    const player = this.player;
    if (!player?.connected) {
      this.reply(Utils.embed('I am not connected to any voice channel.'), { ephemeral: true });
      return;
    }

    /* check if the user is in the player's voice channel. */
    const vc = this.guild?.voiceStates?.cache?.get(this.user.id)?.channel;
    if (!vc || player.channelId !== vc.id) {
      this.reply(Utils.embed("You're not in my voice channel."), { ephemeral: true });
      return;
    }

    await this.reply(Utils.embed(`Left <#${player.channelId}>`));

    /* leave the player's voice channel. */
    player.disconnect();
    this.client.music.destroyPlayer(player.guildId);
  }

  loop(): void {
    const player = this.player;
    if (!player?.connected) {
      this.reply(Utils.embed('I am not connected to any voice channel.'), { ephemeral: true });
      return;
    }

    /* check if the user is in the player's voice channel. */
    const vc = this.guild?.voiceStates?.cache?.get(this.user.id)?.channel;
    if (!vc || player.channelId !== vc.id) {
      this.reply(Utils.embed("You're not in my voice channel."), { ephemeral: true });
      return;
    }

    const loop = player.queue.loop;
    if (loop.type === 0) {
      player.queue.setLoop(1);
      this.sendFeedback(Utils.embed('Looping the playlist'));
    } else {
      player.queue.setLoop(0);
      this.sendFeedback(Utils.embed('Stopped looping the playlist'));
    }
  }

  clear(): void {
    const player = this.player;
    if (!player?.connected) {
      this.reply(Utils.embed('I am not connected to any voice channel.'), { ephemeral: true });
      return;
    }

    /* check if the user is in the player's voice channel. */
    const vc = this.guild?.voiceStates?.cache?.get(this.user.id)?.channel;
    if (!vc || player.channelId !== vc.id) {
      this.reply(Utils.embed("You're not in my voice channel."), { ephemeral: true });
      return;
    }
    player.queue.clear();
    this.sendFeedback(Utils.embed('Playlist cleared.'));
  }
}
