import { create } from 'zustand';
import { getFilmIntel } from './services';
import { errMessage } from './api';
import type { FilmIntel } from './types';

interface IntelState {
  data: FilmIntel | null;
  loading: boolean;
  error: string | null;
  load: (force?: boolean) => Promise<void>;
}

export const useIntel = create<IntelState>((set, get) => ({
  data: null,
  loading: false,
  error: null,
  load: async (force = false) => {
    if (get().loading) return;
    if (get().data && !force) return;
    set({ loading: true, error: null });
    try {
      const data = await getFilmIntel();
      set({
        data,
        loading: false,
        error: data.ok === false ? 'Live film intel is not configured on the server.' : null,
      });
    } catch (e) {
      set({ loading: false, error: errMessage(e) });
    }
  },
}));
