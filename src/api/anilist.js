import axios from 'axios';

const ANILIST_API = import.meta.env.VITE_ANILIST_API || 'https://graphql.anilist.co';

const anilistClient = axios.create({
  baseURL: ANILIST_API,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

const MEDIA_LIST_QUERY = `
  query ($search: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      pageInfo {
        currentPage
        hasNextPage
      }
      media(search: $search, type: ANIME, sort: POPULARITY_DESC) {
        id
        title {
          romaji
          english
        }
        description(asHtml: false)
        episodes
        averageScore
        genres
        coverImage {
          large
          medium
        }
      }
    }
  }
`;

const MEDIA_DETAIL_QUERY = `
  query ($id: Int) {
    Media(id: $id, type: ANIME) {
      id
      title {
        romaji
        english
      }
      description(asHtml: false)
      episodes
      averageScore
      genres
      bannerImage
      coverImage {
        extraLarge
        large
      }
      season
      seasonYear
      status
      format
    }
  }
`;

export const fetchAnimeList = async ({ search = '', page = 1, perPage = 12 }) => {
  const response = await anilistClient.post('', {
    query: MEDIA_LIST_QUERY,
    variables: { search: search || null, page, perPage },
  });

  const pageData = response.data?.data?.Page;

  return {
    media: pageData?.media ?? [],
    hasNextPage: Boolean(pageData?.pageInfo?.hasNextPage),
    currentPage: pageData?.pageInfo?.currentPage ?? page,
  };
};

export const fetchAnimeDetail = async (animeId) => {
  const response = await anilistClient.post('', {
    query: MEDIA_DETAIL_QUERY,
    variables: { id: Number(animeId) },
  });

  return response.data?.data?.Media;
};
