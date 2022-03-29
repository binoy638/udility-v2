// eslint-disable-next-line no-shadow
export enum Button {
  play = 'play',
  pause = 'pause',
  stop = 'stop',
  skip = 'skip',
  loop = 'loop',
  shuffle = 'shuffle',
}

// eslint-disable-next-line no-shadow
export enum ButtonEmojis {
  play = '▶',
  pause = '⏸️',
  stop = '⏹️',
  skip = '⏭️',
  loop = '🔁',
  shuffle = '🔀',
}

export interface IEmote {
  type: string;
  alias: string;
  url: string;
}

export interface IGuildEmotes {
  guild: string;
  emotes: IEmote[];
}
