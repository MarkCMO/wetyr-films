import { useEffect, useState } from 'react';
import { ScrollView, View, Text, Pressable, Linking, ActivityIndicator } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { colors } from '@/constants/theme';
import { getDetail } from '@/lib/services';
import { errMessage } from '@/lib/api';
import { year } from '@/lib/format';
import { Panel, Poster, ErrorView, Tags } from '@/components/ui';
import { TitleCard } from '@/components/TitleCard';
import type { TitleDetail, PersonDetail, PersonCredit } from '@/lib/types';

export default function TitleDetailScreen() {
  const { id, type } = useLocalSearchParams<{ id: string; type: string }>();
  const kind = (type === 'tv' ? 'tv' : type === 'person' ? 'person' : 'movie') as 'movie' | 'tv' | 'person';
  const [detail, setDetail] = useState<TitleDetail | PersonDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    setLoading(true); setError(null);
    try {
      const r = await getDetail(Number(id), kind);
      if (r.ok && r.detail) setDetail(r.detail);
      else setError('Could not load this title.');
    } catch (e) {
      setError(errMessage(e));
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, [id]);

  const isPerson = (detail as PersonDetail | null)?.person === true;

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Stack.Screen options={{ title: isPerson ? (detail as PersonDetail).name : 'Title' }} />
      {loading ? (
        <View style={{ paddingVertical: 60, alignItems: 'center' }}><ActivityIndicator color={colors.gold} /></View>
      ) : error ? (
        <ErrorView message={error} onRetry={load} />
      ) : isPerson ? (
        <PersonView p={detail as PersonDetail} />
      ) : detail ? (
        <TitleCard title={detail as TitleDetail} />
      ) : null}
    </ScrollView>
  );
}

function PersonView({ p }: { p: PersonDetail }) {
  return (
    <View style={{ gap: 16 }}>
      <Panel>
        <View style={{ flexDirection: 'row', gap: 14 }}>
          <Poster uri={p.profile} w={110} h={165} />
          <View style={{ flex: 1, gap: 8 }}>
            <Text style={{ color: colors.text, fontSize: 20, fontWeight: '800' }}>{p.name}</Text>
            {!!p.department && <Tags tags={[p.department]} color={colors.purple} />}
            {!!p.birthday && <Text style={{ color: colors.muted, fontSize: 13 }}>🎂 {p.birthday}</Text>}
            {!!p.placeOfBirth && <Text style={{ color: colors.muted, fontSize: 13 }}>📍 {p.placeOfBirth}</Text>}
            {!!p.imdbId && (
              <Pressable onPress={() => Linking.openURL(`https://www.imdb.com/name/${p.imdbId}/`)}>
                <Text style={{ color: colors.gold, fontSize: 13, fontWeight: '700' }}>IMDb ↗</Text>
              </Pressable>
            )}
          </View>
        </View>
        {!!p.biography && <Text style={{ color: colors.text, opacity: 0.9, marginTop: 12 }} numberOfLines={8}>{p.biography}</Text>}
      </Panel>

      {!!p.knownFor?.length && (
        <Panel title="Known for">
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={{ flexDirection: 'row', gap: 10 }}>
              {p.knownFor.map((c: PersonCredit) => (
                <Pressable key={`${c.mediaType}-${c.id}`} style={{ width: 96 }}
                  onPress={() => router.push(`/title/${c.id}?type=${c.mediaType === 'tv' ? 'tv' : 'movie'}`)}>
                  <Poster uri={c.poster} w={96} h={144} />
                  <Text style={{ color: colors.text, fontSize: 12, marginTop: 4 }} numberOfLines={2}>{c.title}</Text>
                  {!!c.character && <Text style={{ color: colors.dim, fontSize: 11 }} numberOfLines={1}>{c.character}</Text>}
                  {!!year(c.date) && <Text style={{ color: colors.dim, fontSize: 11 }}>{year(c.date)}</Text>}
                </Pressable>
              ))}
            </View>
          </ScrollView>
        </Panel>
      )}
    </View>
  );
}
