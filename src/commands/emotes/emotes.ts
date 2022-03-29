import { ICommand } from 'wokcommands';

import { CommandContext, Utils } from '../../lib';
import { guildEmoteModel } from '../../models/emote.schema';

export default {
  category: 'Emote',
  description: 'View available emotes',
  slash: true,
  guildOnly: true,
  callback: async ({ interaction }) => {
    const ctx = new CommandContext(interaction, undefined);

    const guildID = ctx.guild?.id;

    if (!guildID) {
      return;
    }

    const emotesObj = await guildEmoteModel.findOne({ guild: guildID }).lean(true).select('emotes');

    if (!emotesObj || emotesObj?.emotes.length === 0) {
      ctx.reply('No emotes found');
      return;
    }

    const allEmotes = emotesObj.emotes
      .map((emote, index) => {
        if (index % 5 === 0) {
          return `\n${emote.alias}`;
        }
        return `${emote.alias}`;
      })
      .join(', ');

    ctx.reply(Utils.embed({ title: 'Available Emotes', description: allEmotes }), { ephemeral: true });
  },
} as ICommand;
