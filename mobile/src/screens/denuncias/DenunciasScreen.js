import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput,
  RefreshControl, Modal, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api';
import { AppHeader, LoadingView, ErrorView, EmptyView, StatusBadge } from '../../components/ui';
import { COLORS, DEN_LABELS, denColor } from '../../theme';

const FILTERS = [
  { key: 'all', label: 'Todas' },
  { key: 'aberta', label: 'Abertas' },
  { key: 'em tratamento', label: 'Em trat.' },
  { key: 'resolvido', label: 'Resolv.' },
];

const CATEGORIES = ['Local sem árvores', 'Corte irregular', 'Poda inadequada', 'Área degradada'];

export default function DenunciasScreen({ navigation }) {
  const route = useRoute();
  const [denuncias, setDenuncias] = useState([]);
  const [areas, setAreas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  const [modal, setModal] = useState(false);
  const [titulo, setTitulo] = useState(CATEGORIES[0]);
  const [descricao, setDescricao] = useState('');
  const [areaId, setAreaId] = useState(null);
  const [areaQuery, setAreaQuery] = useState('');
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [d, a] = await Promise.all([api.get('/denuncias'), api.get('/areas')]);
      setDenuncias(d.data.denuncias ?? []);
      setAreas(a.data.areas ?? []);
    } catch (err) {
      setError(err.response?.data?.error || 'Sem conexão com o servidor.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Deep-link do mapa: abre o formulário já com a área
  useEffect(() => {
    if (route.params?.areaId) {
      setAreaId(route.params.areaId);
      setModal(true);
      navigation.setParams({ areaId: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.areaId]);

  const list = useMemo(
    () => denuncias.filter((d) => (filter === 'all' ? true : d.statusDenuncia === filter)),
    [denuncias, filter],
  );

  const areaOptions = useMemo(() => {
    const q = areaQuery.trim().toLowerCase();
    return areas
      .filter((a) => !q || a.rua?.toLowerCase().includes(q) || a.bairro?.toLowerCase().includes(q))
      .slice(0, 20);
  }, [areas, areaQuery]);

  const submit = async () => {
    if (!areaId) {
      Alert.alert('Atenção', 'Escolha a área da denúncia na lista abaixo');
      return;
    }
    setSending(true);
    try {
      await api.post('/denuncias', {
        idArea: areaId,
        titulo,
        descricao: descricao.trim() || undefined,
      });
      setModal(false);
      setDescricao('');
      setAreaId(null);
      setAreaQuery('');
      Alert.alert('Enviada', 'Denúncia encaminhada às ONGs parceiras.');
      load();
    } catch (err) {
      Alert.alert('Erro', err.response?.data?.error || 'Não foi possível enviar.');
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle} numberOfLines={1}>{item.titulo}</Text>
        <StatusBadge color={denColor(item.statusDenuncia)} label={DEN_LABELS[item.statusDenuncia] ?? item.statusDenuncia} />
      </View>
      <Text style={styles.cardInfo} numberOfLines={1}>
        {item.area?.rua || item.area?.bairro || 'Cidade Tiradentes'}
      </Text>
      {item.descricao ? <Text style={styles.cardDesc} numberOfLines={2}>{item.descricao}</Text> : null}
      <Text style={styles.cardDate}>{item.dataDenuncia}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <AppHeader
        title="Denúncias"
        subtitle={`${denuncias.length} registros`}
        right={
          <TouchableOpacity style={styles.fab} onPress={() => setModal(true)}>
            <Ionicons name="add" size={24} color="#fff" />
          </TouchableOpacity>
        }
      />
      <View style={styles.chips}>
        {FILTERS.map((f) => (
          <TouchableOpacity
            key={f.key}
            style={[styles.chip, filter === f.key && styles.chipActive]}
            onPress={() => setFilter(f.key)}
          >
            <Text style={[styles.chipText, filter === f.key && styles.chipTextActive]}>{f.label}</Text>
          </TouchableOpacity>
        ))}
      </View>
      {loading ? (
        <LoadingView label="Buscando denúncias..." />
      ) : error && denuncias.length === 0 ? (
        <ErrorView message={error} onRetry={() => { setLoading(true); load(); }} />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(item) => String(item.idDenuncias)}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[COLORS.primary]} />
          }
          ListEmptyComponent={
            <EmptyView
              icon="alert-circle-outline" title="Nenhuma denúncia"
              hint="Toque no + para denunciar uma área."
              action={
                <TouchableOpacity style={styles.cta} onPress={() => setModal(true)}>
                  <Text style={styles.ctaText}>Nova denúncia</Text>
                </TouchableOpacity>
              }
            />
          }
        />
      )}

      <Modal visible={modal} animationType="slide" onRequestClose={() => setModal(false)}>
        <View style={styles.modalRoot}>
          <View style={styles.modalHead}>
            <Text style={styles.modalTitle}>Nova denúncia</Text>
            <TouchableOpacity onPress={() => setModal(false)} hitSlop={12}>
              <Ionicons name="close" size={24} color={COLORS.text} />
            </TouchableOpacity>
          </View>
          <ScrollView contentContainerStyle={styles.modalBody} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Tipo de ocorrência</Text>
            <View style={styles.catGrid}>
              {CATEGORIES.map((c) => (
                <TouchableOpacity
                  key={c}
                  style={[styles.cat, titulo === c && styles.catActive]}
                  onPress={() => setTitulo(c)}
                >
                  <Text style={[styles.catText, titulo === c && styles.catTextActive]}>{c}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Área *</Text>
            <TextInput
              style={styles.input}
              placeholder="Buscar rua ou bairro..."
              placeholderTextColor={COLORS.faint}
              value={areaQuery}
              onChangeText={setAreaQuery}
              autoCapitalize="none"
            />
            {areaOptions.map((a) => (
              <TouchableOpacity
                key={a.idArea}
                style={[styles.areaOpt, areaId === a.idArea && styles.areaOptActive]}
                onPress={() => setAreaId(a.idArea)}
              >
                <Ionicons
                  name={areaId === a.idArea ? 'checkmark-circle' : 'ellipse-outline'}
                  size={20}
                  color={areaId === a.idArea ? COLORS.primary : COLORS.faint}
                />
                <View style={{ flex: 1 }}>
                  <Text style={styles.areaOptTitle} numberOfLines={1}>{a.rua}</Text>
                  <Text style={styles.areaOptSub} numberOfLines={1}>{a.bairro} · {a.statusArea}</Text>
                </View>
              </TouchableOpacity>
            ))}

            <Text style={styles.label}>Descrição (opcional)</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Descreva a situação..."
              placeholderTextColor={COLORS.faint}
              value={descricao}
              onChangeText={setDescricao}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              style={[styles.send, sending && styles.sendDisabled]}
              onPress={submit}
              disabled={sending}
            >
              {sending
                ? <ActivityIndicator color="#fff" />
                : <Text style={styles.sendText}>Enviar denúncia</Text>}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  fab: {
    width: 44, height: 44, borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,.22)',
    alignItems: 'center', justifyContent: 'center',
  },
  chips: { flexDirection: 'row', gap: 8, padding: 12, paddingHorizontal: 16 },
  chip: { backgroundColor: '#E5E7EB', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8 },
  chipActive: { backgroundColor: COLORS.primary },
  chipText: { fontSize: 13, fontWeight: '600', color: COLORS.muted },
  chipTextActive: { color: '#fff' },
  list: { padding: 16, paddingTop: 4, paddingBottom: 32 },
  card: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 10,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  cardTitle: { fontSize: 16, fontWeight: 'bold', color: COLORS.text, flex: 1 },
  cardInfo: { color: COLORS.primary, marginTop: 6, fontSize: 14, fontWeight: '600' },
  cardDesc: { color: COLORS.muted, marginTop: 4, fontSize: 14 },
  cardDate: { color: COLORS.faint, marginTop: 8, fontSize: 12 },
  cta: { marginTop: 14, backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 20, paddingVertical: 12 },
  ctaText: { color: '#fff', fontWeight: 'bold' },
  modalRoot: { flex: 1, backgroundColor: COLORS.bg, paddingTop: 50 },
  modalHead: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingBottom: 12,
  },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  modalBody: { padding: 20, paddingBottom: 48 },
  label: { fontSize: 13, fontWeight: '700', color: COLORS.muted, marginBottom: 8, marginTop: 12 },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  cat: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 10, backgroundColor: '#fff',
  },
  catActive: { borderColor: COLORS.primary, backgroundColor: '#E3F2E9' },
  catText: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  catTextActive: { color: COLORS.primary },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#E5E7EB',
    borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12,
    fontSize: 15, color: COLORS.text,
  },
  textArea: { minHeight: 80, textAlignVertical: 'top' },
  areaOpt: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', borderRadius: 12, padding: 12, marginTop: 8,
    borderWidth: 1, borderColor: '#E5E7EB',
  },
  areaOptActive: { borderColor: COLORS.primary },
  areaOptTitle: { fontSize: 14, fontWeight: '700', color: COLORS.text },
  areaOptSub: { fontSize: 12, color: COLORS.muted },
  send: { backgroundColor: COLORS.primary, borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 20 },
  sendDisabled: { opacity: 0.7 },
  sendText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
