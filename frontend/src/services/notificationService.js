import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

// Configuration des notifications (affichage en foreground)
if (Platform.OS !== 'web') {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
}

/**
 * Demander les permissions de notifications
 */
export async function requestNotificationPermissions() {
  if (Platform.OS === 'web') return true;
  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/**
 * Planifier un rappel de tâche à une date/heure précise
 * @param {string} taskId
 * @param {string} taskTitle
 * @param {Date} date
 * @param {string} [body]
 * @returns {string|null} identifiant de la notification planifiée
 */
export async function scheduleTaskReminder(taskId, taskTitle, date, body = '') {
  if (Platform.OS === 'web') {
    // Sur Web : simulation via setTimeout (non persisté)
    const delay = date.getTime() - Date.now();
    if (delay > 0) {
      setTimeout(() => {
        if (typeof window !== 'undefined' && 'Notification' in window) {
          if (Notification.permission === 'granted') {
            new Notification(`⏰ Rappel : ${taskTitle}`, {
              body: body || `Votre tâche "${taskTitle}" vous attend !`,
            });
          }
        }
      }, delay);
    }
    return `web_${taskId}_${date.getTime()}`;
  }

  try {
    const hasPermission = await requestNotificationPermissions();
    if (!hasPermission) return null;

    const trigger = new Date(date);
    if (trigger <= new Date()) return null;

    const notifId = await Notifications.scheduleNotificationAsync({
      content: {
        title: `⏰ Rappel : ${taskTitle}`,
        body: body || `Votre tâche "${taskTitle}" vous attend !`,
        data: { taskId },
      },
      trigger,
    });
    return notifId;
  } catch (err) {
    console.warn('Erreur planification notification:', err);
    return null;
  }
}

/**
 * Annuler une notification planifiée
 */
export async function cancelTaskReminder(notifId) {
  if (!notifId || Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(notifId);
  } catch (err) {}
}

/**
 * Envoyer une notification immédiate (commentaire, observateur)
 */
export async function sendImmediateNotification(title, body, data = {}) {
  if (Platform.OS === 'web') {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, { body });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then((perm) => {
          if (perm === 'granted') new Notification(title, { body });
        });
      }
    }
    return;
  }
  try {
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data },
      trigger: null, // immédiat
    });
  } catch (err) {
    console.warn('Erreur notification immédiate:', err);
  }
}

/**
 * Demander la permission de notification Web
 */
export async function requestWebNotificationPermission() {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && 'Notification' in window) {
    if (Notification.permission === 'default') {
      return await Notification.requestPermission();
    }
    return Notification.permission;
  }
  return 'granted';
}
