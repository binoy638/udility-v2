export const fetchAnimeQuery = `query($idMal: Int, $type: MediaType)  {
  Media(idMal: $idMal, type: $type) {
    title {
      romaji
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
    nextAiringEpisode {
      airingAt
      timeUntilAiring
      episode
      mediaId
      id
    }
  }
}`;
