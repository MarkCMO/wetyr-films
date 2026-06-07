import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, RefreshControl, Linking } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '@/constants/theme';
import { getCasting } from '@/lib/services';
import { errMessage } from '@/lib/api';
import { timeAgo } from '@/lib/format';
import { SectionHeader, LivePill, Pill, Loading, ErrorView, Empty } from '@/components/ui';
import type { CastingCall } from '@/lib/types';

export default function CastingScreen() {
  const insets = useSafeAreaInsets();
  const [tab, setTab] = useState(0);
  const [scripted, setScripted] = useState<CastingCall[]>([]);
  const [commercial, setCommercial] = useState<CastingCall[]>([]);
  const [meta, setMeta] = useState<{ ok?: number; total?: number }>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadCasting = async () => {
    setLoading(true); setError(null);
    try {
      const r = await getCasting();
      setScripted(r.scripted ?? []);
      setCommercial(r.commercial ?? []);
      setMeta({ ok: r.sourcesOk, total: r.sourceCount });
    } catch (e) {
      setError(errMessage(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { loadCasting(); }, []);

  const current = tab === 0 ? scripted : commercial;

  return (
    <ScrollView
      style={{ backgroundColor: colors.bg }}
      contentContainerStyle={{ padding: 16, gap: 16, paddingBottom: insets.bottom + 24 }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={loadCasting} tintColor={colors.gold} />}
    >
      <SectionHeader
        eyebrow="Casting"
        title="Open casting calls"
        subtitle={meta.ok != null ? `${meta.ok}/${meta.total} public sources OK` : null}
        right={<LivePill />}
      />

      <View style={{ flexDirection: 'row', backgroundColor: colors.panel2, borderRadius: 8, padding: 3 }}>
        {[`Scripted (${scripted.length})`, `Commercial (${commercial.length})`].map((label, i) => (
          <Pressable
            key={i}
            onPress={() => setTab(i)}
            style={{ flex: 1, paddingVertical: 8, borderRadius: 6, backgroundColor: tab === i ? colors.panel : 'transparent', alignItems: 'center' }}
          >
            <Text style={{ color: tab === i ? colors.gold : colors.muted, fontWeight: '700', fontSize: 13 }}>{label}</Text>
          </Pressable>
        ))}
      </View>

      {loading && current.length === 0 ? (
        <Loading text="Aggregating public casting feeds..." />
      ) : error && current.length === 0 ? (
        <ErrorView message={error} onRetry={loadCasting} />
      ) : current.length === 0 ? (
        <Empty text="No new roles hit the public feeds in the last day. The full WETYR Casting Aggregator ships 200 to 400 fresh roles per day." />
      ) : (
        current.map((c) => <Card key={c.link} c={c} />)
      )}
    </ScrollView>
  );
}

function Card({ c }: { c: CastingCall }) {
  let summary = (c.summary ?? '').replace(/\s+/g, ' ').trim();
  if (summary.length < 25 || /^https?:\/\//i.test(summary)) summary = '';
  if (summary.length > 200) summary = summary.slice(0, 200) + '...';
  return (
    <Pressable
      onPress={() => Linking.openURL(c.link)}
      style={{ backgroundColor: colors.panel, borderColor: colors.border, borderWidth: 1, borderRadius: 14, padding: 14, gap: 8 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        <Text style={{ color: colors.gold, fontSize: 11, fontWeight: '800', letterSpacing: 1 }}>{(c.source ?? 'Casting').toUpperCase()}</Text>
        {!!timeAgo(c.date) && <Text style={{ color: colors.dim, fontSize: 11 }}>· {timeAgo(c.date)}</Text>}
        <View style={{ flex: 1 }} />
        <Text style={{ color: colors.dim }}>↗</Text>
      </View>
      <Text style={{ color: colors.text, fontWeight: '600' }}>{c.title}</Text>
      {!!summary && <Text style={{ color: colors.muted, fontSize: 12 }} numberOfLines={3}>{summary}</Text>}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
        {c.union && <Pill text="SAG-AFTRA" color={colors.purple} />}
        {!!c.location && <Pill text={c.location} color={colors.blue} />}
        {!!c.role && <Pill text={c.role[0].toUpperCase() + c.role.slice(1)} />}
        {!!c.rate && <Pill text={c.rate} color={colors.green} />}
      </View>
    </Pressable>
  );
}
