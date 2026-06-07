import { create } from 'zustand';
import * as svc from './services';
import { errMessage } from './api';
import type { Company, Person, Facets } from './types';

const PAGE = 1000;

interface RolodexState {
  companies: Company[];
  people: Person[];
  facets: Facets;
  totals: { companies?: number; people?: number; filteredCompanies?: number; filteredPeople?: number };
  loading: boolean;
  paging: boolean;
  hasMore: boolean;
  error: string | null;
  working: string | null;
  q: string; type: string; tag: string; dept: string;
  offset: number;

  load: (opts?: { q?: string; type?: string; tag?: string; dept?: string }) => Promise<void>;
  loadMore: () => Promise<void>;
  personById: (id: string) => Person | undefined;
  companyById: (id: string) => Company | undefined;
  runAction: (label: string, fn: () => Promise<string>) => Promise<string>;
}

export const useRolodex = create<RolodexState>((set, get) => ({
  companies: [], people: [], facets: {}, totals: {},
  loading: false, paging: false, hasMore: false, error: null, working: null,
  q: '', type: '', tag: '', dept: '', offset: 0,

  load: async (opts = {}) => {
    const q = opts.q ?? get().q, type = opts.type ?? get().type, tag = opts.tag ?? get().tag, dept = opts.dept ?? get().dept;
    set({ loading: true, error: null, q, type, tag, dept, offset: 0 });
    try {
      const r = await svc.getRolodex({ q, type, tag, dept, limit: PAGE, offset: 0 });
      set({
        companies: r.companies ?? [], people: r.people ?? [],
        facets: r.facets ?? {}, totals: r.total ?? {},
        hasMore: !!(r.paging?.companiesHasMore || r.paging?.peopleHasMore),
        loading: false,
      });
    } catch (e) {
      set({ loading: false, error: errMessage(e) });
    }
  },

  loadMore: async () => {
    const st = get();
    if (!st.hasMore || st.paging) return;
    const offset = st.offset + PAGE;
    set({ paging: true });
    try {
      const r = await svc.getRolodex({ q: st.q, type: st.type, tag: st.tag, dept: st.dept, limit: PAGE, offset });
      set({
        companies: [...st.companies, ...(r.companies ?? [])],
        people: [...st.people, ...(r.people ?? [])],
        hasMore: !!(r.paging?.companiesHasMore || r.paging?.peopleHasMore),
        offset, paging: false,
      });
    } catch (e) {
      set({ paging: false, error: errMessage(e) });
    }
  },

  personById: (id) => get().people.find((p) => p.id === id),
  companyById: (id) => get().companies.find((c) => c.id === id),

  runAction: async (label, fn) => {
    set({ working: label });
    try {
      const msg = await fn();
      return msg;
    } catch (e) {
      return errMessage(e);
    } finally {
      set({ working: null });
    }
  },
}));

// Normalize a person's emails, current first, de-duplicated.
export function emailList(p: Person) {
  let list = p.emails ?? [];
  if (!list.length && p.email) list = [{ address: p.email, source: 'manual' }];
  const seen = new Set<string>();
  const out = list.filter((e) => {
    const a = (e.address || '').toLowerCase();
    if (!a || seen.has(a)) return false;
    seen.add(a);
    return true;
  });
  return out.sort((a, b) => {
    const aa = a._archivedAt ? 1 : 0, ba = b._archivedAt ? 1 : 0;
    if (aa !== ba) return aa - ba;
    return (b._freshness ?? 0) - (a._freshness ?? 0);
  });
}

export function personSubtitle(p: Person): string {
  const parts: string[] = [];
  const role = p.title || p.dept;
  if (role) parts.push(role);
  if (p._companyName) parts.push(p._companyName);
  return parts.join('  ·  ');
}

export function allPhones(c: Company): string[] {
  const list = [...(c.phones ?? []), c.phone].filter(Boolean) as string[];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const p of list) {
    const k = p.replace(/\D/g, '');
    if (!k || seen.has(k)) continue;
    seen.add(k);
    out.push(p);
  }
  return out.slice(0, 4);
}
