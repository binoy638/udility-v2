import { ICommand } from 'wokcommands';

import { MusicPlayer } from '../lib/MusicPlayer';

export default {
  category: 'Music',
  description: 'Clear the music player queue',
  slash: 'both',
  guildOnly: true,
  testOnly: true,
  callback: async ({ interaction, message }) => {
    const player = new MusicPlayer(interaction, message);
    player.clear();
  },
} as ICommand;
