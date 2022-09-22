/* eslint-disable unicorn/no-process-exit */
import { Agenda } from 'agenda';
import dotenv from 'dotenv';

dotenv.config();

const agenda = new Agenda({ db: { address: process.env.MONGO_URI! } });

agenda.on('ready', async () => {
  await agenda.start();
  console.log('agenda is ready');
});

export default agenda;
