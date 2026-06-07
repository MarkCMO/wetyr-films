import { useEffect, useRef, useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { colors } from '@/constants/theme';
import { searchTitles, getUpcoming } from '@/lib/services';
import { errMessage } from '@/lib/api';
import { year } from '@/lib/format';
import { SectionHeader, Poster, Rating, Loading, ErrorView, Empty, Pill } from '@/components/ui';
import type { SearchResult, TrendingTitle } from '@/lib/types';

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const [q, setQ] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [upcoming, setUpcoming] = useState<TrendingTitle[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searched, setSearched] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    getUpcoming().then((r) => setUpcoming(r.upcoming ?? [])).catch(() => {});
  }, []);

  // Debounced live search.
  useEffect(() => {
    if (debounce.current) clearTimeout(debounce.current);
    const term = q.trim();
    if (term.length < 2) { setResults([]); setSearched(false); return; }
    debounce.current = setTimeout(async () => {
      setLoading(true); setError(null);
      try {
        const r = await searchTitles(term);
        setResults(r.results ?? []);
        setSearched(true);
      } catch (e) {
        setError(errMessage(e));
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => { if (debounce.current) clearTimeout(debounce.current); };
  }, [q]);

  const open = (r: { id: number; mediaType: string }) =>
    router.push(`/title/${r.id}?type=${r.mediaType}`);

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg, paddingTop: 0 }}>
      <ScrollView
        contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled"
      >
        <SectionHeader eyebrow="Search" title="Any film, TV, or person" />

        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: colors.panel2, borderRadius: 10, paddingHorizontal: 12 }}>
          <Text style={{ color: colors.dim }}>🔎</Text>
          <TextInput
            placeholder="Search titles and talent..." placeholderTextColor={colors.dim}
            value={q} onChangeText={setQ} autoCorrect={false} autoCapitalize="none"
            returnKeyType="search"
            style={{ flex: 1, color: colors.text, paddingVertical: 12, fontSize: 16 }}
          />
          {loading ? <ActivityIndicator color={colors.gold} /> :
            (!!q && <Pressable onPress={() => setQ('')}><Text style={{ color: colors.dim }}>✕</Text></Pressable>)}
        </View>

        {error ? (
          <ErrorView message={error} onRetry={() => setQ((v) => v + ' ')} />
        ) : q.trim().length >= 2 ? (
          loading && results.length === 0 ? (
            <Loading text="Searching..." />
          ) : searched && results.length === 0 ? (
            <Empty text={`No results for "${q.trim()}".`} />
          ) : (
            <View style={{ gap: 10 }}>
              {results.map((r) => <ResultRow key={`${r.mediaType}-${r.id}`} r={r} onPress={() => open(r)} />)}
            </View>
          )
        ) : (
          // Idle state: Upcoming releases
          <View style={{ gap: 12 }}>
            <Text style={{ color: colors.gold, fontSize: 12, fontWeight: '800', letterSpacing: 1 }}>UPCOMING RELEASES</Text>
            {upcoming.length === 0 ? (
              <Empty text="Search any movie, show, or person to pull full intel." />
            ) : upcoming.map((m) => (
              <ResultRow key={m.id} onPress={() => open({ id: m.id, mediaType: 'movie' })}
                r={{ id: m.id, mediaType: 'movie', title: m.title, date: m.date, poster: m.poster, voteAverage: m.voteAverage, overview: m.overview }} />
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function ResultRow({ r, onPress }: { r: SearchResult; onPress: () => void }) {
  const isPerson = r.mediaType === 'person';
  const sub = isPerson ? (r.department || 'Person') : (r.mediaType === 'tv' ? 'TV' : 'Film');
  return (
    <Pressable
      onPress={onPress}
      style={{ flexDirection: 'row', gap: 12, backgroundColor: colors.panel, borderColor: colors.border, borderWidth: 1, borderRadius: 12, padding: 10 }}
    >
      <Poster uri={r.poster} w={52} h={78} rad={7} />
      <View style={{ flex: 1, gap: 4, justifyContent: 'center' }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Text style={{ color: colors.text, fontWeight: '700', flexShrink: 1 }} numberOfLines={1}>{r.title}</Text>
          <Pill text={sub} color={isPerson ? colors.purple : colors.blue} />
        </View>
        {!isPerson && (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {!!year(r.date) && <Text style={{ color: colors.dim, fontSize: 12 }}>{year(r.date)}</Text>}
            <Rating value={r.voteAverage} count={r.voteCount} />
          </View>
        )}
        {isPerson && !!r.knownForText && <Text style={{ color: colors.muted, fontSize: 12 }} numberOfLines={1}>Known for: {r.knownForText}</Text>}
        {!isPerson && !!r.overview && <Text style={{ color: colors.muted, fontSize: 12 }} numberOfLines={2}>{r.overview}</Text>}
      </View>
      <Text style={{ color: colors.dim, alignSelf: 'center' }}>›</Text>
    </Pressable>
  );
}
