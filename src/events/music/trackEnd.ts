import { Queue } from '@lavaclient/queue';

import { Utils } from '../../lib';

export const onTrackEnd = async (queue: Queue): Promise<void> => {
  console.log('[music] track ended');
  await Utils.deleteMusicPlayerEmbed(queue);
};
