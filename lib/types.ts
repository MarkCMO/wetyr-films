// Shapes returned by the markcmo.com Netlify functions.

export interface TrendingTitle {
  id: number;
  title: string;
  date?: string;
  voteAverage?: number;
  voteCount?: number;
  popularity?: number;
  poster?: string;
  overview?: string;
}

export interface CastMember { id: number; name: string; character?: string }
export interface CrewMember { id: number; name: string; job?: string }
export interface WatchProvider { provider_id?: number; provider_name?: string; logo_path?: string }
export interface WatchProviders {
  link?: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}
export interface VideoClip { key: string; name?: string; site?: string; type?: string }

export interface TitleDetail {
  id: number;
  mediaType?: 'movie' | 'tv';
  seasons?: number;
  episodes?: number;
  networks?: string[];
  title: string;
  tagline?: string;
  overview?: string;
  runtime?: number;
  releaseDate?: string;
  genres?: string[];
  budget?: number;
  revenue?: number;
  voteAverage?: number;
  voteCount?: number;
  imdbId?: string;
  poster?: string;
  backdrop?: string;
  productionCompanies?: string[];
  productionCountries?: string[];
  cast?: CastMember[];
  crew?: CrewMember[];
  watchProviders?: WatchProviders | null;
  videos?: VideoClip[];
}

export interface FilmIntel {
  ok?: boolean;
  trending?: TrendingTitle[];
  nowPlaying?: TrendingTitle[];
  featured?: TitleDetail | null;
  featuredList?: TitleDetail[];
  updatedAt?: string;
}

export interface NewsItem { src?: string; title: string; link: string; author?: string; date?: string }
export interface NewsResponse { fetchedAt?: string; sourceCount?: number; sourcesOk?: number; items?: NewsItem[] }

export interface CastingCall {
  source?: string;
  title: string;
  link: string;
  summary?: string;
  date?: string;
  location?: string;
  role?: string;
  rate?: string;
  union?: boolean;
  category?: string;
  tags?: string[];
}
export interface CastingResponse {
  scripted?: CastingCall[];
  commercial?: CastingCall[];
  fetchedAt?: string;
  sourcesOk?: number;
  sourceCount?: number;
}

export interface Festival {
  name: string;
  date: string;
  location?: string;
  info?: string;
  tier?: 'hot' | 'soon' | 'regular';
  url?: string;
}

export interface EmailEntry {
  address: string;
  source?: string;
  score?: number;
  _freshness?: number;
  _isPrimary?: boolean;
  _archivedAt?: string;
}

export interface Person {
  id: string;
  name: string;
  title?: string;
  dept?: string;
  company_id?: string;
  _companyName?: string;
  email?: string;
  emails?: EmailEntry[];
  phone?: string;
  linkedin?: string;
  imdb?: string;
  productions?: string[];
  notes?: string;
  tags?: string[];
}

export interface Company {
  id: string;
  name: string;
  type?: string;
  parent?: string;
  hq?: string;
  website?: string;
  phone?: string;
  phones?: string[];
  emails?: EmailEntry[];
  imdb?: string;
  sec_cik?: string | number;
  productions?: string[];
  notes?: string;
  tags?: string[];
}

export interface Facets { types?: string[]; tags?: string[]; depts?: string[] }
export interface RolodexList {
  ok?: boolean;
  companies?: Company[];
  people?: Person[];
  paging?: { companiesHasMore?: boolean; peopleHasMore?: boolean };
  total?: { companies?: number; people?: number; filteredCompanies?: number; filteredPeople?: number };
  facets?: Facets;
}

// ── Search (film-search Cloudflare function) ──────────────────────────────

export interface SearchResult {
  id: number;
  mediaType: 'movie' | 'tv' | 'person';
  title: string;
  date?: string;
  poster?: string;
  voteAverage?: number;
  voteCount?: number;
  overview?: string;
  popularity?: number;
  department?: string;     // person
  knownForText?: string;   // person
}

export interface SearchResponse { ok?: boolean; query?: string; results?: SearchResult[] }
export interface DetailResponse { ok?: boolean; detail?: TitleDetail | PersonDetail }
export interface UpcomingResponse { ok?: boolean; upcoming?: TrendingTitle[] }

export interface PersonCredit {
  id: number;
  mediaType?: string;
  title: string;
  character?: string;
  date?: string;
  poster?: string;
}

export interface PersonDetail {
  id: number;
  person: true;
  name: string;
  department?: string;
  biography?: string;
  birthday?: string;
  placeOfBirth?: string;
  imdbId?: string;
  profile?: string;
  knownFor?: PersonCredit[];
}
