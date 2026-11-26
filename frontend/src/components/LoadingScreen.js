import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function LoadingScreen({ message = 'Chargement de vos tâches...' }) {
  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Ionicons name="cloud-download-outline" size={32} color="#0284C7" />
        </View>
        <ActivityIndicator size="large" color="#0284C7" style={styles.spinner} />
        <Text style={styles.message}>{message}</Text>
        <Text style={styles.subMessage}>Lecture du stockage local AsyncStorage...</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingVertical: 36,
    paddingHorizontal: 28,
    borderRadius: 20,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 16,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
    maxWidth: 320,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  spinner: {
    marginBottom: 16,
    transform: [{ scale: 1.15 }],
  },
  message: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
    marginBottom: 6,
  },
  subMessage: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
  },
});
