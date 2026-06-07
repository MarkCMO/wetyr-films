import { apiGet } from './api';
import type {
  FilmIntel, NewsResponse, CastingResponse,
  SearchResponse, DetailResponse, UpcomingResponse,
} from './types';

// Public film intel + feeds (Cloudflare functions on markcmo.com)
export const getFilmIntel = () => apiGet<FilmIntel>('/.netlify/functions/film-intel');
export const getNews = () => apiGet<NewsResponse>('/.netlify/functions/news-feed');
export const getCasting = () => apiGet<CastingResponse>('/.netlify/functions/casting-calls');

// Search any film / TV / person, plus detail + upcoming.
// Direct route (per-route function), not the catch-all path.
export const searchTitles = (q: string) =>
  apiGet<SearchResponse>('/film-search', { q });

export const getDetail = (id: number, type: 'movie' | 'tv' | 'person') =>
  apiGet<DetailResponse>('/film-search', { id: String(id), type });

export const getUpcoming = () =>
  apiGet<UpcomingResponse>('/film-search', { upcoming: '1' });
