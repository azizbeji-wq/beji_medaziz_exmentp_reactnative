import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  RefreshControl,
  SafeAreaView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../../src/context/TasksContext';
import { FILTERS } from '../../src/api/constants';
import StatsSummary from '../../src/components/StatsSummary';
import TaskCard from '../../src/components/TaskCard';
import LoadingScreen from '../../src/components/LoadingScreen';

export default function TasksScreen() {
  const router = useRouter();
  const {
    tasks,
    loading,
    refreshing,
    refreshTasks,
    stats,
    toggleTaskStatus,
  } = useTasks();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('Toutes');

  // Filtrage combiné : Recherche + Filtre d'état
  const filteredTasks = useMemo(() => {
    return tasks.filter((task) => {
      // 1. Filtre d'état
      if (selectedFilter === 'À faire') {
        if (task.statut === 'Terminée' || task.statut === 'terminee') return false;
      } else if (selectedFilter === 'Terminées') {
        if (task.statut !== 'Terminée' && task.statut !== 'terminee') return false;
      }

      // 2. Recherche textuelle
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesTitle = (task.titre || '').toLowerCase().includes(q);
        const matchesDesc = (task.description || '').toLowerCase().includes(q);
        return matchesTitle || matchesDesc;
      }

      return true;
    });
  }, [tasks, selectedFilter, searchQuery]);

  if (loading) {
    return <LoadingScreen message="Chargement de vos tâches..." />;
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* En-tête avec Titre et Bouton (+) */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerTitle}>Mes tâches</Text>
            <Text style={styles.headerSubtitle}>
              {filteredTasks.length} tâche{filteredTasks.length > 1 ? 's' : ''} affichée{filteredTasks.length > 1 ? 's' : ''}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(tabs)/add')}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        </View>

        {/* 3 Cartes Statistiques */}
        <StatsSummary
          total={stats.total}
          terminees={stats.terminees}
          aFaire={stats.a_faire}
        />

        {/* Barre de Recherche */}
        <View style={styles.searchContainer}>
          <Ionicons
            name="search-outline"
            size={18}
            color="#64748B"
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Rechercher une tâche..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCapitalize="none"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              style={styles.clearButton}
            >
              <Ionicons name="close-circle" size={18} color="#94A3B8" />
            </TouchableOpacity>
          )}
        </View>

        {/* Filtres (Pilules) */}
        <View style={styles.filtersContainer}>
          {FILTERS.map((filter) => {
            const isActive = selectedFilter === filter;
            let count = tasks.length;
            if (filter === 'À faire') count = stats.a_faire;
            if (filter === 'Terminées') count = stats.terminees;

            return (
              <TouchableOpacity
                key={filter}
                style={[
                  styles.filterPill,
                  isActive && styles.filterPillActive,
                ]}
                onPress={() => setSelectedFilter(filter)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.filterText,
                    isActive && styles.filterTextActive,
                  ]}
                >
                  {filter}
                </Text>
                <View
                  style={[
                    styles.filterCountBadge,
                    isActive && styles.filterCountBadgeActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterCountText,
                      isActive && styles.filterCountTextActive,
                    ]}
                  >
                    {count}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Liste des Tâches avec FlatList */}
        <FlatList
          data={filteredTasks}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <TaskCard
              task={item}
              onPress={() => router.push(`/details/${item.id}`)}
              onToggleStatus={toggleTaskStatus}
            />
          )}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refreshTasks}
              colors={['#0284C7']}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search" size={44} color="#CBD5E1" />
              <Text style={styles.emptyTitle}>Aucune tâche trouvée</Text>
              <Text style={styles.emptyText}>
                {searchQuery
                  ? `Aucun résultat pour "${searchQuery}"`
                  : 'Aucune tâche dans cette catégorie.'}
              </Text>
              {searchQuery ? (
                <TouchableOpacity
                  style={styles.resetSearchButton}
                  onPress={() => setSearchQuery('')}
                >
                  <Text style={styles.resetSearchText}>
                    Effacer la recherche
                  </Text>
                </TouchableOpacity>
              ) : null}
            </View>
          }
        />

        {/* Bouton Flottant (+) (Floating Action Button) */}
        <TouchableOpacity
          style={styles.fab}
          onPress={() => router.push('/(tabs)/add')}
          activeOpacity={0.85}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 4,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
  },
  addButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    height: '100%',
  },
  clearButton: {
    padding: 4,
  },
  filtersContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    marginVertical: 8,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 13,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
    gap: 6,
  },
  filterPillActive: {
    backgroundColor: '#0284C7',
  },
  filterText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  filterCountBadge: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  filterCountBadgeActive: {
    backgroundColor: 'rgba(255,255,255,0.25)',
  },
  filterCountText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  filterCountTextActive: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingTop: 6,
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 50,
    paddingHorizontal: 24,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
    marginTop: 12,
  },
  emptyText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  resetSearchButton: {
    marginTop: 12,
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#E0F2FE',
    borderRadius: 8,
  },
  resetSearchText: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#0284C7',
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
    elevation: 6,
  },
});
