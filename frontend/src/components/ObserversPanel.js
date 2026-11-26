import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { sendImmediateNotification } from '../services/notificationService';

/**
 * Composant Observateurs & Commentaires
 *
 * Fonctionnalités :
 * - Ajouter des observateurs à une tâche (par nom ou email)
 * - Écrire des commentaires sur la tâche
 * - Chaque nouveau commentaire envoie une notification in-app aux observateurs
 */
export default function ObserversPanel({ observers = [], comments = [], taskTitle = '', onObserversChange, onCommentsChange }) {
  const [newObserver, setNewObserver] = useState('');
  const [newComment, setNewComment] = useState('');
  const [author, setAuthor] = useState('');

  // ── Observateurs ──────────────────────────────────────────────────────────
  const handleAddObserver = () => {
    const val = newObserver.trim();
    if (!val) return;
    if (observers.find((o) => o.name.toLowerCase() === val.toLowerCase())) {
      Platform.OS === 'web' ? alert('Cet observateur est déjà ajouté.') : Alert.alert('Doublon', 'Cet observateur est déjà ajouté.');
      return;
    }
    onObserversChange([
      ...observers,
      { id: `obs_${Date.now()}`, name: val, addedAt: new Date().toISOString() },
    ]);
    setNewObserver('');
  };

  const handleRemoveObserver = (id) => {
    onObserversChange(observers.filter((o) => o.id !== id));
  };

  // ── Commentaires ──────────────────────────────────────────────────────────
  const handleAddComment = async () => {
    const text = newComment.trim();
    const authorName = author.trim() || 'Anonyme';
    if (!text) return;

    const comment = {
      id: `cmt_${Date.now()}`,
      author: authorName,
      text,
      createdAt: new Date().toISOString(),
    };

    onCommentsChange([...comments, comment]);
    setNewComment('');

    // Notification immédiate pour chaque observateur
    const observersList = observers.map((o) => o.name).join(', ');
    const notifBody = observers.length > 0
      ? `${authorName} a commenté la tâche "${taskTitle}"\n📋 "${text}"\n👥 Observateurs notifiés : ${observersList}`
      : `${authorName} a commenté la tâche "${taskTitle}"\n📋 "${text}"`;

    await sendImmediateNotification(`💬 Commentaire sur "${taskTitle}"`, notifBody, { type: 'comment' });
  };

  const handleRemoveComment = (id) => {
    onCommentsChange(comments.filter((c) => c.id !== id));
  };

  const formatDate = (iso) => {
    if (!iso) return '';
    const d = new Date(iso);
    return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View>
      {/* ── SECTION : Observateurs ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="people" size={15} color="#8B5CF6" />
          <Text style={styles.sectionTitle}>Observateurs</Text>
          {observers.length > 0 && (
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{observers.length}</Text>
            </View>
          )}
        </View>

        {/* Liste des observateurs */}
        {observers.length > 0 && (
          <View style={styles.observersList}>
            {observers.map((obs) => (
              <View key={obs.id} style={styles.observerChip}>
                <View style={styles.observerAvatar}>
                  <Text style={styles.observerAvatarText}>
                    {obs.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <Text style={styles.observerName} numberOfLines={1}>{obs.name}</Text>
                <TouchableOpacity onPress={() => handleRemoveObserver(obs.id)} style={styles.removeBtn}>
                  <Ionicons name="close-circle" size={16} color="#94A3B8" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        {/* Ajouter un observateur */}
        <View style={styles.addRow}>
          <TextInput
            style={styles.addInput}
            placeholder="Nom ou email de l'observateur..."
            placeholderTextColor="#94A3B8"
            value={newObserver}
            onChangeText={setNewObserver}
            onSubmitEditing={handleAddObserver}
            returnKeyType="done"
          />
          <TouchableOpacity style={styles.addBtn} onPress={handleAddObserver}>
            <Ionicons name="person-add" size={18} color="#8B5CF6" />
          </TouchableOpacity>
        </View>
      </View>

      {/* ── SECTION : Commentaires ── */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Ionicons name="chatbubbles" size={15} color="#0284C7" />
          <Text style={styles.sectionTitle}>Commentaires</Text>
          {comments.length > 0 && (
            <View style={[styles.countBadge, { backgroundColor: '#E0F2FE' }]}>
              <Text style={[styles.countBadgeText, { color: '#0284C7' }]}>{comments.length}</Text>
            </View>
          )}
        </View>

        {/* Liste des commentaires */}
        {comments.length > 0 && (
          <View style={styles.commentsList}>
            {[...comments].reverse().map((cmt) => (
              <View key={cmt.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <View style={styles.commentAvatar}>
                    <Text style={styles.commentAvatarText}>
                      {cmt.author.charAt(0).toUpperCase()}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.commentAuthor}>{cmt.author}</Text>
                    <Text style={styles.commentDate}>{formatDate(cmt.createdAt)}</Text>
                  </View>
                  <TouchableOpacity onPress={() => handleRemoveComment(cmt.id)}>
                    <Ionicons name="trash-outline" size={15} color="#94A3B8" />
                  </TouchableOpacity>
                </View>
                <Text style={styles.commentText}>{cmt.text}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Champ Auteur */}
        <TextInput
          style={styles.addInput}
          placeholder="Votre nom / pseudo..."
          placeholderTextColor="#94A3B8"
          value={author}
          onChangeText={setAuthor}
        />

        {/* Champ Commentaire */}
        <View style={styles.commentInputRow}>
          <TextInput
            style={[styles.addInput, styles.commentInput]}
            placeholder="Écrire un commentaire..."
            placeholderTextColor="#94A3B8"
            value={newComment}
            onChangeText={setNewComment}
            multiline
            numberOfLines={2}
            textAlignVertical="top"
          />
          <TouchableOpacity
            style={[styles.addBtn, styles.commentSendBtn]}
            onPress={handleAddComment}
          >
            <Ionicons name="send" size={18} color="#0284C7" />
          </TouchableOpacity>
        </View>

        {observers.length > 0 && (
          <View style={styles.notifHintRow}>
            <Ionicons name="notifications-outline" size={12} color="#8B5CF6" />
            <Text style={styles.notifHintText}>
              {observers.length} observateur{observers.length > 1 ? 's' : ''} seront notifiés de ce commentaire
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 14,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 6,
  },
  sectionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#1E293B',
    flex: 1,
    letterSpacing: -0.1,
  },
  countBadge: {
    backgroundColor: '#EDE9FE',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
  },
  countBadgeText: { fontSize: 11, fontWeight: '700', color: '#7C3AED' },
  observersList: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 },
  observerChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    borderRadius: 20,
    paddingVertical: 5,
    paddingLeft: 4,
    paddingRight: 8,
    gap: 6,
  },
  observerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  observerAvatarText: { color: '#fff', fontSize: 11, fontWeight: '700' },
  observerName: { fontSize: 12.5, fontWeight: '600', color: '#5B21B6', maxWidth: 100 },
  removeBtn: { padding: 2 },
  addRow: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  addInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13.5,
    color: '#0F172A',
    marginBottom: 8,
  },
  addBtn: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentsList: { gap: 10, marginBottom: 12 },
  commentCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
  },
  commentHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 6, gap: 8 },
  commentAvatar: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#0284C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  commentAvatarText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  commentAuthor: { fontSize: 12.5, fontWeight: '700', color: '#1E293B' },
  commentDate: { fontSize: 11, color: '#94A3B8', marginTop: 1 },
  commentText: { fontSize: 13.5, color: '#334155', lineHeight: 20 },
  commentInputRow: { flexDirection: 'row', gap: 8, alignItems: 'flex-start' },
  commentInput: { minHeight: 60, paddingTop: 10 },
  commentSendBtn: {
    backgroundColor: '#E0F2FE',
    borderColor: '#BAE6FD',
    marginTop: 0,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  notifHintRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F5F3FF',
    borderRadius: 6,
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginTop: 4,
  },
  notifHintText: { fontSize: 11, color: '#7C3AED', flex: 1 },
});
