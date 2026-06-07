import { useEffect } from 'react';
import { ScrollView, View, Text, Pressable, RefreshControl, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/theme';
import { useIntel } from '@/lib/intelStore';
import { Panel, SectionHeader, LivePill, Poster, Rating, Loading, ErrorView } from '@/components/ui';
import type { TrendingTitle } from '@/lib/types';

export default function BoxOfficeScreen() {
  const insets = useSafeAreaInsets();
  const { data, loading, error, load } = useIntel();
  useEffect(() => { load(); }, [load]);

  const nowPlaying = data?.nowPlaying ?? [];
  const trending = data?.trending ?? [];

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, gap: 18, paddingBottom: insets.bottom + 24 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => load(true)} tintColor={colors.gold} />}
    >
      <SectionHeader eyebrow="Box Office" title="In theaters and trending" right={<LivePill label="TMDB" />} />

      {loading && nowPlaying.length === 0 ? (
        <Loading text="Loading box office intel..." />
      ) : error && nowPlaying.length === 0 ? (
        <ErrorView message={error} onRetry={() => load(true)} />
      ) : (
        <>
          {nowPlaying.length > 0 && (
            <Panel title="In theaters now, US" tag="LIVE VIA TMDB">
              {nowPlaying.map((m, i) => <Row key={m.id} rank={i + 1} m={m} last={i === nowPlaying.length - 1} />)}
            </Panel>
          )}
          {trending.length > 0 && (
            <Panel title="Trending this week" tag={`TOP ${trending.length}`}>
              {trending.map((m, i) => <Row key={m.id} rank={i + 1} m={m} last={i === trending.length - 1} />)}
            </Panel>
          )}
        </>
      )}
    </ScrollView>
  );
}

function Row({ rank, m, last }: { rank: number; m: TrendingTitle; last: boolean }) {
  const pop = m.popularity ?? 0;
  const arrow = pop > 80 ? '▲' : pop < 30 ? '▼' : '·';
  const arrowColor = pop > 80 ? colors.green : pop < 30 ? colors.red : colors.dim;
  return (
    <Pressable
      onPress={() => Linking.openURL(`https://www.themoviedb.org/movie/${m.id}`)}
      style={{
        flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8,
        borderBottomWidth: last ? 0 : 1, borderBottomColor: colors.border,
      }}
    >
      <Text style={{ color: colors.dim, fontWeight: '700', width: 20, fontSize: 13 }}>{rank}</Text>
      <Poster uri={m.poster} w={40} h={60} rad={6} />
      <View style={{ flex: 1, gap: 4 }}>
        <Text style={{ color: colors.text, fontWeight: '600' }} numberOfLines={2}>{m.title}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Rating value={m.voteAverage} count={m.voteCount} />
          <Text style={{ color: arrowColor, fontSize: 12 }}>{arrow} {Math.round(pop)}</Text>
        </View>
      </View>
      <Text style={{ color: colors.dim }}>›</Text>
    </Pressable>
  );
}
