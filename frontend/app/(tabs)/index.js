import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../../src/context/TasksContext';
import StatsSummary from '../../src/components/StatsSummary';
import TaskCard from '../../src/components/TaskCard';
import LoadingScreen from '../../src/components/LoadingScreen';

export default function HomeScreen() {
  const router = useRouter();
  const {
    tasks,
    loading,
    refreshing,
    refreshTasks,
    syncStatus,
    stats,
    toggleTaskStatus,
  } = useTasks();

  const syncBadgeMeta =
    syncStatus === 'online'
      ? {
          label: 'API Laravel · Sync 10s',
          bg: '#ECFDF5',
          border: '#A7F3D0',
          dot: '#10B981',
          text: '#047857',
        }
      : syncStatus === 'syncing'
      ? {
          label: 'Synchronisation...',
          bg: '#E0F2FE',
          border: '#BAE6FD',
          dot: '#0284C7',
          text: '#0369A1',
        }
      : {
          label: 'Hors ligne · Cache',
          bg: '#FEF3C7',
          border: '#FDE68A',
          dot: '#D97706',
          text: '#B45309',
        };

  if (loading) {
    return <LoadingScreen message="Chargement de vos tâches..." />;
  }

  const recentTasks = tasks.slice(0, 3);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refreshTasks}
            colors={['#0284C7']}
          />
        }
      >
        {/* En-tête / Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.heroTopRow}>
            <View>
              <Text style={styles.appTitle}>MyTasks</Text>
              <Text style={styles.appSubtitle}>
                Organisez vos tâches, atteignez vos objectifs !
              </Text>
            </View>

            {/* Badge État API Laravel + Cache Local */}
            <TouchableOpacity
              style={[
                styles.syncBadge,
                {
                  backgroundColor: syncBadgeMeta.bg,
                  borderColor: syncBadgeMeta.border,
                },
              ]}
              onPress={refreshTasks}
              activeOpacity={0.75}
            >
              <View style={[styles.syncDot, { backgroundColor: syncBadgeMeta.dot }]} />
              <Text style={[styles.syncBadgeText, { color: syncBadgeMeta.text }]}>
                {syncBadgeMeta.label}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* 3 Cartes Statistiques */}
        <StatsSummary
          total={stats.total}
          terminees={stats.terminees}
          aFaire={stats.a_faire}
        />

        {/* Boutons d'Action Principaux */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[styles.actionButton, styles.buttonTasks]}
            onPress={() => router.push('/(tabs)/tasks')}
            activeOpacity={0.8}
          >
            <Ionicons name="list" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Mes tâches</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionButton, styles.buttonAdd]}
            onPress={() => router.push('/(tabs)/add')}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={20} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Ajouter une tâche</Text>
          </TouchableOpacity>
        </View>

        {/* Section Tâches Récentes */}
        <View style={styles.recentSection}>
          <View style={styles.recentHeader}>
            <Text style={styles.recentTitle}>Tâches récentes</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/tasks')}>
              <Text style={styles.seeAllText}>Voir tout ({tasks.length})</Text>
            </TouchableOpacity>
          </View>

          {recentTasks.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="file-tray-outline" size={40} color="#94A3B8" />
              <Text style={styles.emptyTitle}>Aucune tâche pour le moment</Text>
              <Text style={styles.emptySubtitle}>
                Appuyez sur "Ajouter une tâche" pour créer votre première tâche.
              </Text>
            </View>
          ) : (
            recentTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onPress={() => router.push(`/details/${task.id}`)}
                onToggleStatus={toggleTaskStatus}
              />
            ))
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 24,
  },
  heroSection: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 6,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  appTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.6,
  },
  appSubtitle: {
    fontSize: 13.5,
    color: '#64748B',
    marginTop: 4,
    maxWidth: 240,
    lineHeight: 18,
  },
  syncBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    borderWidth: 1,
    gap: 6,
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  syncDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#10B981',
  },
  syncBadgeText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#047857',
  },
  actionsContainer: {
    paddingHorizontal: 16,
    marginTop: 6,
    marginBottom: 20,
    gap: 10,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  buttonTasks: {
    backgroundColor: '#0284C7',
  },
  buttonAdd: {
    backgroundColor: '#16A34A',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  recentSection: {
    marginTop: 4,
  },
  recentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  recentTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1E293B',
    letterSpacing: -0.3,
  },
  seeAllText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0284C7',
  },
  emptyState: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    borderRadius: 14,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#334155',
    marginTop: 10,
  },
  emptySubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
});
