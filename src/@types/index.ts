/* eslint-disable no-shadow */
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

export enum MediaStatus {
  //   Has completed and is no longer being released
  FINISHED = 'FINISHED',

  //   Currently releasing
  RELEASING = 'RELEASING',

  //   To be released at a later date
  NOT_YET_RELEASED = 'NOT_YET_RELEASED',

  //   Ended before the work could be finished
  CANCELLED = 'CANCELLED',

  //   Version 2 only. Is currently paused from releasing and will resume at a later date

  HIATUS = 'HIATUS',
}

export interface AnimeData {
  title: {
    romaji: string;
  };
  airingSchedule: {
    nodes: {
      airingAt: number;
      id: number;
      timeUntilAiring: number;
      episode: number;
      mediaId: number;
    }[];
  };
  status: string;
  description: string;
  startDate: {
    year: number;
    month: number;
    day: number;
  };
  endDate: {
    year: number;
    month: number;
    day: number;
  };
  coverImage: {
    extraLarge: string;
    large: string;
  };
  idMal: number;
  season: string;
  siteUrl: string;
  updatedAt: number;
  nextAiringEpisode: number | null;
}
