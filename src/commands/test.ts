/* eslint-disable no-unused-vars */
import { ICommand } from 'wokcommands';

export default {
  category: 'Testing',
  description: 'test',
  ownerOnly: true,
  slash: 'both',
  testOnly: true,
  options: [
    {
      name: 'mal_id',
      type: 'NUMBER',
      description: 'Myanimelist id',
      required: true,
    },
  ],
  callback: async ({ interaction }) => {
    const id = interaction?.options.getNumber('mal_id');
    if (id) {
      // const anime = new Anime(id);
      // const data = await anime.fetchAnime();
      // console.log(data);
    }
  },
} as ICommand;
