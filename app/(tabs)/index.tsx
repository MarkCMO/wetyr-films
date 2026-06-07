import { useEffect, useMemo, useRef, useState } from 'react';
import { ScrollView, View, Text, Pressable, ScrollView as HScroll, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/theme';
import { useIntel } from '@/lib/intelStore';
import { SectionHeader, LivePill, Poster, Loading, ErrorView, Empty } from '@/components/ui';
import { TitleCard } from '@/components/TitleCard';
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
