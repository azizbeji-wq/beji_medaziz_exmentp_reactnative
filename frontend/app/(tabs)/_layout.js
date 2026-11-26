import React from 'react';
import { Tabs } from 'expo-router';
import { Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#F1F5F9',
        },
        headerTintColor: '#0F172A',
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 18,
          letterSpacing: -0.3,
        },
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
          height: Platform.OS === 'ios' ? 88 : 66,
          paddingBottom: Platform.OS === 'ios' ? 26 : 10,
          paddingTop: 8,
          elevation: 6,
          shadowColor: '#0F172A',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.05,
          shadowRadius: 10,
        },
        tabBarActiveTintColor: '#0284C7',
        tabBarInactiveTintColor: '#94A3B8',
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginTop: 2,
        },
      }}
    >
      {/* 1. Écran Accueil */}
      <Tabs.Screen
        name="index"
        options={{
          title: 'Accueil',
          headerTitle: 'MyTasks',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* 2. Écran Liste des tâches */}
      <Tabs.Screen
        name="tasks"
        options={{
          title: 'Tâches',
          headerTitle: 'Mes tâches',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'checkbox' : 'checkbox-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {/* 3. Écran Formulaire Ajout */}
      <Tabs.Screen
        name="add"
        options={{
          title: 'Ajouter',
          headerTitle: 'Ajouter une tâche',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'add-circle' : 'add-circle-outline'}
              size={24}
              color={color}
            />
          ),
        }}
      />

      {/* 4. Écran Profil */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profil',
          headerTitle: 'Mon Profil',
          tabBarIcon: ({ color, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tabs>
  );
}
