import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  SafeAreaView,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../../src/context/TasksContext';
import { getPriorityMeta, getStatusMeta } from '../../src/api/constants';
import AttachmentList from '../../src/components/AttachmentList';
import ObserversPanel from '../../src/components/ObserversPanel';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { getTaskById, deleteTask, toggleTaskStatus, updateTask } = useTasks();

  const task = getTaskById(id);

  if (!task) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.notFoundContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#94A3B8" />
          <Text style={styles.notFoundTitle}>Tâche introuvable</Text>
          <Text style={styles.notFoundText}>
            Cette tâche a peut-être été supprimée ou n'existe pas.
          </Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Retour à la liste</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const priorityMeta = getPriorityMeta(task.priorite);
  const statusMeta = getStatusMeta(task.statut);
  const isDone = task.statut === 'Terminée' || task.statut === 'terminee';

  const handleDelete = () => {
    const confirmDelete = async () => {
      await deleteTask(task.id);
      if (Platform.OS === 'web') {
        alert('Tâche supprimée avec succès.');
      }
      router.back();
    };

    if (Platform.OS === 'web') {
      if (window.confirm('Êtes-vous sûr de vouloir supprimer définitivement cette tâche ?')) {
        confirmDelete();
      }
    } else {
      Alert.alert(
        'Supprimer la tâche',
        'Êtes-vous sûr de vouloir supprimer cette tâche ? Cette action est irréversible.',
        [
          { text: 'Annuler', style: 'cancel' },
          {
            text: 'Supprimer',
            style: 'destructive',
            onPress: confirmDelete,
          },
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
        <View style={styles.card}>
          {/* Ligne des Badges */}
          <View style={styles.badgesRow}>
            <View
              style={[
                styles.badge,
                {
                  backgroundColor: priorityMeta.bg,
                  borderColor: priorityMeta.border,
                },
              ]}
            >
              <Ionicons
                name={priorityMeta.icon}
                size={13}
                color={priorityMeta.color}
                style={styles.badgeIcon}
              />
              <Text style={[styles.badgeText, { color: priorityMeta.color }]}>
                {priorityMeta.label}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.badge,
                {
                  backgroundColor: statusMeta.bg,
                  borderColor: statusMeta.border,
                },
              ]}
              onPress={() => toggleTaskStatus(task)}
              activeOpacity={0.7}
            >
              <Ionicons
                name={statusMeta.icon}
                size={13}
                color={statusMeta.color}
                style={styles.badgeIcon}
              />
              <Text style={[styles.badgeText, { color: statusMeta.color }]}>
                {statusMeta.label}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Titre */}
          <Text style={[styles.title, isDone && styles.titleDone]}>
            {task.titre}
          </Text>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Description</Text>
            <Text style={styles.description}>
              {task.description || '(Aucune description fournie)'}
            </Text>
          </View>

          {/* Pièces Jointes (Images, Caméra, PDF) */}
          <AttachmentList attachments={task.attachments || []} />

          {/* Rappel Date & Heure */}
          {task.reminder?.datetime && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>Rappel programmé</Text>
              <View style={styles.reminderDisplayRow}>
                <Ionicons name="alarm" size={16} color="#F59E0B" />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.reminderDateText}>
                    {new Date(task.reminder.datetime).toLocaleDateString('fr-FR', {
                      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
                    })}
                  </Text>
                  <Text style={styles.reminderTimeText}>
                    à {new Date(task.reminder.datetime).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                  {task.reminder.note ? (
                    <Text style={styles.reminderNoteText}>{task.reminder.note}</Text>
                  ) : null}
                </View>
              </View>
            </View>
          )}

          {/* Localisation OSM */}
          {task.location?.latitude && (
            <View style={styles.sectionBlock}>
              <Text style={styles.sectionLabel}>Rappel de position</Text>
              <View style={styles.locationDisplayRow}>
                <Ionicons name="location" size={16} color="#10B981" />
                <View style={{ flex: 1, marginLeft: 8 }}>
                  <Text style={styles.locationAddressText} numberOfLines={3}>
                    {task.location.address || `${task.location.latitude.toFixed(5)}, ${task.location.longitude.toFixed(5)}`}
                  </Text>
                  <Text style={styles.locationCoordsText}>
                    {task.location.latitude.toFixed(5)}, {task.location.longitude.toFixed(5)}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Date de création */}
          <View style={styles.dateRow}>
            <Ionicons name="calendar-outline" size={16} color="#64748B" />
            <Text style={styles.dateLabel}>Date de création :</Text>
            <Text style={styles.dateValue}>
              {task.date_creation || 'Non précisée'}
            </Text>
          </View>
        </View>

        {/* Boutons d'Action CRUD */}
        <View style={styles.actionsContainer}>
          {/* Bouton Modifier */}
          <TouchableOpacity
            style={[styles.button, styles.editButton]}
            onPress={() => router.push(`/edit/${task.id}`)}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={18} color="#FFFFFF" />
            <Text style={styles.buttonText}>Modifier</Text>
          </TouchableOpacity>

          {/* Bouton Supprimer */}
          <TouchableOpacity
            style={[styles.button, styles.deleteButton]}
            onPress={handleDelete}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
            <Text style={styles.buttonText}>Supprimer</Text>
          </TouchableOpacity>
        </View>

        {/* Observateurs & Commentaires (lecture + ajout) */}
        <ObserversPanel
          observers={task.observers || []}
          comments={task.comments || []}
          taskTitle={task.titre}
          onObserversChange={(newObs) => updateTask(task.id, { observers: newObs })}
          onCommentsChange={(newCmts) => updateTask(task.id, { comments: newCmts })}
        />
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
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 20,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 28,
    letterSpacing: -0.4,
    marginBottom: 16,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  section: {
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    color: '#334155',
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  dateLabel: {
    fontSize: 13,
    color: '#64748B',
  },
  dateValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  actionsContainer: {
    gap: 12,
    marginBottom: 16,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  editButton: { backgroundColor: '#0284C7' },
  deleteButton: { backgroundColor: '#EF4444' },
  buttonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
  notFoundContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  notFoundTitle: { fontSize: 18, fontWeight: '700', color: '#1E293B', marginTop: 12 },
  notFoundText: { fontSize: 13.5, color: '#64748B', textAlign: 'center', marginTop: 6, marginBottom: 18 },
  backButton: { paddingVertical: 10, paddingHorizontal: 18, backgroundColor: '#E0F2FE', borderRadius: 8 },
  backButtonText: { fontSize: 14, fontWeight: '600', color: '#0284C7' },
  // Nouveaux styles
  sectionBlock: {
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 10,
  },
  reminderDisplayRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
  },
  reminderDateText: { fontSize: 13.5, fontWeight: '700', color: '#92400E' },
  reminderTimeText: { fontSize: 13, color: '#B45309', marginTop: 2 },
  reminderNoteText: { fontSize: 12, color: '#78350F', marginTop: 4, fontStyle: 'italic' },
  locationDisplayRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
    padding: 12,
    marginTop: 6,
  },
  locationAddressText: { fontSize: 12.5, fontWeight: '600', color: '#065F46', lineHeight: 18 },
  locationCoordsText: { fontSize: 11, color: '#10B981', marginTop: 2 },
});
