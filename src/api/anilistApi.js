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

// ─── Helpers de temporada ────────────────────────────────────────────────────

export const getSeasonInfo = () => {
  const month = new Date().getMonth() + 1
  const year = new Date().getFullYear()
  const season =
    month >= 3 && month <= 5 ? 'SPRING'
    : month >= 6 && month <= 8 ? 'SUMMER'
    : month >= 9 && month <= 11 ? 'FALL'
    : 'WINTER'
  return { season, year }
}

export const getNextSeasonInfo = () => {
  const { season, year } = getSeasonInfo()
  const order = ['WINTER', 'SPRING', 'SUMMER', 'FALL']
  const i = order.indexOf(season)
  const nextSeason = order[(i + 1) % 4]
  // El año avanza solo cuando la próxima temporada es WINTER
  const nextYear = nextSeason === 'WINTER' ? year + 1 : year
  return { season: nextSeason, year: nextYear }
}

// ─── Campos comunes para el listado ─────────────────────────────────────────

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

// ─── Query unificada para listado + búsqueda + filtros ──────────────────────
// Todos los parámetros son opcionales en AniList: si no se pasan (undefined),
// la API los ignora. Solo incluimos en `vars` los que tienen valor.

const ANIME_LIST_QUERY = `
  query(
    $page: Int, $perPage: Int,
    $search: String,
    $genre: String,
    $seasonYear: Int,
    $season: MediaSeason,
    $format: MediaFormat,
    $averageScore_greater: Int,
    $averageScore_lesser: Int,
    $sort: [MediaSort],
    $status: MediaStatus
  ) {
    Page(page: $page, perPage: $perPage) {
      pageInfo { currentPage lastPage hasNextPage total }
      media(
        type: ANIME
        isAdult: false
        search: $search
        genre: $genre
        seasonYear: $seasonYear
        season: $season
        format: $format
        averageScore_greater: $averageScore_greater
        averageScore_lesser: $averageScore_lesser
        sort: $sort
        status: $status
      ) { ${MEDIA_FIELDS} }
    }
  }
`

// Elimina claves con valores vacíos para no contaminar la query
const cleanVars = (vars) =>
  Object.fromEntries(
    Object.entries(vars).filter(([, v]) => v !== undefined && v !== null && v !== '')
  )

export const getAnimeList = (vars = {}) =>
  request(ANIME_LIST_QUERY, cleanVars({ page: 1, perPage: 20, ...vars }))

// ─── Detalle con trailer ─────────────────────────────────────────────────────

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
        trailer { id site thumbnail }
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
