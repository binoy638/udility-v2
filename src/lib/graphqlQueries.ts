export const fetchAnimeQuery = `query($idMal: Int, $type: MediaType)  {
  Media(idMal: $idMal, type: $type) {
    title {
      romaji
      english
      native
      userPreferred
    }
    airingSchedule {
      nodes {
        airingAt
        id
        timeUntilAiring
        episode
        mediaId
      }
    }
    type
    status
    description
    siteUrl
    startDate {
      year
      month
      day
    }
    endDate {
      year
      month
      day
    }
    coverImage {
      extraLarge
      large
    }
    idMal
    updatedAt
    genres
    episodes
    nextAiringEpisode {
      airingAt
      timeUntilAiring
      episode
      mediaId
      id
    }
  }
}`;
