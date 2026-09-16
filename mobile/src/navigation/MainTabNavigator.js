import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/home/HomeScreen';
import AreasScreen from '../screens/areas/AreasScreen';
import NGOsScreen from '../screens/ngos/NGOsScreen';
import ProjetosScreen from '../screens/projetos/ProjetosScreen';
import DenunciasScreen from '../screens/denuncias/DenunciasScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';

const Tab = createBottomTabNavigator();

const COLORS = {
  primary: '#2D6A4F',
  inactive: '#6B7280',
};

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.inactive,
        
        tabBarIcon: ({ color, size }) => {
          let iconName;
          switch (route.name) {
            case 'Home':
              iconName = 'home';
              break;
            case 'Areas':
              iconName = 'leaf';
              break;
            case 'ONGs':
              iconName = 'people';
              break;
            case 'Projetos':
              iconName = 'folder-open';
              break;
            case 'Denuncias':
              iconName = 'alert-circle';
              break;
            case 'Profile':
              iconName = 'person';
              break;
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Areas" component={AreasScreen} />
      <Tab.Screen name="ONGs" component={NGOsScreen} />
      <Tab.Screen name="Projetos" component={ProjetosScreen} />
      <Tab.Screen name="Denuncias" component={DenunciasScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
