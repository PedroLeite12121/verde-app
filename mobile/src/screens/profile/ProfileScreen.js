import React, { useCallback, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, ScrollView, RefreshControl } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../api';
import { COLORS } from '../../theme';
import { API_BASE_URL } from '../../api';

export default function ProfileScreen() {
  const { user, tipo, signOut } = useAuth();
  const [counts, setCounts] = useState({ denuncias: 0, projetos: 0 });
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const [d, p] = await Promise.all([api.get('/denuncias'), api.get('/projetos')]);
      const mine = (d.data.denuncias ?? []).filter((x) => x.idUsuario === user?.idUsuario);
      setCounts({ denuncias: mine.length, projetos: (p.data.projetos ?? []).length });
    } catch {
      // perfil não trava sem rede
    } finally {
      setRefreshing(false);
    }
  }, [user?.idUsuario]);

  useFocusEffect(useCallback(() => { load(); }, [load]));

  const handleLogout = () => {
    Alert.alert('Sair', 'Deseja sair da conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);
  };

  const initials = (user?.nome ?? '?')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 32 }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} colors={[COLORS.primary]} />
      }
    >
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.name}>{user?.nome ?? 'Usuário'}</Text>
        <Text style={styles.email}>{user?.email ?? ''}</Text>
        <View style={styles.rolePill}>
          <Text style={styles.roleText}>{tipo === 'admin' ? 'Administrador' : 'Usuário'}</Text>
        </View>
      </View>

      <View style={styles.stats}>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{counts.denuncias}</Text>
          <Text style={styles.statLabel}>Denúncias</Text>
        </View>
        <View style={styles.stat}>
          <Text style={styles.statNumber}>{counts.projetos}</Text>
          <Text style={styles.statLabel}>Projetos</Text>
        </View>
      </View>

      <View style={styles.menu}>
        <MenuItem icon="server-outline" label={`Servidor: ${API_BASE_URL}`} />
        <MenuItem icon="leaf-outline" label="Cidade Tiradentes · São Paulo" />
        <TouchableOpacity style={styles.logout} onPress={handleLogout} activeOpacity={0.85}>
          <Ionicons name="log-out-outline" size={22} color={COLORS.error} />
          <Text style={styles.logoutText}>Sair da conta</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

function MenuItem({ icon, label }) {
  return (
    <View style={styles.menuItem}>
      <Ionicons name={icon} size={22} color={COLORS.primary} />
      <Text style={styles.menuText} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.bg },
  header: { alignItems: 'center', paddingTop: 70, paddingBottom: 28, backgroundColor: COLORS.primary },
  avatar: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: 'rgba(255,255,255,.22)',
    justifyContent: 'center', alignItems: 'center', marginBottom: 12,
  },
  avatarText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
  name: { fontSize: 20, fontWeight: 'bold', color: '#fff' },
  email: { fontSize: 14, color: '#D8F3DC', marginTop: 2 },
  rolePill: {
    marginTop: 10, backgroundColor: 'rgba(255,255,255,.22)',
    borderRadius: 16, paddingHorizontal: 14, paddingVertical: 6,
  },
  roleText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
  stats: { flexDirection: 'row', gap: 12, padding: 16 },
  stat: {
    flex: 1, backgroundColor: '#fff', borderRadius: 14, padding: 18,
    alignItems: 'center', elevation: 2,
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06, shadowRadius: 3,
  },
  statNumber: { fontSize: 26, fontWeight: 'bold', color: COLORS.primary },
  statLabel: { fontSize: 12, color: COLORS.muted, marginTop: 2 },
  menu: { paddingHorizontal: 16, gap: 8 },
  menuItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
  },
  menuText: { flex: 1, fontSize: 14, color: COLORS.text },
  logout: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 12, padding: 16, marginTop: 4,
  },
  logoutText: { fontSize: 16, color: COLORS.error, fontWeight: '600' },
});
