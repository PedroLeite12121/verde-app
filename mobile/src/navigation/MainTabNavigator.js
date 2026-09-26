import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/home/HomeScreen';
import MapScreen from '../screens/map/MapScreen';
import AreasScreen from '../screens/areas/AreasScreen';
import NGOsScreen from '../screens/ngos/NGOsScreen';
import ProjetosScreen from '../screens/projetos/ProjetosScreen';
import DenunciasScreen from '../screens/denuncias/DenunciasScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

import { COLORS } from '../theme';

const Tab = createBottomTabNavigator();

const ICONS = {
  Home: 'home',
  Mapa: 'map',
  Areas: 'leaf',
  ONGs: 'people',
  Projetos: 'folder-open',
  Denuncias: 'alert-circle',
  Profile: 'person',
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.muted,
        tabBarStyle: { paddingBottom: 6, paddingTop: 6, height: 62 },
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarIcon: ({ color, size }) => (
          <Ionicons name={ICONS[route.name] ?? 'ellipse'} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Início' }} />
      <Tab.Screen name="Mapa" component={MapScreen} />
      <Tab.Screen name="Areas" component={AreasScreen} options={{ title: 'Áreas' }} />
      <Tab.Screen name="Denuncias" component={DenunciasScreen} options={{ title: 'Denúncias' }} />
      <Tab.Screen name="ONGs" component={NGOsScreen} options={{ title: 'ONGs' }} />
      <Tab.Screen name="Projetos" component={ProjetosScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}
