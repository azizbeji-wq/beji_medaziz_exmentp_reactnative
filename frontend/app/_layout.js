import React from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { TasksProvider } from '../src/context/TasksContext';

export default function RootLayout() {
  return (
    <TasksProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#FFFFFF',
          },
          headerTintColor: '#0F172A',
          headerTitleStyle: {
            fontWeight: '700',
            fontSize: 17,
          },
          headerShadowVisible: false,
          contentStyle: {
            backgroundColor: '#F8FAFC',
          },
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen
          name="details/[id]"
          options={{
            title: "Détails d'une tâche",
            headerBackTitle: 'Retour',
          }}
        />
        <Stack.Screen
          name="edit/[id]"
          options={{
            title: 'Modifier une tâche',
            headerBackTitle: 'Retour',
          }}
        />
      </Stack>
    </TasksProvider>
  );
}
