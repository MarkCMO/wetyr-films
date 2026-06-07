import { useMemo, useState } from 'react';
import { ScrollView, View, Text, TextInput, Pressable, Alert, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { useLocalSearchParams, router, Stack } from 'expo-router';
import { colors } from '@/constants/theme';
import { useRolodex } from '@/lib/rolodexStore';
import * as svc from '@/lib/services';
import { errMessage } from '@/lib/api';

export default function ContactEdit() {
  const { mode, kind, id } = useLocalSearchParams<{ mode: string; kind: string; id?: string }>();
  const rx = useRolodex();
  const isPerson = kind === 'person';
  const isEdit = mode === 'edit';
  const existing = useMemo(() => {
    if (!isEdit || !id) return null;
    return isPerson ? rx.personById(String(id)) : rx.companyById(String(id));
  }, [isEdit, id, isPerson]);

  const e = existing as any;
  const [name, setName] = useState(e?.name ?? '');
  const [title, setTitle] = useState(e?.title ?? '');
  const [dept, setDept] = useState(e?.dept ?? '');
  const [type, setType] = useState(e?.type ?? '');
  const [parent, setParent] = useState(e?.parent ?? '');
  const [hq, setHq] = useState(e?.hq ?? '');
  const [website, setWebsite] = useState(e?.website ?? '');
  const [email, setEmail] = useState(e?.emails?.[0]?.address ?? e?.email ?? '');
  const [phone, setPhone] = useState(e?.phone ?? e?.phones?.[0] ?? '');
  const [linkedin, setLinkedin] = useState(e?.linkedin ?? '');
  const [imdb, setImdb] = useState(e?.imdb ?? '');
  const [secCik, setSecCik] = useState(e?.sec_cik ? String(e.sec_cik) : '');
  const [tags, setTags] = useState((e?.tags ?? []).join(', '));
  const [productions, setProductions] = useState((e?.productions ?? []).join(', '));
  const [notes, setNotes] = useState(e?.notes ?? '');
  const [busy, setBusy] = useState(false);

  const list = (s: string) => s.split(',').map((x) => x.trim()).filter(Boolean);
  const put = (obj: Record<string, unknown>, k: string, v: string) => { if (v.trim()) obj[k] = v.trim(); };

  const save = async () => {
    if (!name.trim() || busy) return;
    setBusy(true);
    try {
      if (isPerson) {
        const payload: Record<string, unknown> = { name: name.trim() };
        put(payload, 'title', title); put(payload, 'dept', dept);
        put(payload, 'email', email); put(payload, 'phone', phone);
        put(payload, 'linkedin', linkedin); put(payload, 'imdb', imdb); put(payload, 'notes', notes);
        if (list(tags).length) payload.tags = list(tags);
        if (list(productions).length) payload.productions = list(productions);
        if (isEdit && e) await svc.updatePerson(e.id, payload); else await svc.addPerson(payload);
      } else {
        const payload: Record<string, unknown> = { name: name.trim() };
        put(payload, 'type', type); put(payload, 'parent', parent); put(payload, 'hq', hq);
        put(payload, 'website', website); put(payload, 'phone', phone);
        put(payload, 'imdb', imdb); put(payload, 'sec_cik', secCik); put(payload, 'notes', notes);
        if (email.trim()) payload.emails = [{ address: email.trim(), source: 'manual' }];
        if (list(tags).length) payload.tags = list(tags);
        if (list(productions).length) payload.productions = list(productions);
        if (isEdit && e) await svc.updateCompany(e.id, payload); else await svc.addCompany(payload);
      }
      await rx.load();
      router.back();
    } catch (err) {
      Alert.alert('Error', errMessage(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1, backgroundColor: colors.bg }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Stack.Screen options={{
        title: `${isEdit ? 'Edit' : 'Add'} ${isPerson ? 'contact' : 'company'}`,
        headerRight: () => (
          <Pressable onPress={save} disabled={busy || !name.trim()}>
            <Text style={{ color: colors.gold, fontWeight: '700', opacity: busy || !name.trim() ? 0.5 : 1 }}>{busy ? 'Saving' : 'Save'}</Text>
          </Pressable>
        ),
      }} />
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
        <Field label="Name" value={name} onChange={setName} />
        {isPerson ? (
          <>
            <Field label="Title" value={title} onChange={setTitle} />
            <Field label="Department" value={dept} onChange={setDept} />
            <Field label="Email" value={email} onChange={setEmail} keyboard="email-address" />
            <Field label="Phone" value={phone} onChange={setPhone} keyboard="phone-pad" />
            <Field label="LinkedIn URL" value={linkedin} onChange={setLinkedin} keyboard="url" />
            <Field label="IMDb name id (nm...)" value={imdb} onChange={setImdb} />
          </>
        ) : (
          <>
            <Field label="Type (studio, prodco, agency...)" value={type} onChange={setType} />
            <Field label="Parent" value={parent} onChange={setParent} />
            <Field label="HQ / location" value={hq} onChange={setHq} />
            <Field label="Website" value={website} onChange={setWebsite} keyboard="url" />
            <Field label="Email" value={email} onChange={setEmail} keyboard="email-address" />
            <Field label="Phone" value={phone} onChange={setPhone} keyboard="phone-pad" />
            <Field label="IMDb company id (co...)" value={imdb} onChange={setImdb} />
            <Field label="SEC CIK" value={secCik} onChange={setSecCik} keyboard="number-pad" />
          </>
        )}
        <Field label="Productions (comma separated)" value={productions} onChange={setProductions} />
        <Field label="Tags (comma separated)" value={tags} onChange={setTags} />
        <Field label="Notes" value={notes} onChange={setNotes} multiline />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({ label, value, onChange, keyboard, multiline }: {
  label: string; value: string; onChange: (v: string) => void;
  keyboard?: 'default' | 'email-address' | 'phone-pad' | 'url' | 'number-pad'; multiline?: boolean;
}) {
  const noCaps = keyboard === 'email-address' || keyboard === 'url';
  return (
    <View style={{ gap: 4 }}>
      <Text style={{ color: colors.dim, fontSize: 12 }}>{label}</Text>
      <TextInput
        value={value} onChangeText={onChange}
        keyboardType={keyboard ?? 'default'}
        autoCapitalize={noCaps ? 'none' : 'sentences'}
        autoCorrect={!noCaps}
        multiline={multiline}
        placeholderTextColor={colors.dim}
        style={[s.input, multiline && { minHeight: 80, textAlignVertical: 'top' }]}
      />
    </View>
  );
}

const s = StyleSheet.create({
  input: { backgroundColor: colors.panel2, borderColor: colors.border, borderWidth: 1, borderRadius: 8, padding: 12, color: colors.text },
});
