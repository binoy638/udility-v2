/* eslint-disable no-unused-vars */

import { ICommand } from 'wokcommands';

import { MusicPlayer } from '../../lib/MusicPlayer';

export default {
  category: 'Music',
  description: 'Resume the currently paused song',
  aliases: ['rs'],
  slash: 'both',
  guildOnly: true,
  callback: async ({ interaction, message }) => {
    const player = new MusicPlayer(interaction, message);
    player.resume();
  },
} as ICommand;
