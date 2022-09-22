/* eslint-disable no-unused-vars */
import { ICommand } from 'wokcommands';

export default {
  category: 'Testing',
  description: 'test',
  ownerOnly: true,
  slash: 'both',
  // options: [
  //   {
  //     name: 'query',
  //     type: 'STRING',
  //     description: 'query string',
  //   },
  // ],
  expectedArgs: '<query>',
  syntaxError: { error: 'Incorrect usage! Please use "{PREFIX}add {ARGUMENTS}"' },
  testOnly: true,
  callback: async () => {
    return 'test';
  },
} as ICommand;
