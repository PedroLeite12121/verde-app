import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS } from '../theme';

export function AppHeader({ title, subtitle, right }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) + 12 }]}>
      <View style={{ flex: 1 }}>
        {subtitle ? <Text style={styles.eyebrow}>{subtitle}</Text> : null}
        <Text style={styles.title}>{title}</Text>
      </View>
      {right}
    </View>
  );
}

export function LoadingView({ label = 'Carregando...' }) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={COLORS.primary} />
      <Text style={styles.centerText}>{label}</Text>
    </View>
  );
}

export function ErrorView({ message = 'Não foi possível carregar.', onRetry }) {
  return (
    <View style={styles.center}>
      <View style={styles.errorIcon}>
        <Ionicons name="alert-circle-outline" size={28} color={COLORS.error} />
      </View>
      <Text style={styles.errorText}>{message}</Text>
      {onRetry ? (
        <TouchableOpacity style={styles.retryBtn} onPress={onRetry}>
          <Text style={styles.retryText}>Tentar novamente</Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}

export function EmptyView({ icon = 'leaf-outline', title, hint, action }) {
  return (
    <View style={styles.center}>
      <View style={styles.emptyIcon}>
        <Ionicons name={icon} size={26} color={COLORS.muted} />
      </View>
      <Text style={styles.emptyTitle}>{title}</Text>
      {hint ? <Text style={styles.emptyHint}>{hint}</Text> : null}
      {action}
    </View>
  );
}

export function StatusBadge({ color, label }) {
  return (
    <View style={[styles.badge, { backgroundColor: color }]}>
      <Text style={styles.badgeText} numberOfLines={1}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
  },
  eyebrow: { fontSize: 12, color: '#D8F3DC', marginBottom: 2 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#fff' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  centerText: { marginTop: 12, color: COLORS.muted, fontSize: 15 },
  errorIcon: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#FDECEA', alignItems: 'center', justifyContent: 'center',
  },
  errorText: { marginTop: 12, color: COLORS.error, fontSize: 15, textAlign: 'center' },
  retryBtn: {
    marginTop: 14, backgroundColor: COLORS.primary,
    borderRadius: 10, paddingHorizontal: 18, paddingVertical: 10,
  },
  retryText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
  emptyIcon: {
    width: 56, height: 56, borderRadius: 28,
    backgroundColor: '#E5E7EB', alignItems: 'center', justifyContent: 'center',
  },
  emptyTitle: { marginTop: 12, fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  emptyHint: { marginTop: 4, fontSize: 14, color: COLORS.muted, textAlign: 'center' },
  badge: {
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 4,
    maxWidth: 140,
  },
  badgeText: { color: '#fff', fontSize: 12, fontWeight: 'bold' },
});
