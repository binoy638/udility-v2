import jwt from 'jsonwebtoken';
import { ICommand } from 'wokcommands';

import logger from '../../config/logger';
import { CommandContext, Utils } from '../../lib';
import Anime from '../../lib/Anime';

export default {
  category: 'Anime',
  description: 'Get anime info',
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

    const anime = new Anime(malID);

    try {
      const data = await anime.fetchAnime();
      if (!data) {
        ctx.reply(Utils.embed({ title: '❌ Error', description: 'Anime not found' }));
        return;
      }
      const url = `https://html-to-image-xi.vercel.app/?img=${data.coverImage.extraLarge}&name=${data.title.romaji}`;
      const imageJWT = jwt.sign(
        { url, type: 'png', clip: { x: 0, y: 0, height: 450, width: 300 } },
        process.env.JWT_SECRET!
      );

      ctx.reply(
        Utils.embed({
          title: `${data.title.romaji}`,
          url: data.siteUrl,
          image: { url: `https://url-to-image-generator.vercel.app/api/image?data=${imageJWT}` },
        })
      );
    } catch (error) {
      logger.error(error);
      ctx.reply(Utils.embed({ title: '❌ Error', description: 'Anime not found' }));
    }
  },
} as ICommand;
