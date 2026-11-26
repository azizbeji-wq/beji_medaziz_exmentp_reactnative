import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
  SafeAreaView,
  KeyboardAvoidingView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTasks } from '../../src/context/TasksContext';
import { PRIORITES, STATUTS, getTodayDate } from '../../src/api/constants';
import AttachmentPicker from '../../src/components/AttachmentPicker';
import ReminderPicker from '../../src/components/ReminderPicker';
import LocationPicker from '../../src/components/LocationPicker';
import ObserversPanel from '../../src/components/ObserversPanel';

export default function AddTaskScreen() {
  const router = useRouter();
  const { addTask } = useTasks();

  const [titre, setTitre] = useState('');
  const [description, setDescription] = useState('');
  const [priorite, setPriorite] = useState('Moyenne');
  const [statut, setStatut] = useState('À faire');
  const [attachments, setAttachments] = useState([]);
  const [reminder, setReminder] = useState(null);
  const [location, setLocation] = useState(null);
  const [observers, setObservers] = useState([]);
  const [comments, setComments] = useState([]);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!titre.trim()) {
      setError('Veuillez saisir un titre pour la tâche.');
      return;
    }

    setError('');
    setIsSubmitting(true);

    try {
      const newTask = await addTask({
        titre: titre.trim(),
        description: description.trim(),
        priorite,
        statut,
        date_creation: getTodayDate(),
        attachments,
        reminder,
        location,
        observers,
        comments,
      });

      // Programmer la notification de rappel si défini
      if (reminder?.datetime && !reminder?.notifId) {
        const { scheduleTaskReminder } = await import('../../src/services/notificationService');
        const notifId = await scheduleTaskReminder(newTask.id, newTask.titre, new Date(reminder.datetime), reminder.note);
        // La notification est déjà programmée, on ne met pas à jour le notifId ici (tâche déjà sauvée)
      }

      // Réinitialiser le formulaire
      setTitre('');
      setDescription('');
      setPriorite('Moyenne');
      setStatut('À faire');
      setAttachments([]);
      setReminder(null);
      setLocation(null);
      setObservers([]);
      setComments([]);

      if (Platform.OS === 'web') {
        alert('Tâche ajoutée avec succès !');
      } else {
        Alert.alert('Succès', 'La tâche a été enregistrée avec succès.');
      }

      router.push('/(tabs)/tasks');
    } catch (err) {
      setError("Une erreur est survenue lors de l'enregistrement.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.contentContainer}
          keyboardShouldPersistTaps="handled"
        >
          {/* ── Infos de base ── */}
          <View style={styles.formCard}>
            <Text style={styles.cardHeaderTitle}>Nouvelle tâche</Text>
            <Text style={styles.cardHeaderSub}>
              Remplissez les informations ci-dessous pour créer votre tâche.
            </Text>

            {error ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={16} color="#DC2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            {/* Titre */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Titre <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.input, error && !titre.trim() && styles.inputError]}
                placeholder="Ex. Préparer la présentation"
                placeholderTextColor="#94A3B8"
                value={titre}
                onChangeText={(val) => { setTitre(val); if (error) setError(''); }}
              />
            </View>

            {/* Description */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Détails de la tâche..."
                placeholderTextColor="#94A3B8"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Priorité */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Priorité</Text>
              <View style={styles.segmentedRow}>
                {PRIORITES.map((p) => {
                  const isSelected = priorite === p.key;
                  return (
                    <TouchableOpacity
                      key={p.key}
                      style={[styles.segmentButton, isSelected && { backgroundColor: p.bg, borderColor: p.color, borderWidth: 1.5 }]}
                      onPress={() => setPriorite(p.key)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name={p.icon} size={15} color={isSelected ? p.color : '#64748B'} style={styles.segmentIcon} />
                      <Text style={[styles.segmentText, isSelected && { color: p.color, fontWeight: '700' }]}>{p.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Statut */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Statut initial</Text>
              <View style={styles.segmentedRow}>
                {STATUTS.map((s) => {
                  const isSelected = statut === s.key;
                  return (
                    <TouchableOpacity
                      key={s.key}
                      style={[styles.segmentButton, isSelected && { backgroundColor: s.bg, borderColor: s.color, borderWidth: 1.5 }]}
                      onPress={() => setStatut(s.key)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name={s.icon} size={15} color={isSelected ? s.color : '#64748B'} style={styles.segmentIcon} />
                      <Text style={[styles.segmentText, isSelected && { color: s.color, fontWeight: '700' }]}>{s.label}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* ── Pièces Jointes (Caméra, Galerie, PDF, API) ── */}
            <AttachmentPicker attachments={attachments} onAttachmentsChange={setAttachments} />

            {/* ── Rappel Date & Heure ── */}
            <ReminderPicker reminder={reminder} onReminderChange={setReminder} />

            {/* ── Localisation OpenStreetMap ── */}
            <LocationPicker location={location} onLocationChange={setLocation} />

            {/* Bouton Enregistrer */}
            <TouchableOpacity
              style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
              onPress={handleSubmit}
              disabled={isSubmitting}
              activeOpacity={0.8}
            >
              {isSubmitting ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="checkmark-sharp" size={19} color="#FFFFFF" />
                  <Text style={styles.saveButtonText}>Enregistrer</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* ── Observateurs & Commentaires ── */}
          <ObserversPanel
            observers={observers}
            comments={comments}
            taskTitle={titre || 'Nouvelle tâche'}
            onObserversChange={setObservers}
            onCommentsChange={setComments}
          />

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  container: { flex: 1 },
  scrollView: { flex: 1 },
  contentContainer: { padding: 16, paddingBottom: 40 },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    marginBottom: 16,
  },
  cardHeaderTitle: { fontSize: 20, fontWeight: '800', color: '#0F172A', letterSpacing: -0.4 },
  cardHeaderSub: { fontSize: 13, color: '#64748B', marginTop: 4, marginBottom: 16 },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
    gap: 8,
  },
  errorText: { fontSize: 12.5, color: '#DC2626', fontWeight: '600', flex: 1 },
  inputGroup: { marginBottom: 18 },
  label: { fontSize: 13.5, fontWeight: '700', color: '#334155', marginBottom: 6 },
  required: { color: '#DC2626' },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14.5,
    color: '#0F172A',
  },
  inputError: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  textArea: { minHeight: 90, paddingTop: 10 },
  segmentedRow: { flexDirection: 'row', gap: 8 },
  segmentButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  segmentIcon: { marginRight: 4 },
  segmentText: { fontSize: 12.5, fontWeight: '600', color: '#64748B' },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0284C7',
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    gap: 8,
    shadowColor: '#0284C7',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 3,
  },
  saveButtonDisabled: { opacity: 0.6 },
  saveButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '700', letterSpacing: -0.2 },
});
