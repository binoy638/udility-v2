import axios from 'axios';

import { AnimeData } from '../@types';
import logger from '../config/logger';
import { fetchAnimeQuery } from './graphqlQueries';

class Anime {
  private malID: number;

  constructor(malID: number) {
    this.malID = malID;
  }

  public async fetchAnime(): Promise<AnimeData> {
    const variables = {
      idMal: this.malID,
      type: 'ANIME',
    };
    console.log(variables);
    try {
      const { data } = await axios.post('https://graphql.anilist.co', {
        query: fetchAnimeQuery,
        variables,
      });
      return data.data.Media;
    } catch (error) {
      logger.error(error);
      throw new Error('Error fetching anime');
    }
  }
}

export default Anime;
