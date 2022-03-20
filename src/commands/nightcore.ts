/* eslint-disable no-unused-vars */

import { ICommand } from 'wokcommands';

import { CommandContext, Utils } from '../lib';

export default {
  category: 'Music',
  description: 'Add nightcore to the current song',
  slash: 'both',
  guildOnly: true,
  callback: async ({ interaction, message }): Promise<unknown> => {
    const context = new CommandContext(interaction, message);
    /* check if there is a player for this guild. */
    const { player } = context;
    if (!player?.connected) {
      context.reply(Utils.embed('I am not connected to any voice channel.'), { ephemeral: true });
      return;
    }

    /* toggle the nightcore filter. */
    // eslint-disable-next-line no-cond-assign
    player.filters.timescale = (player.nightcore = !player.nightcore)
      ? { speed: 1.125, pitch: 1.125, rate: 1 }
      : undefined;

    await player.setFilters();
    context.reply(Utils.embed(`${player.nightcore ? 'Enabled' : 'Disabled'} the **nightcore** filter!`));
  },
} as ICommand;
