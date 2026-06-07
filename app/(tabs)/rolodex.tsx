import { useEffect, useState } from 'react';
import {
  View, Text, TextInput, Pressable, ScrollView, ActivityIndicator, Alert, StyleSheet,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors } from '@/constants/theme';
import { useAuth } from '@/lib/auth';
import { useRolodex, emailList, personSubtitle } from '@/lib/rolodexStore';
import * as svc from '@/lib/services';
import { Loading, ErrorView, Empty, FreshnessBadge, Tags } from '@/components/ui';
import type { Person, Company } from '@/lib/types';

export default function RolodexScreen() {
  const insets = useSafeAreaInsets();
  const { isAuthed, checking } = useAuth();

  if (checking && !isAuthed) {
    return <View style={{ flex: 1, backgroundColor: colors.bg, justifyContent: 'center' }}><ActivityIndicator color={colors.gold} /></View>;
  }
  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingBottom: insets.bottom }}>
      {isAuthed ? <Authed /> : <Login />}
    </View>
  );
}

function Login() {
  const { login, error } = useAuth();
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy || !user || !pass) return;
    setBusy(true);
    await login(user.trim(), pass);
    setBusy(false);
  };

  return (
    <ScrollView contentContainerStyle={{ padding: 16, gap: 16, alignItems: 'center' }}>
      <Text style={{ fontSize: 44, marginTop: 40 }}>🔒</Text>
      <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>Industry Rolodex</Text>
      <Text style={{ color: colors.muted }}>Internal contacts. Sign in to continue.</Text>
      <View style={{ width: '100%', backgroundColor: colors.panel, borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: 16, gap: 12 }}>
        <TextInput
          placeholder="Username" placeholderTextColor={colors.dim} value={user} onChangeText={setUser}
          autoCapitalize="none" autoCorrect={false} style={s.input}
        />
        <TextInput
          placeholder="Password" placeholderTextColor={colors.dim} value={pass} onChangeText={setPass}
          secureTextEntry style={s.input} onSubmitEditing={submit}
        />
        {!!error && <Text style={{ color: colors.red, fontSize: 13 }}>{error}</Text>}
        <Pressable onPress={submit} disabled={busy || !user || !pass} style={[s.primaryBtn, { opacity: busy || !user || !pass ? 0.6 : 1 }]}>
          {busy ? <ActivityIndicator color="#000" /> : <Text style={{ color: '#000', fontWeight: '800' }}>Sign in</Text>}
        </Pressable>
      </View>
    </ScrollView>
  );
}

function Authed() {
  const { logout } = useAuth();
  const rx = useRolodex();
  const [q, setQ] = useState('');
  const [segment, setSegment] = useState(0); // 0 contacts, 1 companies

  useEffect(() => {
    if (rx.companies.length === 0 && rx.people.length === 0) rx.load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tool = async (label: string, fn: () => Promise<any>, done: string) => {
    const msg = await rx.runAction(label, async () => { await fn(); return done; });
    Alert.alert('Done', msg);
  };

  const showTools = () => {
    Alert.alert('Rolodex tools', undefined, [
      { text: 'Sync now', onPress: () => tool('Syncing', svc.syncNow, 'Sync started. Pull to refresh shortly.') },
      { text: 'Deep crawl', onPress: () => tool('Deep crawling', svc.deepCrawl, 'Deep crawl started in the background.') },
      { text: 'Freshen stale emails', onPress: () => tool('Freshening', svc.freshenBatch, 'Freshen batch complete.') },
      { text: 'Sign out', style: 'destructive', onPress: () => logout() },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  const countLabel = (filtered?: number, total?: number) => {
    if (total == null) return '';
    return filtered != null && filtered !== total ? `(${filtered})` : `(${total})`;
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 16, gap: 10 }}>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <View style={s.search}>
            <Text style={{ color: colors.dim }}>🔎</Text>
            <TextInput
              placeholder="Search name, company, email, IMDb..." placeholderTextColor={colors.dim}
              value={q} onChangeText={setQ} autoCapitalize="none" autoCorrect={false}
              returnKeyType="search" onSubmitEditing={() => rx.load({ q })}
              style={{ flex: 1, color: colors.text }}
            />
            {!!q && <Pressable onPress={() => { setQ(''); rx.load({ q: '' }); }}><Text style={{ color: colors.dim }}>✕</Text></Pressable>}
          </View>
          <Pressable onPress={() => router.push('/contact/edit?mode=new&kind=person')}><Text style={{ color: colors.gold, fontSize: 22 }}>＋</Text></Pressable>
          <Pressable onPress={showTools}><Text style={{ color: colors.gold, fontSize: 22 }}>⋯</Text></Pressable>
        </View>
        <View style={{ flexDirection: 'row', backgroundColor: colors.panel2, borderRadius: 8, padding: 3 }}>
          {[`Contacts ${countLabel(rx.totals.filteredPeople, rx.totals.people)}`, `Companies ${countLabel(rx.totals.filteredCompanies, rx.totals.companies)}`].map((label, i) => (
            <Pressable key={i} onPress={() => setSegment(i)} style={{ flex: 1, paddingVertical: 8, borderRadius: 6, backgroundColor: segment === i ? colors.panel : 'transparent', alignItems: 'center' }}>
              <Text style={{ color: segment === i ? colors.gold : colors.muted, fontWeight: '700', fontSize: 13 }}>{label}</Text>
            </Pressable>
          ))}
        </View>
      </View>

      <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 0, gap: 12 }}>
        {rx.loading && rx.people.length === 0 && rx.companies.length === 0 ? (
          <Loading text="Loading the Rolodex..." />
        ) : rx.error ? (
          <ErrorView message={rx.error} onRetry={() => rx.load()} />
        ) : segment === 0 ? (
          rx.people.length === 0 ? <Empty text="No contacts match." /> :
            rx.people.map((p) => <PersonCard key={p.id} p={p} />)
        ) : (
          rx.companies.length === 0 ? <Empty text="No companies match." /> :
            rx.companies.map((c) => <CompanyCard key={c.id} c={c} />)
        )}

        {rx.hasMore && (
          <Pressable onPress={() => rx.loadMore()} style={s.loadMore}>
            {rx.paging ? <ActivityIndicator color={colors.gold} /> : <Text style={{ color: colors.gold, fontWeight: '700' }}>Load more</Text>}
          </Pressable>
        )}
      </ScrollView>

      {!!rx.working && (
        <View style={s.working}>
          <ActivityIndicator color={colors.gold} />
          <Text style={{ color: colors.text }}>{rx.working}</Text>
        </View>
      )}
    </View>
  );
}

function PersonCard({ p }: { p: Person }) {
  const primary = emailList(p)[0];
  return (
    <Pressable onPress={() => router.push(`/contact/${p.id}?kind=person`)} style={s.card}>
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{p.name}</Text>
      {!!personSubtitle(p) && <Text style={{ color: colors.muted, fontSize: 12 }}>{personSubtitle(p)}</Text>}
      {primary ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Text style={{ color: colors.blue, fontSize: 13 }} numberOfLines={1}>✉ {primary.address}</Text>
          <FreshnessBadge freshness={primary._freshness} />
        </View>
      ) : <Text style={{ color: colors.dim, fontSize: 12 }}>✉ no email on file</Text>}
      {!!p.tags?.length && <Tags tags={p.tags.slice(0, 3)} />}
    </Pressable>
  );
}

function CompanyCard({ c }: { c: Company }) {
  return (
    <Pressable onPress={() => router.push(`/contact/${c.id}?kind=company`)} style={s.card}>
      <Text style={{ color: colors.text, fontSize: 16, fontWeight: '700' }}>{c.name}</Text>
      <Text style={{ color: colors.muted, fontSize: 12 }}>{[c.type, c.parent].filter(Boolean).join('  ·  ')}</Text>
      {!!c.hq && <Text style={{ color: colors.muted, fontSize: 12 }}>📍 {c.hq}</Text>}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        {!!c.emails?.length && <Text style={{ color: colors.green, fontSize: 12 }}>✉ {c.emails.length}</Text>}
        {!!c.phones?.length && <Text style={{ color: colors.dim, fontSize: 12 }}>☎ {c.phones.length}</Text>}
      </View>
      {!!c.tags?.length && <Tags tags={c.tags.slice(0, 3)} />}
    </Pressable>
  );
}

const s = StyleSheet.create({
  input: { backgroundColor: colors.panel2, borderRadius: 8, padding: 12, color: colors.text },
  primaryBtn: { backgroundColor: colors.gold, borderRadius: 8, minHeight: 48, alignItems: 'center', justifyContent: 'center' },
  search: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.panel2, borderRadius: 8, paddingHorizontal: 10, paddingVertical: 8 },
  card: { backgroundColor: colors.panel, borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: 14, gap: 6 },
  loadMore: { backgroundColor: colors.panel, borderRadius: 8, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  working: { position: 'absolute', bottom: 16, alignSelf: 'center', flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: colors.panel, borderColor: colors.border, borderWidth: 1, borderRadius: 999, paddingHorizontal: 16, paddingVertical: 10 },
});
