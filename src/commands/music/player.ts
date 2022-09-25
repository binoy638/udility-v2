/* eslint-disable sonarjs/no-duplicate-string */
import { ICommand } from 'wokcommands';

import logger from '../../config/logger';
import redisClient from '../../config/redis';
import { CommandContext, Utils } from '../../lib';

export default {
  category: 'Music',
  description: 'Get the current player',
  slash: 'both',
  guildOnly: true,
  callback: async ({ interaction, message }) => {
    const ctx = new CommandContext(interaction, message);
    const key = `playerMessage:${ctx.guild?.id}`;
    const oldMsgID = await redisClient.GET(key);
    if (!oldMsgID) {
      ctx.reply(Utils.embed('No player found'));
      return;
    }
    try {
      const oldMsg = await ctx.channel.messages.fetch(oldMsgID);
      if (oldMsg) {
        await oldMsg.delete();
        if (interaction) {
          interaction.deferReply();
          interaction.deleteReply();
        }
        const newMsg = await ctx.channel.send({ embeds: oldMsg.embeds, components: oldMsg.components });
        redisClient.SETEX(key, 3600, newMsg.id);
      } else {
        ctx.reply(Utils.embed('No player found'));
      }
    } catch (error) {
      logger.error(error);
      ctx.reply(Utils.embed('No player found'));
      redisClient.DEL(key);
    }
  },
} as ICommand;
