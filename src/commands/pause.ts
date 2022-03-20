/* eslint-disable no-unused-vars */

import { ICommand } from 'wokcommands';

import { CommandContext, Utils } from '../lib';

export default {
  category: 'Music',
  description: 'Pause the currently playing song',
  aliases: ['ps'],
  slash: 'both',
  guildOnly: true,
  callback: async ({ interaction, message }): Promise<unknown> => {
    const context = new CommandContext(interaction, message);
    const player = context.client.music.players.get(context.guild!.id);
    if (!player?.connected) {
      context.reply(Utils.embed('I am not connected to any voice channel.'), { ephemeral: true });
      return;
    }

    /* check if the user is in the player's voice channel. */
    const vc = context.guild?.voiceStates?.cache?.get(context.user.id)?.channel;
    if (!vc || player.channelId !== vc.id) {
      context.reply(Utils.embed("You're not in my voice channel."), { ephemeral: true });
      return;
    }
    if (player.paused) {
      context.reply(Utils.embed('I am already paused.'), { ephemeral: true });
      return;
    }

    if (!context.isMessage) {
      context.reply(Utils.embed('paused.'), { ephemeral: true });
    }
    context.reply(Utils.embed(`song paused by <@${context.user.id}>`));
    player.pause();
  },
} as ICommand;
