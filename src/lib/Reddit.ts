/* eslint-disable sonarjs/no-duplicate-string */
/* eslint-disable security/detect-object-injection */
/* eslint-disable no-plusplus */
/* eslint-disable camelcase */
import axios from 'axios';

import logger from '../config/logger';

export interface Post {
  id: string;
  post_hint: string;
  title: string;
  url: string;
  permalink: string;
  media: string | null | undefined;
  url_overridden_by_dest?: string;
  is_video: boolean;
}

type PostType = 'hot' | 'new' | 'top' | 'rising';

interface Media {
  reddit_video: { fallback_url: string | undefined };
}

const extractVideoUrl = (obj: Media) => {
  if (!obj) return null;
  if (obj.reddit_video) {
    return obj.reddit_video.fallback_url;
  }
  return null;
};

const shuffleArray = (arr: Post[]) => {
  let { length } = arr;
  if (!length) return;
  let i;
  while (length) {
    i = Math.floor(Math.random() * length--);
    // eslint-disable-next-line no-param-reassign
    [arr[length], arr[i]] = [arr[i], arr[length]];
  }
  return arr;
};

class Reddit {
  public readonly subreddit: string;

  public readonly type: PostType;

  public readonly URL: string;

  constructor(subreddit: string, type?: PostType) {
    this.subreddit = subreddit;
    if (!type) {
      const types = ['hot', 'new', 'top', 'rising'];
      const index = Math.round(Math.random() * 3);
      this.type = types[index] as PostType;
    } else {
      this.type = type;
    }
    this.URL = `https://www.reddit.com/r/${this.subreddit}/${this.type}.json`;
  }

  async isValid(): Promise<0 | 1 | 2 | 3> {
    try {
      const response = await axios.get(this.URL);
      if (!response.data.data.dist) return 0;

      const { post_hint } = response.data.data.children[2].data;
      if (!post_hint) return 2;
      const { over_18 } = response.data.data.children[2].data;
      if (over_18) return 3;
      return 1;
    } catch (error) {
      console.log(error);
      return 0;
    }
  }

  async getPosts(count = 26): Promise<Post[] | undefined> {
    try {
      const { data } = await axios.get(`${this.URL}?limit=${count}`);
      if (!data || !data.data.dist) return;

      const items = data.data.children as { data: Post }[];

      const posts = items
        .filter(
          item =>
            item.data.url_overridden_by_dest !== undefined &&
            item.data.post_hint !== undefined &&
            item.data.post_hint !== 'rich:video'
        )
        .map(post => ({
          id: post.data.id,
          post_hint: post.data.post_hint,
          title: post.data.title,
          url: post.data.url_overridden_by_dest as string,
          permalink: `https://www.reddit.com${post.data.permalink}`,
          media: extractVideoUrl(post.data.media as unknown as Media),
          is_video: post.data.is_video,
        }));
      return shuffleArray(posts);
    } catch (error) {
      console.log(error);
      console.log('could not fetch subreddit');
    }
  }

  async getRandomPost(): Promise<Post | undefined> {
    try {
      const posts = await this.getPosts();
      if (!posts) throw new Error('could not fetch subreddit');
      const index = Math.round(Math.random() * posts.length);
      return posts[index];
    } catch (error) {
      logger.error(error);
      logger.info('could not fetch subreddit');
    }
  }
}

export default Reddit;

// undefined: couldn't make request
// 0: subreddit doesn't exsit
// 2: not enought content
// 3: valid and nsfw
// 1: valid and not nsfw
