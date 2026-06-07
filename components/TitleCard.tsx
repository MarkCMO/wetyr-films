import React from 'react';
import { View, Text, Image, Pressable, Linking, StyleSheet } from 'react-native';
import { colors } from '@/constants/theme';
import { money, runtime, year } from '@/lib/format';
import { Panel, Poster, Rating, Tags } from './ui';
import type { TitleDetail } from '@/lib/types';

/// Full intel card for a movie or TV title (used by Titles tab + Search detail).
export function TitleCard({ title }: { title: TitleDetail }) {
  const isTV = title.mediaType === 'tv';
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
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <Rating value={title.voteAverage} count={title.voteCount} />
            {isTV
              ? (title.seasons != null && <Text style={{ color: colors.muted, fontSize: 12 }}>📺 {title.seasons} season{title.seasons === 1 ? '' : 's'}</Text>)
              : (!!runtime(title.runtime) && <Text style={{ color: colors.muted, fontSize: 12 }}>⏱ {runtime(title.runtime)}</Text>)}
          </View>
          {!!title.genres?.length && <Tags tags={title.genres.slice(0, 4)} />}
          <View style={{ flexDirection: 'row', gap: 14 }}>
            {!!title.imdbId && <Link label="IMDb" url={`https://www.imdb.com/title/${title.imdbId}/`} />}
            {!!trailer && <Link label="Trailer" url={`https://www.youtube.com/watch?v=${trailer.key}`} />}
          </View>
        </View>
      </View>

      <View style={st.stats}>
        {isTV ? (
          <>
            <Stat label="Seasons" value={title.seasons != null ? String(title.seasons) : '-'} />
            <View style={st.div} />
            <Stat label="Episodes" value={title.episodes != null ? String(title.episodes) : '-'} />
            <View style={st.div} />
            <Stat label="First aired" value={year(title.releaseDate) || '-'} />
          </>
        ) : (
          <>
            <Stat label="Budget" value={money(title.budget)} />
            <View style={st.div} />
            <Stat label="Revenue" value={money(title.revenue)} />
            <View style={st.div} />
            <Stat label="Released" value={year(title.releaseDate) || '-'} />
          </>
        )}
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
      {isTV && !!title.networks?.length && <Labeled label="Networks">{title.networks.join(', ')}</Labeled>}
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
