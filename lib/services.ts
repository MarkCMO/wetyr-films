import { apiGet, apiPost } from './api';
import type {
  FilmIntel, NewsResponse, CastingResponse, RolodexList, Person, Company,
} from './types';

// Public film intel + feeds
export const getFilmIntel = () => apiGet<FilmIntel>('/.netlify/functions/film-intel');
export const getNews = () => apiGet<NewsResponse>('/.netlify/functions/news-feed');
export const getCasting = () => apiGet<CastingResponse>('/.netlify/functions/casting-calls');

// Rolodex.
// Use the direct Cloudflare route (/film-rolodex), not /.netlify/functions/film-rolodex:
// the latter goes through the root catch-all worker which serves a stale bundle.
// The direct per-route function runs current code.
const RX = '/film-rolodex';

export function getRolodex(opts: {
  q?: string; type?: string; tag?: string; dept?: string; limit?: number; offset?: number;
}) {
  const query: Record<string, string> = {
    action: 'list',
    limit: String(opts.limit ?? 1000),
    offset: String(opts.offset ?? 0),
  };
  if (opts.q) query.q = opts.q;
  if (opts.type) query.type = opts.type;
  if (opts.tag) query.tag = opts.tag;
  if (opts.dept) query.dept = opts.dept;
  return apiGet<RolodexList>(RX, query);
}

export const addPerson = (person: Partial<Person>) =>
  apiPost<{ ok?: boolean; id?: string; error?: string }>(RX, { action: 'addPerson', person });
export const addCompany = (company: Partial<Company>) =>
  apiPost<{ ok?: boolean; id?: string; error?: string }>(RX, { action: 'addCompany', company });
export const updatePerson = (id: string, patch: Record<string, unknown>) =>
  apiPost<{ ok?: boolean; error?: string }>(RX, { action: 'updatePerson', id, patch });
export const updateCompany = (id: string, patch: Record<string, unknown>) =>
  apiPost<{ ok?: boolean; error?: string }>(RX, { action: 'updateCompany', id, patch });
export const deletePerson = (id: string) =>
  apiPost<{ ok?: boolean; error?: string }>(RX, { action: 'deletePerson', id });
export const deleteCompany = (id: string) =>
  apiPost<{ ok?: boolean; error?: string }>(RX, { action: 'deleteCompany', id });
export const enrichPerson = (personId: string) =>
  apiPost<any>(RX, { action: 'enrich', personId });
export const enrichCompany = (companyId: string) =>
  apiPost<any>(RX, { action: 'enrich-company', companyId });
export const findNewestEmail = (personId: string) =>
  apiPost<any>(RX, { action: 'find-newest-email', personId });

// Bulk tools (trigger existing server crons / batch jobs)
export const syncNow = () => apiPost<any>('/api/film-rolodex-cron', {});
export const deepCrawl = () => apiPost<any>('/api/film-rolodex-deep-cron', {});
export const freshenBatch = () => apiPost<any>(RX, { action: 'freshen-batch' });
