import { useState } from 'react';
import { ScrollView, View, Text, Pressable, Linking, Alert, ActivityIndicator, StyleSheet } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { colors } from '@/constants/theme';
import { useRolodex, emailList, personSubtitle, allPhones } from '@/lib/rolodexStore';
import * as svc from '@/lib/services';
import { errMessage } from '@/lib/api';
import { Panel, FreshnessBadge, Tags } from '@/components/ui';

export default function ContactDetail() {
  const { id, kind } = useLocalSearchParams<{ id: string; kind: string }>();
  const rx = useRolodex();
  const isPerson = kind === 'person';
  const person = isPerson ? rx.personById(String(id)) : undefined;
  const company = !isPerson ? rx.companyById(String(id)) : undefined;
  const [busy, setBusy] = useState(false);

  const name = person?.name ?? company?.name ?? 'Contact';
  const subtitle = person ? personSubtitle(person)
    : [company?.type, company?.parent].filter(Boolean).join('  ·  ');
  const tags = person?.tags ?? company?.tags ?? [];

  const open = (url: string) => Linking.openURL(url).catch(() => {});
  const tel = (p: string) => `tel:${p.replace(/[^\d+]/g, '')}`;

  const runAction = async (label: string, fn: () => Promise<any>) => {
    setBusy(true);
    const msg = await rx.runAction(label, async () => {
      const r = await fn();
      return r?.ok === false ? (r.error || 'No change.') : 'Done. Pull to refresh the list.';
    });
    setBusy(false);
    Alert.alert('Result', msg);
    await rx.load();
  };

  const confirmDelete = () => {
    Alert.alert('Delete?', 'This permanently removes the record.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete', style: 'destructive', onPress: async () => {
          setBusy(true);
          try {
            if (person) await svc.deletePerson(person.id);
            else if (company) await svc.deleteCompany(company.id);
            await rx.load();
            router.back();
          } catch (e) { Alert.alert('Error', errMessage(e)); }
          finally { setBusy(false); }
        },
      },
    ]);
  };

  if (!person && !company) {
    return <View style={{ flex: 1, backgroundColor: colors.bg, padding: 16 }}><Text style={{ color: colors.muted }}>Record not found. Go back and reload.</Text></View>;
  }

  return (
    <ScrollView style={{ backgroundColor: colors.bg }} contentContainerStyle={{ padding: 16, gap: 16 }}>
      <Stack.Screen options={{
        title: name,
        headerRight: () => (
          <Pressable onPress={() => router.push(`/contact/edit?mode=edit&kind=${kind}&id=${id}`)}>
            <Text style={{ color: colors.gold, fontWeight: '700' }}>Edit</Text>
          </Pressable>
        ),
      }} />

      <View style={{ gap: 6 }}>
        <Text style={{ color: colors.text, fontSize: 22, fontWeight: '800' }}>{name}</Text>
        {!!subtitle && <Text style={{ color: colors.gold }}>{subtitle}</Text>}
        {!!tags.length && <Tags tags={tags} />}
      </View>

      {person && (
        <Panel title="Contact info">
          {emailList(person).length === 0 ? (
            <Text style={{ color: colors.dim }}>✉ no email on file</Text>
          ) : emailList(person).map((e, i) => (
            <Pressable key={i} onPress={() => open(`mailto:${e.address}`)} style={st.row}>
              <Text style={{ color: e._archivedAt ? colors.dim : colors.blue, flexShrink: 1 }}>✉ {e.address}</Text>
              {e._isPrimary && <Text style={{ color: colors.gold }}>★</Text>}
              <FreshnessBadge freshness={e._freshness} />
            </Pressable>
          ))}
          {!!person.phone && <Pressable onPress={() => open(tel(person.phone!))}><Text style={st.link}>☎ {person.phone}</Text></Pressable>}
          {!!person.linkedin && <Pressable onPress={() => open(person.linkedin!)}><Text style={st.link}>🔗 LinkedIn</Text></Pressable>}
          {!!person.imdb && <Pressable onPress={() => open(`https://www.imdb.com/name/${person.imdb}/`)}><Text style={st.link}>🎬 IMDb profile</Text></Pressable>}
        </Panel>
      )}

      {company && (
        <Panel title="Company info">
          {!!company.hq && <Text style={{ color: colors.text }}>📍 {company.hq}</Text>}
          {!!company.website && <Pressable onPress={() => open(company.website!)}><Text style={st.link}>🌐 {company.website.replace(/^https?:\/\//, '')}</Text></Pressable>}
          {allPhones(company).map((p, i) => <Pressable key={i} onPress={() => open(tel(p))}><Text style={st.link}>☎ {p}</Text></Pressable>)}
          {(company.emails ?? []).map((e, i) => <Pressable key={i} onPress={() => open(`mailto:${e.address}`)}><Text style={st.link}>✉ {e.address}</Text></Pressable>)}
          {!!company.imdb && <Pressable onPress={() => open(`https://www.imdb.com/company/${company.imdb}/`)}><Text style={st.link}>🎬 IMDb: {company.imdb}</Text></Pressable>}
          {!!company.sec_cik && <Pressable onPress={() => open(`https://www.sec.gov/cgi-bin/browse-edgar?action=getcompany&CIK=${company.sec_cik}`)}><Text style={st.link}>📑 SEC CIK: {String(company.sec_cik)}</Text></Pressable>}
        </Panel>
      )}

      {!!(person?.productions ?? company?.productions)?.length && (
        <Panel title="Productions">
          <Text style={{ color: colors.muted }}>{(person?.productions ?? company?.productions)!.slice(0, 12).join('  ·  ')}</Text>
        </Panel>
      )}
      {!!(person?.notes ?? company?.notes) && (
        <Panel title="Notes"><Text style={{ color: colors.muted }}>{person?.notes ?? company?.notes}</Text></Panel>
      )}

      <View style={{ gap: 10 }}>
        {person && <ActionBtn label="Find email" onPress={() => runAction('Finding email', () => svc.enrichPerson(person.id))} disabled={busy} />}
        {person && <ActionBtn label="Find newest email" onPress={() => runAction('Finding newest', () => svc.findNewestEmail(person.id))} disabled={busy} />}
        {company && <ActionBtn label="Find emails" onPress={() => runAction('Finding emails', () => svc.enrichCompany(company.id))} disabled={busy} />}
        <Pressable onPress={confirmDelete} disabled={busy} style={st.delete}><Text style={{ color: colors.red, fontWeight: '700' }}>Delete</Text></Pressable>
      </View>
    </ScrollView>
  );
}

function ActionBtn({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={st.action}>
      <Text style={{ color: colors.gold, fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
}

const st = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  link: { color: colors.blue, fontSize: 14, paddingVertical: 2 },
  action: { backgroundColor: colors.panel, borderColor: colors.gold + '88', borderWidth: 1, borderRadius: 8, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
  delete: { backgroundColor: colors.red + '1A', borderColor: colors.red + '66', borderWidth: 1, borderRadius: 8, minHeight: 44, alignItems: 'center', justifyContent: 'center' },
});
