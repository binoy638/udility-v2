import { ICommand } from 'wokcommands';

import { MusicPlayer } from '../lib/MusicPlayer';

export default {
  category: 'Music',
  description: 'Loop the current playlist',
  slash: 'both',
  guildOnly: true,
  callback: async ({ interaction, message }) => {
    const player = new MusicPlayer(interaction, message);
    player.loop();
  },
} as ICommand;
