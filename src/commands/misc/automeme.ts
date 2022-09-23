/* eslint-disable no-plusplus */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable no-underscore-dangle */
/* eslint-disable security/detect-object-injection */
import { ICommand } from 'wokcommands';

import agenda from '../../config/agenda';
import logger from '../../config/logger';
import { CommandContext } from '../../lib/CommandContext';
import Reddit from '../../lib/Reddit';
import { Utils } from '../../lib/Utils';

export default {
  category: 'Misc',
  description: 'Get regular memes from reddit',
  slash: true,
  // permissions: ['ADMINISTRATOR'],
  guildOnly: true,
  options: [
    {
      name: 'subreddits',
      type: 'STRING',
      description: 'Enter the subreddits you want to get memes from(separated by commas)',
      required: true,
    },
    {
      name: 'interval',
      description: 'Enter the interval in minutes',
      type: 'NUMBER',
      min_value: 1,
      required: false,
    },
  ],
  callback: async ({ interaction, channel }) => {
    const ctx = new CommandContext(interaction, undefined);
    const interval = interaction?.options.getNumber('interval');
    const subredditsString = interaction?.options.getString('subreddits');

    if (!subredditsString || !interval) return;
    const subreddits = subredditsString.split(',').map(sub => sub.trim());

    const createJob = () => {
      const job = agenda.create('automeme', {
        channelID: ctx.channel.id,
        subreddits,
      });
      job.repeatEvery(`${interval} minutes`);
      job.save();
      logger.info(`Created job for ${ctx.channel.id}`);
    };

    const Promises = subreddits.map(subreddit => {
      const _subreddit = new Reddit(subreddit, 'hot');
      return _subreddit.isValid();
    });

    const val = await Promise.all(Promises);

    let isValid = 1;
    // eslint-disable-next-line unicorn/no-for-loop
    for (let i = 0; i < val.length; i++) {
      if (val[i] === 0 || val[i] === 2) {
        isValid = val[i];
        break;
      }
      if (val[i] === 1 || val[i] === 3) {
        isValid = val[i];
      }
    }

    if (isValid === 1 || isValid === 3) {
      const isNSFW = val.includes(3);
      if (isNSFW) {
        isValid = 3;
      }
    }

    let subs = '';

    switch (isValid) {
      case 0:
        subs = subreddits.filter((_, i) => val[i] === 0).join(',');
        ctx.reply(
          Utils.embed({
            title: '❌ Subreddit unavailable.',
            description: `unable to access \`${subs}\` make sure it is spelled correctly and try again.`,
          })
        );
        return;
      case 1:
        subs = subreddits.join(',');
        createJob();
        ctx.reply(
          Utils.embed({
            title: '✅ Subscribed',
            description: `Subreddit: \`${subs}\`\nInterval: \`${interval} minutes\``,
          })
        );
        return;
      case 2:
        subs = subreddits.filter((_, i) => val[i] === 2).join(',');
        ctx.reply(
          Utils.embed({
            title: '❌ Not enough media content.',
            description: `It seems that \`${subs}\` doesn't have enough media submissions please select a subreddit with enough media contents.`,
          })
        );
        return;
      case 3:
        if (channel.nsfw) {
          subs = subreddits.join(',');
          createJob();
          ctx.reply(
            Utils.embed({
              title: '✅ Subscribed',
              description: `Subreddit: \`${subs}\`\nInterval: \`${interval} minutes\``,
            })
          );
        } else {
          subs = subreddits.filter((_, i) => val[i] === 3).join(',');
          ctx.reply(
            Utils.embed({
              title: `🔞 NSFW Subreddit Detected ${subs}`,
              description: `Enable NSFW in the channel's settings and try again.`,
            })
          );
        }
        return;

      default:
        ctx.reply(
          Utils.embed({
            title: '❌ Subreddit unavailable.',
            description: `unable to access \`${subs}\` make sure it is spelled correctly and try again.`,
          })
        );
    }
  },
} as ICommand;
