import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { INITIAL_DEMO_TASKS } from '../api/constants';

const TASKS_KEY = '@mytasks_items_v2';
const STATS_KEY = '@mytasks_stats_v2';
const API_URL_KEY = '@mytasks_api_url_v1';
const PENDING_OPS_KEY = '@mytasks_pending_ops_v1';

/**
 * Adaptateur de stockage universel et tolérant aux pannes :
 * - Sur Web : utilise directement window.localStorage (évite toute erreur de module natif null)
 * - Sur Mobile (iOS / Android) : utilise le module natif AsyncStorage (version 1.23.1 pour Expo SDK 51)
 */
const safeStorage = {
  async getItem(key) {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        return window.localStorage.getItem(key);
      } catch (err) {
        console.warn('Erreur lecture localStorage Web:', err);
      }
    }
    try {
      return await AsyncStorage.getItem(key);
    } catch (err) {
      console.warn('Erreur lecture AsyncStorage:', err);
      return null;
    }
  },

  async setItem(key, value) {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(key, value);
        return true;
      } catch (err) {
        console.warn('Erreur écriture localStorage Web:', err);
      }
    }
    try {
      await AsyncStorage.setItem(key, value);
      return true;
    } catch (err) {
      console.warn('Erreur écriture AsyncStorage:', err);
      return false;
    }
  },

  async removeItem(key) {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.removeItem(key);
      } catch (err) {}
    }
    try {
      await AsyncStorage.removeItem(key);
      return true;
    } catch (err) {
      console.warn('Erreur removeItem AsyncStorage:', err);
      return false;
    }
  },

  async multiRemove(keys) {
    if (Platform.OS === 'web' && typeof window !== 'undefined' && window.localStorage) {
      try {
        keys.forEach((k) => window.localStorage.removeItem(k));
      } catch (err) {}
    }
    try {
      await AsyncStorage.multiRemove(keys);
      return true;
    } catch (err) {
      console.warn('Erreur multiRemove AsyncStorage:', err);
      return false;
    }
  },
};

export const storage = {
  /**
   * Sauvegarder les tâches (cache local)
   */
  async saveTasks(tasks) {
    try {
      const json = JSON.stringify(tasks || []);
      await safeStorage.setItem(TASKS_KEY, json);
      return true;
    } catch (error) {
      console.warn('Erreur lors de la sauvegarde des tâches:', error);
      return false;
    }
  },

  /**
   * Charger les tâches depuis le cache local.
   * Si aucune donnée n'existe encore (1ère ouverture), initialise avec les tâches de démo.
   */
  async getTasks() {
    try {
      const json = await safeStorage.getItem(TASKS_KEY);
      if (json != null) {
        const parsed = JSON.parse(json);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      }
      await safeStorage.setItem(TASKS_KEY, JSON.stringify(INITIAL_DEMO_TASKS));
      return INITIAL_DEMO_TASKS;
    } catch (error) {
      console.warn('Erreur lors de la lecture des tâches:', error);
      return INITIAL_DEMO_TASKS;
    }
  },

  /**
   * Ajouter une tâche localement
   */
  async addTask(task) {
    const current = await this.getTasks();
    const newTask = {
      ...task,
      id: task.id || Date.now().toString(),
    };
    const updated = [newTask, ...current];
    await this.saveTasks(updated);
    return newTask;
  },

  /**
   * Mettre à jour une tâche localement
   */
  async updateTask(updatedTask) {
    const current = await this.getTasks();
    const index = current.findIndex((t) => String(t.id) === String(updatedTask.id));
    if (index !== -1) {
      current[index] = { ...current[index], ...updatedTask };
      await this.saveTasks(current);
      return current[index];
    }
    return updatedTask;
  },

  /**
   * Supprimer une tâche localement
   */
  async deleteTask(id) {
    const current = await this.getTasks();
    const filtered = current.filter((t) => String(t.id) !== String(id));
    await this.saveTasks(filtered);
    return filtered;
  },

  /**
   * Réinitialiser avec les données de démo du TP
   */
  async resetToDemo() {
    await safeStorage.setItem(TASKS_KEY, JSON.stringify(INITIAL_DEMO_TASKS));
    return INITIAL_DEMO_TASKS;
  },

  /**
   * URL personnalisée de l'API Laravel
   */
  async getApiUrl() {
    return await safeStorage.getItem(API_URL_KEY);
  },

  async setApiUrl(url) {
    if (!url) {
      return await safeStorage.removeItem(API_URL_KEY);
    }
    return await safeStorage.setItem(API_URL_KEY, url);
  },

  async removeApiUrl() {
    return await safeStorage.removeItem(API_URL_KEY);
  },

  /**
   * File d'attente des modifications hors-ligne à synchroniser au retour du réseau
   */
  async getPendingOps() {
    try {
      const json = await safeStorage.getItem(PENDING_OPS_KEY);
      if (!json) return [];
      const parsed = JSON.parse(json);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  async setPendingOps(ops) {
    try {
      await safeStorage.setItem(PENDING_OPS_KEY, JSON.stringify(ops || []));
      return true;
    } catch {
      return false;
    }
  },

  async clearPendingOps() {
    return await safeStorage.removeItem(PENDING_OPS_KEY);
  },

  /**
   * Vider complètement le stockage
   */
  async clearAll() {
    try {
      await safeStorage.multiRemove([TASKS_KEY, STATS_KEY, PENDING_OPS_KEY]);
      return true;
    } catch (error) {
      console.warn('Erreur lors du nettoyage du stockage:', error);
      return false;
    }
  },
};
