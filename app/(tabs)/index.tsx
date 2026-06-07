import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View, Text, Pressable, ScrollView as HScroll, RefreshControl, Linking, StyleSheet, Image } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/theme';
import { useIntel } from '@/lib/intelStore';
import { money, runtime, year } from '@/lib/format';
import { Panel, SectionHeader, LivePill, Poster, Rating, Loading, ErrorView, Empty, Tags } from '@/components/ui';
import type { TitleDetail } from '@/lib/types';

export default function TitlesScreen() {
  const insets = useSafeAreaInsets();
  const { data, loading, error, load } = useIntel();
  const titles = useMemo<TitleDetail[]>(
    () => data?.featuredList ?? (data?.featured ? [data.featured] : []),
    [data]
  );
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const held = useRef(false);

  const selected = titles.find((t) => t.id === selectedId) ?? titles[0];

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (held.current || titles.length < 2) return;
      setSelectedId((cur) => {
        const ids = titles.map((t) => t.id);
        const idx = ids.indexOf(cur ?? ids[0]);
        return ids[(idx + 1) % ids.length];
      });
    }, 10000);
    return () => clearInterval(timer);
  }, [titles]);

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, gap: 18, paddingBottom: insets.bottom + 24 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={() => load(true)} tintColor={colors.gold} />}
    >
      <SectionHeader eyebrow="Title Intelligence" title="Any film, any TV" right={<LivePill label="TMDB" />} />

      {loading && titles.length === 0 ? (
        <Loading text="Loading live title intelligence..." />
      ) : error && titles.length === 0 ? (
        <ErrorView message={error} onRetry={() => load(true)} />
      ) : !selected ? (
        <Empty text="No trending titles available right now." />
      ) : (
        <>
          <HScroll horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {titles.map((t) => (
                <Pressable
                  key={t.id}
                  onPress={() => { setSelectedId(t.id); held.current = true; }}
                  style={{ borderWidth: 2, borderRadius: 10, borderColor: t.id === selected.id ? colors.gold : 'transparent' }}
                >
                  <Poster uri={t.poster} w={76} h={114} />
                </Pressable>
              ))}
            </View>
          </HScroll>
          <Text style={{ color: colors.dim, fontSize: 12 }}>
            {held.current ? 'Holding selection. Pull to refresh for live updates.' : 'Auto-rotating top trending titles. Tap a poster to hold.'}
          </Text>
          <TitleCard title={selected} />
        </>
      )}
    </ScrollView>
  );
}

function TitleCard({ title }: { title: TitleDetail }) {
  const trailer = title.videos?.find((v) => (v.site || '').toLowerCase() === 'youtube');
  const providers = [
    ...(title.watchProviders?.flatrate ?? []),
    ...(title.watchProviders?.rent ?? []),
    ...(title.watchProviders?.buy ?? []),
  ];
  const seen = new Set<number>();
  const uniqueProviders = providers.filter((p) => {
    const k = p.provider_id ?? -1;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });

  return (
    <Panel title={title.title} tag={year(title.releaseDate)}>
      <View style={{ flexDirection: 'row', gap: 14 }}>
        <Poster uri={title.poster} w={110} h={165} />
        <View style={{ flex: 1, gap: 8 }}>
          {!!title.tagline && <Text style={{ color: colors.muted, fontStyle: 'italic' }}>{title.tagline}</Text>}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <Rating value={title.voteAverage} count={title.voteCount} />
            {!!runtime(title.runtime) && <Text style={{ color: colors.muted, fontSize: 12 }}>⏱ {runtime(title.runtime)}</Text>}
          </View>
          {!!title.genres?.length && <Tags tags={title.genres.slice(0, 4)} />}
          <View style={{ flexDirection: 'row', gap: 14 }}>
            {!!title.imdbId && <Link label="IMDb" url={`https://www.imdb.com/title/${title.imdbId}/`} />}
            {!!trailer && <Link label="Trailer" url={`https://www.youtube.com/watch?v=${trailer.key}`} />}
          </View>
        </View>
      </View>

      <View style={st.stats}>
        <Stat label="Budget" value={money(title.budget)} />
        <View style={st.div} />
        <Stat label="Revenue" value={money(title.revenue)} />
        <View style={st.div} />
        <Stat label="Released" value={year(title.releaseDate) || '-'} />
      </View>

      {!!title.overview && <Text style={{ color: colors.text, opacity: 0.9 }}>{title.overview}</Text>}

      {!!title.cast?.length && (
        <Labeled label="Top cast">
          {title.cast.slice(0, 6).map((c) => c.character ? `${c.name} as ${c.character}` : c.name).join(', ')}
        </Labeled>
      )}
      {!!title.crew?.length && (
        <Labeled label="Key crew">
          {title.crew.slice(0, 6).map((c) => `${c.name} (${c.job ?? ''})`).join(', ')}
        </Labeled>
      )}
      {!!title.productionCompanies?.length && (
        <Labeled label="Production">{title.productionCompanies.join(', ')}</Labeled>
      )}

      {uniqueProviders.length > 0 && (
        <View style={{ gap: 6 }}>
          <Text style={st.lbl}>WHERE TO WATCH (US)</Text>
          <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
            {uniqueProviders.map((p, i) => (
              p.logo_path ? (
                <Image key={i} source={{ uri: `https://image.tmdb.org/t/p/w92${p.logo_path}` }} style={{ width: 34, height: 34, borderRadius: 7 }} />
              ) : null
            ))}
          </View>
        </View>
      )}
    </Panel>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', gap: 3 }}>
      <Text style={{ color: colors.gold, fontSize: 16, fontWeight: '700' }}>{value}</Text>
      <Text style={{ color: colors.dim, fontSize: 10, fontWeight: '600', letterSpacing: 1 }}>{label.toUpperCase()}</Text>
    </View>
  );
}

function Labeled({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={{ gap: 4 }}>
      <Text style={st.lbl}>{label.toUpperCase()}</Text>
      <Text style={{ color: colors.muted, fontSize: 13 }}>{children}</Text>
    </View>
  );
}

function Link({ label, url }: { label: string; url: string }) {
  return (
    <Pressable onPress={() => Linking.openURL(url)}>
      <Text style={{ color: colors.gold, fontSize: 13, fontWeight: '700' }}>{label} ↗</Text>
    </Pressable>
  );
}

const st = StyleSheet.create({
  stats: { flexDirection: 'row', backgroundColor: colors.panel2, borderRadius: 10, paddingVertical: 10 },
  div: { width: 1, backgroundColor: colors.border },
  lbl: { color: colors.gold, fontSize: 10, fontWeight: '800', letterSpacing: 1 },
});
