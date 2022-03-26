/* eslint-disable no-unused-vars */

import { ICommand } from 'wokcommands';

import { MusicPlayer } from '../lib/MusicPlayer';

export default {
  category: 'Music',
  description: 'Kick bot from voice channel',
  aliases: ['disconnect', 'dc'],
  slash: 'both',
  guildOnly: true,
  testOnly: true,
  callback: async ({ interaction, message }) => {
    const player = new MusicPlayer(interaction, message);
    player.disconnect();
  },
} as ICommand;
