/* eslint-disable no-unused-vars */

import { ICommand } from 'wokcommands';

import { guildEmoteModel } from '../models/emote.schema';

export default {
  category: 'Testing',
  description: 'test',
  ownerOnly: true,
  slash: 'both',
  options: [
    {
      name: 'query',
      type: 'STRING',
      description: 'query string',
    },
  ],
  expectedArgs: '<query>',
  syntaxError: { error: 'Incorrect usage! Please use "{PREFIX}add {ARGUMENTS}"' },
  testOnly: true,
  callback: async () => {
    const emotes = await guildEmoteModel.find({}).lean(true);

    console.log(emotes);
  },
} as ICommand;
