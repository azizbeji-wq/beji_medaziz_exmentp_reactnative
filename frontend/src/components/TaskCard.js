import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getPriorityMeta, getStatusMeta } from '../api/constants';

export default function TaskCard({ task, onPress, onToggleStatus }) {
  const priorityMeta = getPriorityMeta(task.priorite);
  const statusMeta = getStatusMeta(task.statut);
  const isDone = task.statut === 'Terminée' || task.statut === 'terminee';

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { borderLeftColor: priorityMeta.color },
        isDone && styles.cardDone,
      ]}
      onPress={() => onPress && onPress(task)}
      activeOpacity={0.7}
    >
      <View style={styles.content}>
        {/* Ligne 1 : Titre + Chevron */}
        <View style={styles.headerRow}>
          <Text
            style={[styles.title, isDone && styles.titleDone]}
            numberOfLines={1}
          >
            {task.titre || '(Sans titre)'}
          </Text>
          <Ionicons
            name="chevron-forward"
            size={18}
            color="#94A3B8"
            style={styles.chevron}
          />
        </View>

        {/* Ligne 2 : Badges Priorité et Statut */}
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
              size={12}
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
            onPress={() => onToggleStatus && onToggleStatus(task)}
            activeOpacity={0.6}
          >
            <Ionicons
              name={statusMeta.icon}
              size={12}
              color={statusMeta.color}
              style={styles.badgeIcon}
            />
            <Text style={[styles.badgeText, { color: statusMeta.color }]}>
              {statusMeta.label}
            </Text>
          </TouchableOpacity>

          {task.attachments && task.attachments.length > 0 && (
            <View style={styles.attachmentBadge}>
              <Ionicons name="attach" size={13} color="#475569" />
              <Text style={styles.attachmentBadgeText}>
                {task.attachments.length}
              </Text>
            </View>
          )}

          {task.reminder?.datetime && (
            <View style={styles.reminderBadge}>
              <Ionicons name="alarm" size={12} color="#D97706" />
              <Text style={styles.reminderBadgeText}>
                {new Date(task.reminder.datetime).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
              </Text>
            </View>
          )}

          {task.location?.latitude && (
            <View style={styles.locationBadge}>
              <Ionicons name="location" size={12} color="#059669" />
            </View>
          )}

          {task.observers && task.observers.length > 0 && (
            <View style={styles.observerBadge}>
              <Ionicons name="people" size={11} color="#7C3AED" />
              <Text style={styles.observerBadgeText}>{task.observers.length}</Text>
            </View>
          )}

          {task.comments && task.comments.length > 0 && (
            <View style={styles.commentBadge}>
              <Ionicons name="chatbubble" size={11} color="#0284C7" />
              <Text style={styles.commentBadgeText}>{task.comments.length}</Text>
            </View>
          )}
        </View>

        {/* Ligne 3 : Description */}
        {!!task.description && (
          <Text style={styles.description} numberOfLines={2}>
            {task.description}
          </Text>
        )}

        {/* Ligne 4 : Date de création avec icône calendrier */}
        <View style={styles.footerRow}>
          <View style={styles.dateContainer}>
            <Ionicons name="calendar-outline" size={13} color="#64748B" />
            <Text style={styles.dateText}>
              Créée le {task.date_creation || 'Aujourd\'hui'}
            </Text>
          </View>

          {isDone && (
            <View style={styles.donePill}>
              <Ionicons name="checkmark-done" size={12} color="#10B981" />
              <Text style={styles.donePillText}>Terminée</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderLeftWidth: 4.5,
    marginBottom: 12,
    marginHorizontal: 16,
    padding: 14,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardDone: {
    opacity: 0.88,
    backgroundColor: '#FAFCFF',
  },
  content: {
    flexDirection: 'column',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1E293B',
    flex: 1,
    letterSpacing: -0.2,
  },
  titleDone: {
    textDecorationLine: 'line-through',
    color: '#64748B',
  },
  chevron: {
    marginLeft: 8,
  },
  badgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    borderRadius: 8,
    borderWidth: 1,
  },
  badgeIcon: {
    marginRight: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  attachmentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 8,
    gap: 2,
  },
  attachmentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  reminderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 8,
    gap: 3,
  },
  reminderBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  locationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 3.5,
    borderRadius: 8,
  },
  observerBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    borderColor: '#DDD6FE',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 3.5,
    borderRadius: 8,
    gap: 2,
  },
  observerBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#7C3AED',
  },
  commentBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    borderColor: '#BAE6FD',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 3.5,
    borderRadius: 8,
    gap: 2,
  },
  commentBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  description: {
    fontSize: 13.5,
    lineHeight: 19,
    color: '#475569',
    marginBottom: 10,
  },
  footerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  donePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  donePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#10B981',
  },
});
