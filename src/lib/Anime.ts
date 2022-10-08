import axios from 'axios';
import jwt from 'jsonwebtoken';

import { AnimeData } from '../@types';
import logger from '../config/logger';
import { fetchAnimeQuery } from './graphqlQueries';

const ANILIST_API_URL = 'https://graphql.anilist.co';

const HTML_TO_IMAGE_API_URL = 'https://html-to-image-xi.vercel.app';

const SCREENSHOT_API_URL = 'https://url-to-image-generator.vercel.app/api/image';

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
    try {
      const { data } = await axios.post(ANILIST_API_URL, {
        query: fetchAnimeQuery,
        variables,
      });
      return data.data.Media;
    } catch (error) {
      logger.error(error);
      throw new Error('Error fetching anime');
    }
  }

  static generateImageURL(data: AnimeData): string {
    let broadcast = 'Unknown';
    let nextEP = 'Unknown';
    if (data.nextAiringEpisode.airingAt) {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      const date = new Date(data.nextAiringEpisode.airingAt * 1000);
      date.setHours(date.getHours() + 5);
      date.setMinutes(date.getMinutes() + 30);
      broadcast = `${days[date.getDay()]} at ${date.toLocaleTimeString()} (IST)`;
      nextEP = date.toLocaleString();
    }
    const genres = data.genres.join(', ');
    const totalEp = data.episodes || 'Unknown';
    const currentEpisode = data.nextAiringEpisode?.episode - 1 || 'Unknown';
    let runtime = 'Unknown';
    try {
      if (data.startDate.year) runtime = `${data.startDate.year}/${data.startDate.month}/${data.startDate.day} - NA`;
      if (data.startDate.year && data.endDate.year) {
        runtime = `${data.startDate.year}/${data.startDate.month}/${data.startDate.day} - ${data.endDate.year}/${data.endDate.month}/${data.endDate.day}`;
      }
    } catch (error) {
      logger.error(error);
      runtime = 'Unknown';
    }

    const url = `${HTML_TO_IMAGE_API_URL}/anime?img=${data.coverImage.extraLarge}&name=${data.title.romaji}&ep=${currentEpisode}&runtime=${runtime}&totalEp=${totalEp}&nextEp=${nextEP}&broadcast=${broadcast}&genre=${genres}`;
    const imageJWT = jwt.sign(
      { url, type: 'png', clip: { x: 0, y: 0, height: 400, width: 600 } },
      process.env.JWT_SECRET!
    );

    return `${SCREENSHOT_API_URL}?data=${imageJWT}`;
  }
}

export default Anime;
