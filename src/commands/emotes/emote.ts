/* eslint-disable sonarjs/cognitive-complexity */
import { closest } from 'fastest-levenshtein';
import { ICommand } from 'wokcommands';

import { CommandContext, Utils } from '../../lib';
import { guildEmoteModel } from '../../models/emote.schema';

export default {
  category: 'Emote',
  description: 'Use an emote',
  slash: true,
  guildOnly: true,
  options: [
    {
      name: 'alias',
      type: 'STRING',
      description: 'Emote alias',
      required: true,
    },
  ],
  expectedArgs: '<alias>',
  syntaxError: { error: 'Incorrect usage! Please use "{PREFIX}emote {ARGUMENTS}"' },
  callback: async ({ interaction }) => {
    const alias = interaction?.options.getString('alias');

    if (!alias) return;

    const ctx = new CommandContext(interaction, undefined);

    const guildID = ctx.guild?.id;

    if (!guildID) {
      return;
    }

    const emoteObj = await guildEmoteModel
      .findOne(
        { guild: guildID },
        {
          emotes: { $elemMatch: { alias } },
        }
      )
      .lean(true);
    if (emoteObj?.emotes && emoteObj.emotes.length > 0) {
      const emote = emoteObj.emotes[0];
      if (!emote.url) {
        ctx.reply(Utils.embed(`Emote ${emote?.alias || ''} has no url`));
        return;
      }
      ctx.reply(emote.url);
    } else {
      const emotesObj = await guildEmoteModel.findOne({ guild: guildID }).lean(true).select('emotes');
      if (!emotesObj) return;
      if (emoteObj?.emotes && emoteObj.emotes.length === 0) {
        ctx.reply('No emotes found');
        return;
      }
      const allEmotesName = emotesObj?.emotes.map(emote => `${emote.alias}`);
      if (allEmotesName) {
        const closestEmote = closest(alias, allEmotesName);

        if (closestEmote) {
          const emote = emotesObj.emotes.find(emote_ => emote_.alias === closestEmote);
          if (emote && emote.url) {
            ctx.reply(emote.url);
          } else {
            ctx.reply(Utils.embed(`Emote ${emote?.alias || ''} has no url`));
          }
        }
      }
    }
  },
} as ICommand;
