import { Queue } from '@lavaclient/queue';

import redisClient from '../../config/redis';

export const onQueueFinish = async (queue: Queue): Promise<void> => {
  const guildID = queue.channel.guildId;
  queue.player.disconnect();
  queue.player.node.destroyPlayer(queue.player.guildId);

  // delete player message if exists
  const key = `playerMessage:${guildID}`;
  const msg = await redisClient.get(key);
  if (msg) {
    redisClient.DEL(key);
    const msgObj = await queue.channel.messages.fetch(msg);
    if (msgObj) {
      msgObj.delete();
    }
  }
};
