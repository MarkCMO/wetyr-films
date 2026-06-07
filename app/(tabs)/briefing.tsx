import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, RefreshControl, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/theme';
import { getNews } from '@/lib/services';
import { errMessage } from '@/lib/api';
import { timeAgo } from '@/lib/format';
import { Panel, SectionHeader, LivePill, Pill, Loading, ErrorView } from '@/components/ui';
import { FESTIVALS, festDay, festMonth, festDaysLeft } from '@/data/festivals';
import type { NewsItem } from '@/lib/types';

export default function BriefingScreen() {
  const insets = useSafeAreaInsets();
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadNews = async () => {
    setLoading(true); setError(null);
    try {
      const r = await getNews();
      setNews(r.items ?? []);
      if (!(r.items ?? []).length) setError('No headlines from the public trades right now.');
    } catch (e) {
      setError(errMessage(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadNews(); }, []);

  const festivals = [...FESTIVALS].sort((a, b) => Date.parse(a.date) - Date.parse(b.date));

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, gap: 18, paddingBottom: insets.bottom + 24 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadNews} tintColor={colors.gold} />}
    >
      <SectionHeader eyebrow="Daily Briefing" title="Industry news and deadlines" right={<LivePill />} />

      <Panel title="Industry News, Live Feed" tag={news.length ? 'LIVE' : loading ? 'LOADING' : ''}>
        {loading && news.length === 0 ? (
          <Loading text="Pulling the trades..." />
        ) : error && news.length === 0 ? (
          <ErrorView message={error} onRetry={loadNews} />
        ) : (
          news.slice(0, 40).map((n, i) => (
            <Pressable
              key={n.link + i}
              onPress={() => Linking.openURL(n.link)}
              style={{ paddingVertical: 8, borderBottomWidth: i < Math.min(40, news.length) - 1 ? 1 : 0, borderBottomColor: colors.border, gap: 4 }}
            >
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                {!!n.src && <Text style={{ color: colors.gold, fontSize: 11, fontWeight: '800', letterSpacing: 1 }}>{n.src.toUpperCase()}</Text>}
                {!!timeAgo(n.date) && <Text style={{ color: colors.dim, fontSize: 11 }}>· {timeAgo(n.date)}</Text>}
              </View>
              <Text style={{ color: colors.text, fontWeight: '600' }}>{n.title}</Text>
            </Pressable>
          ))
        )}
      </Panel>

      <Panel title="Festival Deadlines" tag="ROLLING">
        {festivals.map((f, i) => {
          const days = festDaysLeft(f.date);
          return (
            <Pressable
              key={f.name}
              onPress={() => Linking.openURL(f.url ?? 'https://filmfreeway.com/festivals')}
              style={{ flexDirection: 'row', gap: 14, paddingVertical: 8, borderBottomWidth: i < festivals.length - 1 ? 1 : 0, borderBottomColor: colors.border }}
            >
              <View style={{ width: 56, alignItems: 'center', backgroundColor: colors.panel2, borderRadius: 8, paddingVertical: 6 }}>
                <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>{festDay(f.date)}</Text>
                <Text style={{ color: colors.gold, fontSize: 10, fontWeight: '600', letterSpacing: 1 }}>{festMonth(f.date).toUpperCase()}</Text>
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={{ color: colors.text, fontWeight: '700' }}>{f.name}</Text>
                {!!f.info && <Text style={{ color: colors.muted, fontSize: 12 }}>{f.info}</Text>}
                <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                  {f.tier === 'hot' ? <Pill text="Closing soon" color={colors.red} />
                    : f.tier === 'soon' ? <Pill text="Approaching" color={colors.amber} />
                    : <Pill text="Open" color={colors.green} />}
                  {days != null && days > 0 && <Text style={{ color: colors.dim, fontSize: 12, fontWeight: '600' }}>{days}d left</Text>}
                </View>
              </View>
            </Pressable>
          );
        })}
      </Panel>
    </ScrollView>
  );
}
