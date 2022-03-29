import { model, Schema } from 'mongoose';

import { IEmote, IGuildEmotes } from '../@types';

const emoteSchema: Schema = new Schema<IEmote>({
  type: { type: String, trim: true, required: true },
  alias: { type: String, trim: true, required: true },
  url: { type: String, trim: true, required: true },
});

const guildEmoteSchema: Schema = new Schema<IGuildEmotes>({
  guild: { type: String, required: true },
  emotes: { type: [emoteSchema], default: [] },
});

export const guildEmoteModel = model<IGuildEmotes>('guild-emotes', guildEmoteSchema);
