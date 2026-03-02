import axios from 'axios'

const ANILIST_URL = 'https://graphql.anilist.co'

const request = async (query, variables = {}) => {
  const { data } = await axios.post(
    ANILIST_URL,
    { query, variables },
    { headers: { 'Content-Type': 'application/json' } }
  )
  if (data.errors) throw new Error(data.errors[0].message)
  return data.data
}

const MEDIA_FIELDS = `
  id
  title { romaji english }
  coverImage { large }
  genres
  episodes
  status
  format
  averageScore
`

export const getTrending = (page = 1, perPage = 20) =>
  request(
    `query($page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { currentPage lastPage hasNextPage total }
        media(type: ANIME, sort: TRENDING_DESC, isAdult: false) { ${MEDIA_FIELDS} }
      }
    }`,
    { page, perPage }
  )

export const searchAnime = (search, page = 1, perPage = 20) =>
  request(
    `query($search: String!, $page: Int, $perPage: Int) {
      Page(page: $page, perPage: $perPage) {
        pageInfo { currentPage lastPage hasNextPage total }
        media(search: $search, type: ANIME, isAdult: false) { ${MEDIA_FIELDS} }
      }
    }`,
    { search, page, perPage }
  )

export const getAnimeDetail = (id) =>
  request(
    `query($id: Int!) {
      Media(id: $id, type: ANIME) {
        id
        title { romaji english native }
        coverImage { extraLarge large }
        bannerImage
        genres
        episodes
        status
        format
        averageScore
        description(asHtml: false)
        season
        seasonYear
        studios(isMain: true) { nodes { name } }
        characters(sort: ROLE, perPage: 8) {
          nodes {
            name { full }
            image { medium }
          }
        }
      }
    }`,
    { id: Number(id) }
  )
