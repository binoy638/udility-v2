import { Interaction } from 'discord.js';

import { Button } from '../@types';
import logger from '../config/logger';
import { MusicPlayer } from '../lib/MusicPlayer';

export const onInteractionCreate = async (interaction: Interaction): Promise<void> => {
  if (!interaction.isButton()) return;
  const buttonID = interaction.customId;
  console.log(buttonID);
  switch (buttonID) {
    case Button.play: {
      interaction.deferUpdate();
      const player = new MusicPlayer(interaction, undefined);
      await player.resume();

      break;
    }
    case Button.pause: {
      interaction.deferUpdate();
      const player = new MusicPlayer(interaction, undefined);
      await player.pause();
      break;
    }
    case Button.skip: {
      interaction.deferUpdate();
      const player = new MusicPlayer(interaction, undefined);
      player.skip();
      break;
    }
    case Button.stop: {
      const player = new MusicPlayer(interaction, undefined);
      player.disconnect();
      break;
    }
    case Button.shuffle: {
      const player = new MusicPlayer(interaction, undefined);
      player.shuffle();
      break;
    }
    case Button.loop: {
      const player = new MusicPlayer(interaction, undefined);
      player.loop();
      break;
    }
    default:
      logger.info(`Unknown button interaction: ${buttonID}`);
  }
};
