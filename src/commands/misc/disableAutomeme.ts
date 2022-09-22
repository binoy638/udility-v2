/* eslint-disable no-unused-vars */
import { ICommand } from 'wokcommands';

import agenda from '../../config/agenda';
import { CommandContext, Utils } from '../../lib';

export default {
  category: 'Misc',
  description: 'Disbale Automeme in the current channel.',
  slash: true,
  permissions: ['ADMINISTRATOR'],
  guildOnly: true,
  callback: async ({ interaction }) => {
    const ctx = new CommandContext(interaction, undefined);

    const isRemoved = await agenda.cancel({ 'data.channelID': ctx.channel.id });
    if (isRemoved === 0) {
      ctx.reply(
        Utils.embed({
          title: '❌ Not Found.',
          description: `No subscription found in this channel.`,
        })
      );
      return;
    }

    ctx.reply(
      Utils.embed({
        title: '✅ Unsubscribed',
      })
    );
  },
} as ICommand;
