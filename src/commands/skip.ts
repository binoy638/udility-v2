/* eslint-disable no-unused-vars */

import { ICommand } from 'wokcommands';

import { MusicPlayer } from '../lib/MusicPlayer';

export default {
  category: 'Music',
  description: 'Skip the currently playing song',
  aliases: ['next', 'fs'],
  slash: 'both',
  guildOnly: true,
  callback: async ({ interaction, message }) => {
    const player = new MusicPlayer(interaction, message);
    player.skip();
  },
} as ICommand;
