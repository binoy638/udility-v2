import { ICommand } from 'wokcommands';

import { MediaStatus } from '../../@types';
import logger from '../../config/logger';
import { CommandContext, Utils } from '../../lib';
import Anime from '../../lib/Anime';

export default {
  category: 'Anime',
  description: 'Get notified when a new episode of an anime is released',
  slash: true,
  options: [
    {
      name: 'mal_id',
      type: 'NUMBER',
      description: 'Myanimelist id',
      required: true,
    },
  ],
  callback: async ({ interaction, message, args }) => {
    const ctx = new CommandContext(interaction, message);
    const malID = interaction?.options.getNumber('mal_id') || Number(args[0]);

    try {
      const data = await Anime.fetchAnime(malID);
      if (!data) {
        ctx.reply(Utils.embed({ title: '❌ Error', description: 'Anime not found' }));
        return;
      }
      if (data.status !== MediaStatus.RELEASING) {
        ctx.reply(Utils.embed({ title: '❌ Error', description: 'Anime is not currently airing' }));
        return;
      }
      ctx.reply(
        Utils.embed({
          title: `${data.title.romaji}`,
          url: data.siteUrl,
          image: { url: Anime.generateImageURL(data) },
        })
      );
    } catch (error) {
      logger.error(error);
      ctx.reply(Utils.embed({ title: '❌ Error', description: 'Anime not found' }));
    }
  },
} as ICommand;
