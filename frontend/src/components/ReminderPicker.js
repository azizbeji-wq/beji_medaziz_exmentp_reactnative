import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { scheduleTaskReminder, requestWebNotificationPermission } from '../services/notificationService';

let DateTimePicker = null;
if (Platform.OS !== 'web') {
  try {
    DateTimePicker = require('@react-native-community/datetimepicker').default || require('@react-native-community/datetimepicker');
  } catch (e) {}
}

/**
 * Composant de sélection de Rappel (date + heure) pour une tâche
 * Compatible Web (simulation via web Notification API) + Mobile (expo-notifications)
 */
export default function ReminderPicker({ reminder, onReminderChange }) {
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [pickerMode, setPickerMode] = useState('date');
  const [tempDate, setTempDate] = useState(
    reminder?.datetime ? new Date(reminder.datetime) : new Date(Date.now() + 3600000)
  );
  const [noteText, setNoteText] = useState(reminder?.note || '');
  const [scheduling, setScheduling] = useState(false);

  const hasReminder = !!(reminder?.datetime);
  const reminderDate = hasReminder ? new Date(reminder.datetime) : null;

  const formatDate = (d) => {
    if (!d) return '';
    return d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
  };
  const formatTime = (d) => {
    if (!d) return '';
    return d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  };

  const handleSetReminder = async (taskId, taskTitle) => {
    if (tempDate <= new Date()) {
      if (Platform.OS === 'web') {
        alert('La date du rappel doit être dans le futur.');
      } else {
        Alert.alert('Date invalide', 'La date du rappel doit être dans le futur.');
      }
      return;
    }
    setScheduling(true);
    try {
      if (Platform.OS === 'web') {
        await requestWebNotificationPermission();
      }
      const notifId = await scheduleTaskReminder(taskId || 'preview', taskTitle || 'Tâche', tempDate, noteText);
      onReminderChange({ datetime: tempDate.toISOString(), note: noteText, notifId });
    } finally {
      setScheduling(false);
    }
  };

  const handleRemoveReminder = () => {
    onReminderChange(null);
  };

  // Mise à jour de la note en temps réel
  const handleNoteChange = (text) => {
    setNoteText(text);
    if (hasReminder) {
      onReminderChange({ ...reminder, note: text });
    }
  };

  // ── Web : sélecteur natif HTML ──────────────────────────────────────────
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <Ionicons name="alarm" size={16} color="#F59E0B" />
          <Text style={styles.label}>Rappel date & heure</Text>
          {hasReminder && (
            <TouchableOpacity onPress={handleRemoveReminder} style={styles.clearBtn}>
              <Ionicons name="close-circle" size={18} color="#EF4444" />
            </TouchableOpacity>
          )}
        </View>

        {hasReminder ? (
          <View style={styles.reminderDisplay}>
            <View style={styles.reminderInfo}>
              <Ionicons name="notifications" size={18} color="#F59E0B" />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.reminderDateText}>{formatDate(reminderDate)}</Text>
                <Text style={styles.reminderTimeText}>à {formatTime(reminderDate)}</Text>
                {reminder?.note ? <Text style={styles.reminderNote}>{reminder.note}</Text> : null}
              </View>
            </View>
          </View>
        ) : null}

        <View style={styles.webInputRow}>
          {React.createElement('input', {
            type: 'datetime-local',
            style: webStyles.datetimeInput,
            value: tempDate.toISOString().slice(0, 16),
            min: new Date(Date.now() + 60000).toISOString().slice(0, 16),
            onChange: (e) => {
              const val = e.target.value;
              if (val) setTempDate(new Date(val));
            },
          })}
          <TouchableOpacity
            style={styles.scheduleBtn}
            onPress={() => handleSetReminder()}
            disabled={scheduling}
          >
            {scheduling ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="alarm-outline" size={16} color="#fff" />
                <Text style={styles.scheduleBtnText}>Programmer</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        <TextInput
          style={styles.noteInput}
          placeholder="Note du rappel (optionnel)..."
          placeholderTextColor="#94A3B8"
          value={noteText}
          onChangeText={handleNoteChange}
        />
      </View>
    );
  }

  // ── Mobile : DateTimePicker natif ───────────────────────────────────────
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Ionicons name="alarm" size={16} color="#F59E0B" />
        <Text style={styles.label}>Rappel date & heure</Text>
        {hasReminder && (
          <TouchableOpacity onPress={handleRemoveReminder} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      {hasReminder ? (
        <View style={styles.reminderDisplay}>
          <View style={styles.reminderInfo}>
            <Ionicons name="notifications" size={18} color="#F59E0B" />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.reminderDateText}>{formatDate(reminderDate)}</Text>
              <Text style={styles.reminderTimeText}>à {formatTime(reminderDate)}</Text>
              {reminder?.note ? <Text style={styles.reminderNote}>{reminder.note}</Text> : null}
            </View>
          </View>
        </View>
      ) : null}

      <View style={styles.pickerButtonsRow}>
        <TouchableOpacity
          style={styles.pickerBtn}
          onPress={() => { setPickerMode('date'); setShowDatePicker(true); }}
        >
          <Ionicons name="calendar-outline" size={15} color="#0284C7" />
          <Text style={styles.pickerBtnText}>
            {formatDate(tempDate) || 'Date'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.pickerBtn}
          onPress={() => { setPickerMode('time'); setShowTimePicker(true); }}
        >
          <Ionicons name="time-outline" size={15} color="#0284C7" />
          <Text style={styles.pickerBtnText}>
            {formatTime(tempDate) || 'Heure'}
          </Text>
        </TouchableOpacity>
      </View>

      {(showDatePicker || showTimePicker) && DateTimePicker && (
        <DateTimePicker
          value={tempDate}
          mode={pickerMode}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          minimumDate={new Date()}
          onChange={(event, selected) => {
            setShowDatePicker(false);
            setShowTimePicker(false);
            if (selected) setTempDate(selected);
          }}
        />
      )}

      <TextInput
        style={styles.noteInput}
        placeholder="Note du rappel (optionnel)..."
        placeholderTextColor="#94A3B8"
        value={noteText}
        onChangeText={handleNoteChange}
      />

      <TouchableOpacity
        style={styles.scheduleBtn}
        onPress={handleSetReminder}
        disabled={scheduling}
      >
        {scheduling ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <>
            <Ionicons name="alarm-outline" size={16} color="#fff" />
            <Text style={styles.scheduleBtnText}>Programmer le rappel</Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const webStyles = {
  datetimeInput: {
    flex: 1,
    padding: '8px 12px',
    border: '1px solid #CBD5E1',
    borderRadius: 10,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
    outline: 'none',
  },
};

const styles = StyleSheet.create({
  container: { marginBottom: 18 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6,
  },
  label: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155',
    flex: 1,
  },
  clearBtn: { padding: 2 },
  reminderDisplay: {
    backgroundColor: '#FFFBEB',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
  },
  reminderInfo: { flexDirection: 'row', alignItems: 'flex-start' },
  reminderDateText: { fontSize: 13.5, fontWeight: '700', color: '#92400E' },
  reminderTimeText: { fontSize: 13, color: '#B45309', marginTop: 2 },
  reminderNote: { fontSize: 12, color: '#78350F', marginTop: 4, fontStyle: 'italic' },
  webInputRow: { flexDirection: 'row', gap: 8, marginBottom: 10, alignItems: 'center' },
  pickerButtonsRow: { flexDirection: 'row', gap: 8, marginBottom: 10 },
  pickerBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BAE6FD',
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    gap: 6,
  },
  pickerBtnText: { fontSize: 12.5, fontWeight: '600', color: '#0284C7', flex: 1 },
  noteInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 13.5,
    color: '#0F172A',
    marginBottom: 10,
  },
  scheduleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F59E0B',
    paddingVertical: 11,
    borderRadius: 10,
    gap: 6,
  },
  scheduleBtnText: { color: '#fff', fontSize: 13.5, fontWeight: '700' },
});
