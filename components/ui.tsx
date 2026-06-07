import React from 'react';
import { View, Text, ActivityIndicator, Image, Pressable, StyleSheet } from 'react-native';
import { colors, radius } from '@/constants/theme';

export function Panel({ title, tag, children }: { title?: string; tag?: string; children: React.ReactNode }) {
  return (
    <View style={s.panel}>
      {(title || tag) && (
        <View style={s.panelHead}>
          {!!title && <Text style={s.panelTitle}>{title}</Text>}
          {!!tag && <Text style={s.panelTag}>{tag}</Text>}
        </View>
      )}
      {children}
    </View>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return <Text style={s.eyebrow}>{String(children).toUpperCase()}</Text>;
}

export function SectionHeader({ eyebrow, title, subtitle, right }: {
  eyebrow: string; title: string; subtitle?: string | null; right?: React.ReactNode;
}) {
  return (
    <View style={{ gap: 6, marginBottom: 4 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Eyebrow>{eyebrow}</Eyebrow>
        {right}
      </View>
      <Text style={s.h1}>{title}</Text>
      {!!subtitle && <Text style={s.sub}>{subtitle}</Text>}
    </View>
  );
}

export function Pill({ text, color = colors.gold }: { text: string; color?: string }) {
  return (
    <View style={[s.pill, { backgroundColor: color + '22' }]}>
      <Text style={[s.pillText, { color }]} numberOfLines={1}>{text}</Text>
    </View>
  );
}

export function LivePill({ label = 'LIVE' }: { label?: string }) {
  return (
    <View style={s.livePill}>
      <View style={s.liveDot} />
      <Text style={s.liveText}>{label}</Text>
    </View>
  );
}

export function Poster({ uri, w = 92, h = 138, rad = 8 }: { uri?: string | null; w?: number; h?: number; rad?: number }) {
  if (!uri) {
    return (
      <View style={[s.posterPh, { width: w, height: h, borderRadius: rad }]}>
        <Text style={{ color: colors.dim, fontSize: 18 }}>film</Text>
      </View>
    );
  }
  return <Image source={{ uri }} style={{ width: w, height: h, borderRadius: rad, backgroundColor: colors.panel2 }} />;
}

export function Rating({ value, count }: { value?: number; count?: number }) {
  if (!value || value <= 0) return null;
  return (
    <Text style={{ color: colors.text, fontSize: 13, fontWeight: '600' }}>
      <Text style={{ color: colors.gold }}>★ </Text>
      {value.toFixed(1)}
      {!!count && count > 0 && <Text style={{ color: colors.dim }}>  ({count})</Text>}
    </Text>
  );
}

export function Loading({ text }: { text: string }) {
  return (
    <View style={s.center}>
      <ActivityIndicator color={colors.gold} />
      <Text style={s.centerText}>{text}</Text>
    </View>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <View style={s.center}>
      <Text style={s.centerText}>{text}</Text>
    </View>
  );
}

export function ErrorView({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={s.error}>
      <Text style={{ color: colors.muted, flex: 1 }}>{message}</Text>
      {onRetry && (
        <Pressable onPress={onRetry}><Text style={{ color: colors.gold, fontWeight: '700' }}>Retry</Text></Pressable>
      )}
    </View>
  );
}

export function FreshnessBadge({ freshness }: { freshness?: number }) {
  if (typeof freshness !== 'number') return null;
  let color = colors.red, label = 'STALE';
  if (freshness >= 130) { color = '#10B981'; label = 'CURRENT'; }
  else if (freshness >= 90) { color = '#22C55E'; label = 'LIKELY'; }
  else if (freshness >= 60) { color = colors.amber; label = 'AGING'; }
  else if (freshness >= 30) { color = colors.orange; label = 'OLD'; }
  return (
    <View style={[s.freshBadge, { borderColor: color }]}>
      <Text style={{ color, fontSize: 9, fontWeight: '800', letterSpacing: 0.5 }}>{label}</Text>
    </View>
  );
}

export function Tags({ tags, color = colors.gold }: { tags: string[]; color?: string }) {
  if (!tags?.length) return null;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
      {tags.map((t, i) => <Pill key={t + i} text={t} color={color} />)}
    </View>
  );
}

const s = StyleSheet.create({
  panel: { backgroundColor: colors.panel, borderColor: colors.border, borderWidth: 1, borderRadius: radius.lg, padding: 16, gap: 12 },
  panelHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomColor: colors.border, borderBottomWidth: 1, paddingBottom: 10 },
  panelTitle: { color: colors.text, fontWeight: '700', fontSize: 15 },
  panelTag: { color: colors.dim, fontSize: 11, letterSpacing: 1, fontWeight: '600' },
  eyebrow: { color: colors.gold, fontSize: 12, fontWeight: '800', letterSpacing: 2 },
  h1: { color: colors.text, fontSize: 24, fontWeight: '800' },
  sub: { color: colors.muted, fontSize: 14 },
  pill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  pillText: { fontSize: 11, fontWeight: '700' },
  livePill: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.green + '22', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  liveDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.green },
  liveText: { color: colors.green, fontSize: 12, fontWeight: '700' },
  posterPh: { backgroundColor: colors.panel2, alignItems: 'center', justifyContent: 'center', borderColor: colors.border, borderWidth: 1 },
  center: { alignItems: 'center', justifyContent: 'center', paddingVertical: 40, gap: 10 },
  centerText: { color: colors.muted, fontSize: 14, textAlign: 'center' },
  error: { flexDirection: 'row', gap: 10, backgroundColor: colors.red + '1A', borderColor: colors.red + '66', borderWidth: 1, borderRadius: 10, padding: 12 },
  freshBadge: { borderWidth: 1, borderRadius: 3, paddingHorizontal: 5, paddingVertical: 1 },
});
