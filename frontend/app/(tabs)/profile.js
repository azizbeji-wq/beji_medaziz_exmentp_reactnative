import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../../src/context/TasksContext';

export default function ProfileScreen() {
  const {
    tasks,
    stats,
    resetDemo,
    refreshTasks,
    syncStatus,
    lastSyncAt,
    syncError,
    apiUrl,
    pendingCount,
    testApiConnection,
    updateApiUrl,
    resetApiUrl,
  } = useTasks();

  const [apiInput, setApiInput] = useState(apiUrl || '');
  const [testingApi, setTestingApi] = useState(false);
  const [apiFeedback, setApiFeedback] = useState(null);

  useEffect(() => {
    if (apiUrl) {
      setApiInput(apiUrl);
    }
  }, [apiUrl]);

  const handleSaveAndTestApi = async () => {
    const trimmed = apiInput.trim();
    if (!trimmed) {
      setApiFeedback({ ok: false, message: 'Veuillez saisir une URL valide.' });
      return;
    }

    setTestingApi(true);
    setApiFeedback(null);
    try {
      const health = await testApiConnection(trimmed);
      const savedUrl = await updateApiUrl(trimmed);
      setApiInput(savedUrl);
      setApiFeedback({
        ok: true,
        message: `Connecté (${health.tasks_count ?? 0} tâche(s) sur le serveur)`,
      });
    } catch (err) {
      await updateApiUrl(trimmed);
      setApiFeedback({
        ok: false,
        message: `URL enregistrée, mais serveur injoignable : ${err.message}`,
      });
    } finally {
      setTestingApi(false);
    }
  };

  const handleResetApiUrl = async () => {
    setTestingApi(true);
    setApiFeedback(null);
    try {
      const def = await resetApiUrl();
      setApiInput(def);
      setApiFeedback({ ok: true, message: `URL réinitialisée : ${def}` });
    } finally {
      setTestingApi(false);
    }
  };

  const formatSyncTime = (iso) => {
    if (!iso) return 'Jamais';
    return new Date(iso).toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const completionRate =
    stats.total > 0 ? Math.round((stats.terminees / stats.total) * 100) : 0;

  // Réinitialiser les données de démo
  const handleResetDemo = () => {
    const confirmAction = async () => {
      await resetDemo();
      if (Platform.OS === 'web') {
        alert('Les données de démonstration du TP ont été restaurées.');
      } else {
        Alert.alert('Succès', 'Les 5 tâches de démonstration du TP ont été restaurées.');
      }
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Voulez-vous restaurer les 5 tâches de démonstration du TP ?')) {
        confirmAction();
      }
    } else {
      Alert.alert(
        'Restaurer la démo',
        'Voulez-vous réinitialiser les tâches avec les exemples du TP ?',
        [
          { text: 'Annuler', style: 'cancel' },
          { text: 'Restaurer', onPress: confirmAction },
        ]
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
      >
        {/* Carte Utilisateur / Étudiant */}
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>AB</Text>
          </View>
          <View style={styles.profileInfo}>
            <Text style={styles.userName}>Aziz Beji</Text>
            <Text style={styles.userRole}>TP3 · React Native & Local Storage</Text>
            <View style={styles.schoolTag}>
              <Ionicons name="cloud-done-outline" size={13} color="#0284C7" />
              <Text style={styles.schoolText}>API Laravel + Cache Local (Sync 10s)</Text>
            </View>
          </View>
        </View>

        {/* Carte Taux d'accomplissement */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <Text style={styles.cardTitle}>Taux d'accomplissement</Text>
            <Text style={styles.progressPercentage}>{completionRate}%</Text>
          </View>

          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${Math.min(completionRate, 100)}%` },
              ]}
            />
          </View>

          <View style={styles.progressStatsRow}>
            <Text style={styles.progressStatItem}>
              ✅ {stats.terminees} terminée{stats.terminees > 1 ? 's' : ''}
            </Text>
            <Text style={styles.progressStatItem}>
              ⏳ {stats.a_faire} en attente
            </Text>
            <Text style={styles.progressStatItem}>
              📁 {stats.total} au total
            </Text>
          </View>
        </View>

        {/* Carte Synchronisation API Laravel */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardIconTitleRow}>
              <View style={[styles.iconCircle, { backgroundColor: '#DCFCE7' }]}>
                <Ionicons name="cloud-outline" size={17} color="#16A34A" />
              </View>
              <Text style={styles.cardTitle}>API Laravel en ligne</Text>
            </View>
            <View
              style={[
                styles.activeTag,
                {
                  backgroundColor:
                    syncStatus === 'online'
                      ? '#ECFDF5'
                      : syncStatus === 'syncing'
                      ? '#E0F2FE'
                      : '#FEF3C7',
                },
              ]}
            >
              <Text
                style={[
                  styles.activeTagText,
                  {
                    color:
                      syncStatus === 'online'
                        ? '#10B981'
                        : syncStatus === 'syncing'
                        ? '#0284C7'
                        : '#D97706',
                  },
                ]}
              >
                {syncStatus === 'online'
                  ? 'En ligne'
                  : syncStatus === 'syncing'
                  ? 'Sync...'
                  : 'Hors ligne'}
              </Text>
            </View>
          </View>

          <Text style={styles.cardDescription}>
            Synchronisation automatique toutes les 10 secondes entre appareils. En cas de coupure réseau, vos modifications sont mises en file d'attente locale.
          </Text>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Dernière synchronisation :</Text>
            <Text style={styles.metricValue}>{formatSyncTime(lastSyncAt)}</Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Opérations en attente :</Text>
            <Text style={styles.metricValue}>{pendingCount}</Text>
          </View>

          {syncError && syncStatus === 'offline' ? (
            <Text style={styles.syncErrorText}>⚠ {syncError}</Text>
          ) : null}

          <Text style={styles.apiInputLabel}>URL du serveur API Laravel :</Text>
          <TextInput
            style={styles.apiInput}
            value={apiInput}
            onChangeText={setApiInput}
            placeholder="http://192.168.1.X:8000/api"
            placeholderTextColor="#94A3B8"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          {apiFeedback ? (
            <Text
              style={[
                styles.apiFeedbackText,
                { color: apiFeedback.ok ? '#15803D' : '#B45309' },
              ]}
            >
              {apiFeedback.message}
            </Text>
          ) : null}

          <View style={styles.apiButtonsRow}>
            <TouchableOpacity
              style={[styles.apiBtn, styles.apiBtnPrimary]}
              onPress={handleSaveAndTestApi}
              disabled={testingApi}
            >
              {testingApi ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.apiBtnPrimaryText}>Tester & Enregistrer</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.apiBtn, styles.apiBtnSecondary]}
              onPress={handleResetApiUrl}
              disabled={testingApi}
            >
              <Ionicons name="refresh-outline" size={16} color="#475569" />
              <Text style={styles.apiBtnSecondaryText}>Par défaut</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Carte Persistance Locale AsyncStorage (Partie 5) */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardIconTitleRow}>
              <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="save-outline" size={17} color="#0284C7" />
              </View>
              <Text style={styles.cardTitle}>Persistance AsyncStorage (Partie 5)</Text>
            </View>
            <View style={styles.activeTag}>
              <Text style={styles.activeTagText}>Actif</Text>
            </View>
          </View>

          <Text style={styles.cardDescription}>
            Toutes les tâches et statistiques sont stockées localement sur
            l'appareil. Les données restent conservées après la fermeture et la
            réouverture de l'application.
          </Text>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Tâches conservées en cache :</Text>
            <Text style={styles.metricValue}>{tasks.length}</Text>
          </View>

          <View style={styles.metricRow}>
            <Text style={styles.metricLabel}>Bibliothèque utilisée :</Text>
            <Text style={styles.metricCode}>@react-native-async-storage</Text>
          </View>
        </View>

        {/* Récapitulatif des 5 parties du TP */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Conformité TP3</Text>
          <View style={styles.tpStepsList}>
            <View style={styles.tpStepRow}>
              <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
              <Text style={styles.tpStepText}>Partie 1 : Composant TaskCard avec Props & Styles</Text>
            </View>
            <View style={styles.tpStepRow}>
              <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
              <Text style={styles.tpStepText}>Partie 2 : FlatList, Filtres & Statistiques dynamiques</Text>
            </View>
            <View style={styles.tpStepRow}>
              <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
              <Text style={styles.tpStepText}>Partie 3 : Formulaire CRUD (Ajout, Modif, Suppr)</Text>
            </View>
            <View style={styles.tpStepRow}>
              <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
              <Text style={styles.tpStepText}>Partie 4 : Navigation 4 écrans (Accueil, Liste, Détails, Form)</Text>
            </View>
            <View style={styles.tpStepRow}>
              <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
              <Text style={styles.tpStepText}>Partie 5 : Persistance locale avec AsyncStorage & Loader</Text>
            </View>
          </View>
        </View>

        {/* Boutons d'Action & Démonstration */}
        <View style={styles.actionsGroup}>
          <TouchableOpacity
            style={styles.utilityButton}
            onPress={handleResetDemo}
            activeOpacity={0.7}
          >
            <Ionicons name="reload-circle-outline" size={19} color="#0284C7" />
            <Text style={styles.utilityButtonText}>
              Restaurer les données de démonstration du TP
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.utilityButton, styles.refreshButton]}
            onPress={refreshTasks}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-outline" size={19} color="#0284C7" />
            <Text style={[styles.utilityButtonText, { color: '#0284C7' }]}>
              Synchroniser maintenant avec Laravel
            </Text>
          </TouchableOpacity>
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
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  userRole: {
    fontSize: 13,
    color: '#64748B',
    marginTop: 2,
  },
  schoolTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 6,
  },
  schoolText: {
    fontSize: 12,
    color: '#0284C7',
    fontWeight: '600',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardIconTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  iconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  progressPercentage: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0284C7',
  },
  progressBarTrack: {
    height: 9,
    backgroundColor: '#F1F5F9',
    borderRadius: 5,
    overflow: 'hidden',
    marginVertical: 10,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#10B981',
    borderRadius: 5,
  },
  progressStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  progressStatItem: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  cardDescription: {
    fontSize: 13,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  metricLabel: {
    fontSize: 13,
    color: '#475569',
  },
  metricValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0F172A',
  },
  metricCode: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284C7',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  activeTag: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  activeTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#10B981',
  },
  tpStepsList: {
    gap: 8,
    marginTop: 8,
  },
  tpStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  tpStepText: {
    fontSize: 13,
    color: '#334155',
    fontWeight: '500',
  },
  actionsGroup: {
    gap: 10,
    marginTop: 4,
  },
  utilityButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 13,
    borderRadius: 12,
    gap: 8,
  },
  refreshButton: {
    backgroundColor: '#F8FAFC',
  },
  utilityButtonText: {
    fontSize: 13.5,
    fontWeight: '600',
    color: '#0284C7',
  },
  syncErrorText: {
    fontSize: 12,
    color: '#B45309',
    marginTop: 6,
    marginBottom: 4,
  },
  apiInputLabel: {
    fontSize: 12.5,
    fontWeight: '600',
    color: '#334155',
    marginTop: 12,
    marginBottom: 6,
  },
  apiInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 13,
    color: '#0F172A',
  },
  apiFeedbackText: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 6,
  },
  apiButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  apiBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    gap: 6,
  },
  apiBtnPrimary: {
    flex: 1,
    backgroundColor: '#0284C7',
  },
  apiBtnPrimaryText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
  apiBtnSecondary: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  apiBtnSecondaryText: {
    color: '#475569',
    fontSize: 13,
    fontWeight: '600',
  },
});
