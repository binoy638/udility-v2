import { ICommand } from 'wokcommands';

import { MusicPlayer } from '../../lib/MusicPlayer';

export default {
  category: 'Music',
  description: 'Pause the currently playing song',
  aliases: ['ps'],
  slash: 'both',
  guildOnly: true,
  callback: async ({ interaction, message }) => {
    const player = new MusicPlayer(interaction, message);
    player.pause();
  },
} as ICommand;
