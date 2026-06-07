import { create } from 'zustand';
import { apiGet, apiPost, errMessage } from './api';

interface AuthState {
  isAuthed: boolean;
  checking: boolean;
  error: string | null;
  verify: () => Promise<void>;
  login: (user: string, pass: string) => Promise<boolean>;
  logout: () => Promise<void>;
}

const AUTH = '/.netlify/functions/admin-auth';

export const useAuth = create<AuthState>((set) => ({
  isAuthed: false,
  checking: false,
  error: null,

  verify: async () => {
    set({ checking: true });
    try {
      const r = await apiGet<{ ok?: boolean }>(AUTH, { action: 'verify' });
      set({ isAuthed: r.ok === true, checking: false });
    } catch {
      set({ isAuthed: false, checking: false });
    }
  },

  login: async (user, pass) => {
    set({ error: null });
    try {
      const r = await apiPost<{ ok?: boolean; error?: string }>(AUTH, { user, pass });
      if (r.ok) {
        set({ isAuthed: true });
        return true;
      }
      set({ error: r.error || 'Invalid credentials' });
      return false;
    } catch (e) {
      set({ error: errMessage(e) });
      return false;
    }
  },

  logout: async () => {
    try {
      await apiPost(AUTH, { action: 'logout' });
    } catch {
      // ignore
    }
    set({ isAuthed: false });
  },
}));
