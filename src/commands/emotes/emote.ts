/* eslint-disable sonarjs/no-nested-template-literals */
/* eslint-disable sonarjs/cognitive-complexity */
import { TextChannel } from 'discord.js';
import { closest } from 'fastest-levenshtein';
import { ICommand } from 'wokcommands';

import { Utils } from '../../lib';
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
    {
      name: 'tag',
      type: 'USER',
      description: 'Tag a user',
      required: false,
    },
  ],
  expectedArgs: '<alias>',
  syntaxError: { error: 'Incorrect usage! Please use "{PREFIX}emote {ARGUMENTS}"' },
  callback: async ({ interaction }) => {
    const alias = interaction.options.getString('alias');

    const taggedUser = interaction.options.getUser('tag');

    if (!alias) return;

    const ctx = interaction;

    const channel = interaction.channel as TextChannel;

    const guildID = ctx.guild!.id;

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
        ctx.reply({ embeds: [Utils.embed(`Emote ${emote?.alias || ''} has no url`)], ephemeral: true });
        return;
      }
      ctx.deferReply();
      ctx.deleteReply();
      channel.send({
        embeds: [
          {
            description: `${taggedUser ? `${taggedUser}` : ''}`,
            author: { name: ctx.user.tag, iconURL: ctx.user.displayAvatarURL() },
            image: { url: emote.url },
          },
        ],
      });
    } else {
      const emotesObj = await guildEmoteModel.findOne({ guild: guildID }).lean(true).select('emotes');
      if (!emotesObj) return;
      if (emoteObj?.emotes && emoteObj.emotes.length === 0) {
        ctx.reply({ content: 'No emotes found', ephemeral: true });
        return;
      }
      const allEmotesName = emotesObj?.emotes.map(emote => emote.alias.toLowerCase());
      if (allEmotesName) {
        const closestEmote = closest(alias.toLowerCase(), allEmotesName);

        if (closestEmote) {
          const emote = emotesObj.emotes.find(emote_ => emote_.alias === closestEmote);
          if (emote && emote.url) {
            ctx.deferReply();
            ctx.deleteReply();
            channel.send({
              embeds: [
                {
                  description: `${taggedUser ? `<@${taggedUser}>` : ''}`,
                  author: { name: ctx.user.tag, iconURL: ctx.user.displayAvatarURL() },
                  image: { url: emote.url },
                },
              ],
            });
          } else {
            ctx.reply({ embeds: [Utils.embed(`Emote ${emote?.alias || ''} has no url`)], ephemeral: true });
          }
        }
      }
    }
  },
} as ICommand;
