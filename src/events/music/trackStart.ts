import { Queue, Song } from '@lavaclient/queue';

import redisClient from '../../config/redis';
import { Utils } from '../../lib';

export const onTrackStart = async (queue: Queue, song: Song): Promise<void> => {
  const nextTrack = queue.tracks.length > 0 ? queue.tracks[0] : null;
  const thumbnailUrl = await Utils.getThumbnail(song.uri);
  const embed = {
    url: song.uri,
    title: song.title,
    // eslint-disable-next-line sonarjs/no-nested-template-literals
    description: `${song.requester ? `<@${song.requester}>` : ''}`,
    thumbnail: { url: thumbnailUrl },
    fields: [] as any,
  };

  if (nextTrack) {
    embed.fields = [{ name: 'Up Next', value: nextTrack.title }];
  }

  const row = Utils.getMusicPlayerButtons(true);
  const guildID = queue.channel.guildId;

  if (guildID) {
    const key = `playerMessage:${guildID}`;
    const oldMsgID = await redisClient.GET(key);
    if (oldMsgID) {
      const oldMsg = await queue.channel.messages.fetch(oldMsgID);
      await oldMsg.edit({ embeds: [embed], components: [row] });
    } else {
      const newMsg = await queue.channel.send({ embeds: [embed], components: [row] });
      await redisClient.SETEX(key, 3600, newMsg.id);
    }
  }
};
