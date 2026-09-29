import React, { useCallback, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, RefreshControl, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';
import { AppHeader, LoadingView, ErrorView } from '../../components/ui';
import { COLORS } from '../../theme';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      const [areas, denuncias, ongs, projetos] = await Promise.all([
        api.get('/areas'),
        api.get('/denuncias'),
        api.get('/ongs'),
        api.get('/projetos'),
      ]);
      const areaList = areas.data.areas ?? [];
      const denList = denuncias.data.denuncias ?? [];
      setData({
        areas: areaList.length,
        deficit: areaList.filter((a) => a.statusArea !== 'reflorestada').length,
        abertas: denList.filter((d) => d.statusDenuncia !== 'resolvido').length,
        ongs: (ongs.data.ongs ?? []).length,
        projetos: (projetos.data.projetos ?? []).length,
        recentes: denList.slice(0, 3),
      });
    } catch (e) {
      setError(e.response?.data?.error || 'Sem conexão com o servidor. Verifique o EXPO_PUBLIC_API_URL.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const firstName = user?.nome?.split(' ')[0] ?? '';

  if (loading) {
    return (
      <View style={styles.root}>
        <AppHeader title="+Verde" subtitle="Cidade Tiradentes" />
        <LoadingView label="Buscando dados..." />
      </View>
    );
  }

  if (error && !data) {
    return (
      <View style={styles.root}>
        <AppHeader title="+Verde" subtitle="Cidade Tiradentes" />
        <ErrorView message={error} onRetry={() => { setLoading(true); load(); }} />
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <AppHeader title={firstName ? `Olá, ${firstName}` : '+Verde'} subtitle="Cidade Tiradentes · zona leste" />
      <ScrollView
        contentContainerStyle={styles.body}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[COLORS.primary]} />}
      >
        <TouchableOpacity style={styles.cta} onPress={() => navigation.navigate('Denuncias')} activeOpacity={0.9}>
          <Ionicons name="alert-circle" size={26} color="#fff" />
          <View style={{ flex: 1 }}>
            <Text style={styles.ctaTitle}>Viu uma área sem árvores?</Text>
            <Text style={styles.ctaSub}>Denuncie em menos de 1 minuto</Text>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>

        <View style={styles.stats}>
          <StatCard value={data?.areas ?? 0} label="Áreas" icon="leaf" onPress={() => navigation.navigate('Areas')} />
          <StatCard value={data?.abertas ?? 0} label="Abertas" icon="alert-circle" onPress={() => navigation.navigate('Denuncias')} />
          <StatCard value={data?.ongs ?? 0} label="ONGs" icon="people" onPress={() => navigation.navigate('ONGs')} />
          <StatCard value={data?.projetos ?? 0} label="Projetos" icon="folder-open" onPress={() => navigation.navigate('Projetos')} />
        </View>

        {(data?.deficit ?? 0) > 0 && (
          <TouchableOpacity style={styles.alert} onPress={() => navigation.navigate('Mapa')} activeOpacity={0.9}>
            <Ionicons name="warning" size={20} color={COLORS.error} />
            <Text style={styles.alertText}>{data.deficit} áreas precisam de arborização. Ver no mapa.</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.mapCard} onPress={() => navigation.navigate('Mapa')} activeOpacity={0.9}>
          <Ionicons name="map" size={22} color={COLORS.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.mapTitle}>Mapa de áreas demarcadas</Text>
            <Text style={styles.mapSub}>Círculos e polígonos por status</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={COLORS.faint} />
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Denúncias recentes</Text>
        {(data?.recentes ?? []).length === 0 ? (
          <Text style={styles.empty}>Nenhuma denúncia ainda</Text>
        ) : (
          data.recentes.map((d) => (
            <View key={d.idDenuncia} style={styles.row}>
              <View style={[styles.dot, { backgroundColor: d.statusDenuncia === 'resolvido' ? COLORS.success : COLORS.error }]} />
              <View style={{ flex: 1 }}>
                <Text style={styles.rowTitle} numberOfLines={1}>{d.titulo}</Text>
                <Text style={styles.rowSub} numberOfLines={1}>
                  {d.area?.rua || d.area?.bairro || 'Cidade Tiradentes'} · {d.dataDenuncia}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function StatCard({ value, label, icon, onPress }) {
  return (
    <TouchableOpacity style={styles.stat} onPress={onPress} activeOpacity={0.85}>
      <Ionicons name={icon} size={18} color={COLORS.primary} />
      <Text style={styles.statNumber}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  body: { padding: 16, paddingBottom: 32 },
  cta: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: COLORS.primary, borderRadius: 16, padding: 18,
  },
  ctaTitle: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  ctaSub: { color: '#D8F3DC', fontSize: 13, marginTop: 2 },
  stats: { flexDirection: 'row', gap: 10, marginTop: 14 },
  stat: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14,
    paddingVertical: 14, alignItems: 'center', gap: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
  },
  statNumber: { fontSize: 22, fontWeight: 'bold', color: COLORS.text },
  statLabel: { fontSize: 11, color: COLORS.muted },
  alert: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#FDECEA', borderRadius: 12, padding: 14, marginTop: 14,
  },
  alertText: { flex: 1, color: COLORS.error, fontSize: 14, fontWeight: '600' },
  mapCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 14, padding: 16, marginTop: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3, elevation: 2,
  },
  mapTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.text },
  mapSub: { fontSize: 13, color: COLORS.muted, marginTop: 1 },
  sectionTitle: { fontSize: 17, fontWeight: 'bold', color: COLORS.text, marginTop: 20, marginBottom: 8 },
  row: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8,
  },
  dot: { width: 10, height: 10, borderRadius: 5 },
  rowTitle: { fontSize: 14, fontWeight: '600', color: COLORS.text },
  rowSub: { fontSize: 12, color: COLORS.muted, marginTop: 1 },
  empty: { color: COLORS.faint, textAlign: 'center', padding: 20 },
});
