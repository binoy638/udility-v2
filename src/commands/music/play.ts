import { ICommand } from 'wokcommands';

import { MusicPlayer } from '../../lib/MusicPlayer';

export default {
  category: 'Music',
  description: 'Play a song',
  aliases: ['p'],
  slash: 'both',
  guildOnly: true,
  options: [
    {
      name: 'query',
      type: 'STRING',
      description: 'The search query',
      required: true,
    },
    {
      name: 'next',
      description: 'Whether to add the results to the top of the queue.',
      type: 'BOOLEAN',
      required: false,
    },
  ],
  expectedArgs: '<query>',
  syntaxError: { error: 'Incorrect usage! Please use "{PREFIX}play {ARGUMENTS}"' },
  callback: async ({ interaction, message, args }) => {
    const next = interaction?.options.getBoolean('next') || false;

    const query = interaction?.options.getString('query') || args.join(' ');

    const player = new MusicPlayer(interaction, message);
    player.play(query, next);
  },
} as ICommand;
