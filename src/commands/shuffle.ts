import { ICommand } from 'wokcommands';

import { MusicPlayer } from '../lib/MusicPlayer';

export default {
  category: 'Music',
  description: 'Shuffle the current playlist',
  aliases: ['sf'],
  slash: 'both',
  guildOnly: true,
  callback: async ({ interaction, message }) => {
    const player = new MusicPlayer(interaction, message);
    player.shuffle();
  },
} as ICommand;
