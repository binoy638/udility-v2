/* eslint-disable no-unused-vars */

import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
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
  callback: async ({ interaction, message, args }) => {
    // console.log(interaction);
    const ctx = new CommandContext(interaction, message);

    // const embed = {
    //   title: 'Linkin Park - Numb',
    //   url: 'https://discord.js.org/',
    //   author: {
    //     name: 'Udility Music Player',
    //     iconURL: 'https://i.imgur.com/AfFp7pu.png',
    //     url: 'https://discord.js.org',
    //   },
    //   description: 'Playing',
    //   thumbnail: { url: 'https://pbs.twimg.com/profile_images/1431129444362579971/jGrgSKDD_400x400.jpg' },
    //   fields: [
    //     { name: 'Total Tracks', value: '10', inline: true },
    //     { name: 'Current Track', value: '5', inline: true },
    //     { name: 'Next Track', value: 'Linkin Park - In the end' },
    //   ],
    // };

    const row = new MessageActionRow().addComponents(
      new MessageButton().setCustomId('primary').setLabel('Primary').setStyle('PRIMARY')
    );

    ctx.reply({ components: [row] });
  },
} as ICommand;
