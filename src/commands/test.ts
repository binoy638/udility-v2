/* eslint-disable no-unused-vars */

import { ICommand } from 'wokcommands';

import { CommandContext, Utils } from '../lib';

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
  callback: async ({ interaction, message }) => {
    // console.log(interaction);
    const ctx = new CommandContext(interaction, message);
    ctx.reply(Utils.embed({ title: 'sup', description: 'yo' }));
  },
} as ICommand;
