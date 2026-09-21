import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import MapView, { Marker, Circle, Polygon, PROVIDER_DEFAULT } from 'react-native-maps';
import * as Location from 'expo-location';
import { useFocusEffect, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../api';
import { COLORS, CT_CENTER, areaColor, AREA_LABELS, raioOf, parsePoligono, fmtAreaM2 } from '../../theme';

const FILTERS = [
  { key: 'all', label: 'Todas' },
  { key: 'identificada', label: 'Déficit' },
  { key: 'em tratamento', label: 'Em trat.' },
  { key: 'reflorestada', label: 'Reflor.' },
];

export default function MapScreen({ navigation }) {
  const route = useRoute();
  const mapRef = useRef(null);
  const [areas, setAreas] = useState([]);
  const [denuncias, setDenuncias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const [userLoc, setUserLoc] = useState(null);

  const load = useCallback(async () => {
    try {
      const [a, d] = await Promise.all([api.get('/areas'), api.get('/denuncias')]);
      setAreas(a.data.areas ?? []);
      setDenuncias(d.data.denuncias ?? []);
    } catch {
      // mantém dados anteriores; mapa não trava sem rede
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  // Deep-link vindo da lista: { areaId }
  useEffect(() => {
    const id = route.params?.areaId;
    if (!id || areas.length === 0) return;
    const found = areas.find((a) => a.idArea === id);
    if (found?.latitude != null && found?.longitude != null) {
      setSelected({ kind: 'area', ref: found });
      mapRef.current?.animateToRegion(
        { latitude: found.latitude, longitude: found.longitude, latitudeDelta: 0.02, longitudeDelta: 0.02 },
        600,
      );
    }
    navigation.setParams({ areaId: undefined });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [route.params?.areaId, areas]);

  const locate = useCallback(async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;
      const pos = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const coords = { latitude: pos.coords.latitude, longitude: pos.coords.longitude };
      setUserLoc(coords);
      mapRef.current?.animateToRegion({ ...coords, latitudeDelta: 0.05, longitudeDelta: 0.05 }, 600);
    } catch {
      // sem localização: segue no centro padrão
    }
  }, []);

  const visible = useMemo(
    () => areas.filter((a) => (filter === 'all' ? true : a.statusArea === filter)),
    [areas, filter],
  );

  const mapped = useMemo(
    () => visible.filter((a) => a.latitude != null && a.longitude != null),
    [visible],
  );

  const denCount = useMemo(() => {
    const m = new Map();
    for (const d of denuncias) m.set(d.idArea, (m.get(d.idArea) ?? 0) + 1);
    return m;
  }, [denuncias]);

  const fitAll = () => {
    if (mapped.length === 0) return;
    mapRef.current?.fitToCoordinates(
      mapped.map((a) => ({ latitude: a.latitude, longitude: a.longitude })),
      { edgePadding: { top: 60, right: 60, bottom: 120, left: 60 }, animated: true },
    );
  };

  const selArea = selected?.kind === 'area' ? selected.ref : null;

  return (
    <View style={styles.root}>
      <View style={styles.mapWrap}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={{ ...CT_CENTER, latitudeDelta: 0.09, longitudeDelta: 0.09 }}
          showsUserLocation
          showsMyLocationButton={false}
        >
          {mapped.map((a) => {
            const color = areaColor(a.statusArea);
            const poly = parsePoligono(a.poligono);
            const raio = raioOf(a.statusArea, a.raio);
            const isSel = selArea?.idArea === a.idArea;
            return (
              <React.Fragment key={a.idArea}>
                {poly ? (
                  <Polygon
                    coordinates={poly}
                    strokeColor={color}
                    strokeWidth={isSel ? 3 : 2}
                    fillColor={`${color}55`}
                    onPress={() => setSelected({ kind: 'area', ref: a })}
                  />
                ) : (
                  <Circle
                    center={{ latitude: a.latitude, longitude: a.longitude }}
                    radius={raio}
                    strokeColor={color}
                    strokeWidth={isSel ? 3 : 2}
                    fillColor={`${color}44`}
                    lineDashPattern={[6, 4]}
                    onPress={() => setSelected({ kind: 'area', ref: a })}
                  />
                )}
                <Marker
                  coordinate={{ latitude: a.latitude, longitude: a.longitude }}
                  onPress={() => setSelected({ kind: 'area', ref: a })}
                >
                  <View style={[styles.pin, { backgroundColor: color, borderWidth: isSel ? 4 : 3 }]}>
                    <Ionicons name="leaf" size={12} color="#fff" />
                  </View>
                </Marker>
              </React.Fragment>
            );
          })}
        </MapView>

        <View style={styles.topBar}>
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
        </View>

        <View style={styles.sideBtns}>
          <TouchableOpacity style={styles.sideBtn} onPress={locate}>
            <Ionicons name="locate" size={20} color={COLORS.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.sideBtn} onPress={fitAll}>
            <Ionicons name="expand" size={20} color={COLORS.primary} />
          </TouchableOpacity>
        </View>

        <View style={styles.legend}>
          <LegendDot color={areaColor('identificada')} label="Déficit" />
          <LegendDot color={areaColor('em tratamento')} label="Em trat." />
          <LegendDot color={areaColor('reflorestada')} label="Reflor." />
          <Text style={styles.legendCount}>{mapped.length} demarcadas</Text>
        </View>

        {loading && (
          <View style={styles.loadingPill}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>Carregando áreas...</Text>
          </View>
        )}
      </View>

      {selArea ? (
        <View style={styles.sheet}>
          <View style={[styles.sheetDot, { backgroundColor: areaColor(selArea.statusArea) }]} />
          <View style={{ flex: 1 }}>
            <Text style={styles.sheetTitle} numberOfLines={1}>{selArea.rua}</Text>
            <Text style={styles.sheetSub} numberOfLines={1}>
              {AREA_LABELS[selArea.statusArea] ?? selArea.statusArea} ·{' '}
              {selArea.poligono ? 'polígono' : fmtAreaM2(raioOf(selArea.statusArea, selArea.raio))} ·{' '}
              {denCount.get(selArea.idArea) ?? 0} denúncias
            </Text>
          </View>
          <TouchableOpacity
            style={styles.sheetBtn}
            onPress={() => navigation.navigate('Denuncias', { areaId: selArea.idArea })}
          >
            <Text style={styles.sheetBtnText}>Denunciar</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setSelected(null)} hitSlop={12}>
            <Ionicons name="close" size={20} color={COLORS.muted} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.hint}>
          <Ionicons name="hand-left-outline" size={16} color={COLORS.muted} />
          <Text style={styles.hintText}>Toque numa área demarcada para ver detalhes</Text>
        </View>
      )}
    </View>
  );
}

function LegendDot({ color, label }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg },
  mapWrap: { flex: 1, position: 'relative' },
  map: { flex: 1 },
  topBar: { position: 'absolute', top: 54, left: 12, right: 12 },
  chips: { flexDirection: 'row', gap: 6 },
  chip: {
    backgroundColor: 'rgba(255,255,255,.95)', borderRadius: 18,
    paddingHorizontal: 12, paddingVertical: 7,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, elevation: 3,
  },
  chipActive: { backgroundColor: COLORS.primary },
  chipText: { fontSize: 12, fontWeight: '700', color: COLORS.muted },
  chipTextActive: { color: '#fff' },
  sideBtns: { position: 'absolute', right: 12, top: 110, gap: 8 },
  sideBtn: {
    width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 5, elevation: 4,
  },
  legend: {
    position: 'absolute', left: 12, bottom: 12, flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: 'rgba(255,255,255,.95)', borderRadius: 12, paddingHorizontal: 12, paddingVertical: 9,
    shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 4, elevation: 3,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
  legendText: { fontSize: 11, fontWeight: '600', color: COLORS.text },
  legendCount: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  loadingPill: {
    position: 'absolute', top: 110, alignSelf: 'center',
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: '#fff', borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, elevation: 3,
  },
  loadingText: { fontSize: 12, color: COLORS.muted, fontWeight: '600' },
  pin: {
    width: 26, height: 26, borderRadius: 13, borderColor: '#fff',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 3, elevation: 4,
  },
  sheet: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: '#fff', padding: 14, paddingHorizontal: 16,
    borderTopLeftRadius: 18, borderTopRightRadius: 18,
    shadowColor: '#000', shadowOpacity: 0.12, shadowRadius: 8, elevation: 8,
  },
  sheetDot: { width: 12, height: 12, borderRadius: 6 },
  sheetTitle: { fontSize: 15, fontWeight: 'bold', color: COLORS.text },
  sheetSub: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  sheetBtn: { backgroundColor: COLORS.primary, borderRadius: 10, paddingHorizontal: 14, paddingVertical: 10 },
  sheetBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  hint: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    backgroundColor: '#fff', padding: 12,
  },
  hintText: { fontSize: 13, color: COLORS.muted },
});
