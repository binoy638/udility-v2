/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable security/detect-object-injection */
import { MessageEmbed } from 'discord.js';

import agenda from '../config/agenda';
import logger from '../config/logger';
import redisClient from '../config/redis';
import { Bot } from './Bot';
import Reddit, { Post } from './Reddit';

const getUniquePost = async (subreddits: string[], channelID: string): Promise<Post> => {
  const index = Math.floor(Math.random() * subreddits.length);
  const subreddit = subreddits[index];
  const reddit = new Reddit(subreddit);
  const post = await reddit.getRandomPost();

  if (!post) throw new Error('Could not fetch post');
  const key = `${channelID}-${post.id}`;
  const exists = await redisClient.GET(key);
  if (exists) {
    logger.info(`[reddit] post ${post.id} already exists in cache`);
    return getUniquePost(subreddits, channelID);
  }
  // eslint-disable-next-line unicorn/numeric-separators-style
  await redisClient.SETEX(key, 604800, 'true');
  return post;
};

const registerAgendaJobs = (client: Bot): void => {
  agenda.define('automeme', {}, async (job, done) => {
    try {
      const { data } = job.attrs;
      if (data) {
        const { channelID, subreddits } = data;
        if (!channelID || !subreddits) return;
        const channel = client.channels.cache.get(channelID);
        if (channel && channel?.isText()) {
          const post = await getUniquePost(subreddits, channelID);

          if (post) {
            if (post.is_video) {
              const embed = new MessageEmbed({ title: post.title, url: post.permalink });
              await channel.send({ embeds: [embed] });
              if (post.media) await channel.send(post.media);
            } else if (post.post_hint === 'link' || post.post_hint === 'rich:video') {
              const embed = new MessageEmbed({ title: post.title, url: post.permalink });
              await channel.send({ embeds: [embed] });
              if (post.url) await channel.send(post.url);
            } else {
              const embed = new MessageEmbed({ title: post.title, url: post.permalink, image: { url: post.url } });
              await channel.send({ embeds: [embed] });
            }
          }
        }
        done();
      }
    } catch (error) {
      logger.error(error);
      done();
    }
  });
};

export default registerAgendaJobs;
