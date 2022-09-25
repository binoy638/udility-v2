/* eslint-disable no-unused-vars */
import { ICommand } from 'wokcommands';

import redisClient from '../config/redis';

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
    const data = await redisClient.GET('mykey');
    if (data) {
      console.log(data);
      console.log('exists');
    } else {
      console.log('does not exist');
      redisClient.SET('mykey', 'myvalue');
      console.log('set');
    }
  },
} as ICommand;
