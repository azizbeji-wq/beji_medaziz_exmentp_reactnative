import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { AppState, Platform } from 'react-native';
import { storage } from '../services/storage';
import { getTodayDate } from '../api/constants';
import {
  getApiBaseUrl,
  setApiBaseUrl,
  resetApiBaseUrl,
  checkApiHealth,
  fetchTasksFromAPI,
  createTaskOnAPI,
  updateTaskOnAPI,
  deleteTaskOnAPI,
  resetDemoOnAPI,
  prepareAttachmentsForAPI,
} from '../services/apiService';

const SYNC_INTERVAL_MS = 10000; // Synchronisation automatique toutes les 10 secondes

const TasksContext = createContext(null);

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [syncStatus, setSyncStatus] = useState('syncing'); // 'syncing' | 'online' | 'offline'
  const [lastSyncAt, setLastSyncAt] = useState(null);
  const [syncError, setSyncError] = useState(null);
  const [apiUrl, setApiUrl] = useState('');
  const [pendingCount, setPendingCount] = useState(0);

  const tasksRef = useRef([]);
  const syncInFlightRef = useRef(false);
  const pendingMutationsRef = useRef(0);

  const commitTasks = useCallback((nextTasks) => {
    tasksRef.current = nextTasks;
    setTasks(nextTasks);
  }, []);

  const queuePendingOp = useCallback(async (newOp) => {
    let ops = await storage.getPendingOps();

    if (newOp.type === 'create') {
      ops.push(newOp);
    } else if (newOp.type === 'update') {
      const createIdx = ops.findIndex(
        (o) => o.type === 'create' && String(o.localId) === String(newOp.id)
      );
      if (createIdx !== -1) {
        ops[createIdx] = {
          ...ops[createIdx],
          payload: { ...ops[createIdx].payload, ...newOp.payload },
        };
      } else {
        const updateIdx = ops.findIndex(
          (o) => o.type === 'update' && String(o.id) === String(newOp.id)
        );
        if (updateIdx !== -1) {
          ops[updateIdx] = {
            ...ops[updateIdx],
            payload: { ...ops[updateIdx].payload, ...newOp.payload },
          };
        } else {
          ops.push(newOp);
        }
      }
    } else if (newOp.type === 'delete') {
      if (String(newOp.id).startsWith('local_')) {
        ops = ops.filter(
          (o) =>
            !(
              (o.type === 'create' && String(o.localId) === String(newOp.id)) ||
              (o.type === 'update' && String(o.id) === String(newOp.id))
            )
        );
      } else {
        ops = ops.filter(
          (o) => !(o.type === 'update' && String(o.id) === String(newOp.id))
        );
        ops.push(newOp);
      }
    }

    await storage.setPendingOps(ops);
    setPendingCount(ops.length);
  }, []);

  const flushPendingOps = useCallback(async () => {
    const ops = await storage.getPendingOps();
    if (!ops || ops.length === 0) return;

    const idMap = {};
    for (let i = 0; i < ops.length; i++) {
      const op = ops[i];
      try {
        if (op.type === 'create') {
          const readyAttachments = await prepareAttachmentsForAPI(
            op.payload?.attachments || []
          );
          const created = await createTaskOnAPI({
            ...op.payload,
            attachments: readyAttachments,
          });
          idMap[op.localId] = created.id;
        } else if (op.type === 'update') {
          const targetId = idMap[op.id] || op.id;
          if (!String(targetId).startsWith('local_')) {
            const payload = { ...op.payload };
            if ('attachments' in payload) {
              payload.attachments = await prepareAttachmentsForAPI(payload.attachments || []);
            }
            await updateTaskOnAPI(targetId, payload);
          }
        } else if (op.type === 'delete') {
          const targetId = idMap[op.id] || op.id;
          if (!String(targetId).startsWith('local_')) {
            try {
              await deleteTaskOnAPI(targetId);
            } catch (err) {
              if (!String(err?.message || '').includes('404')) {
                throw err;
              }
            }
          }
        }
      } catch (err) {
        const remaining = ops.slice(i);
        await storage.setPendingOps(remaining);
        setPendingCount(remaining.length);
        throw err;
      }
    }

    await storage.clearPendingOps();
    setPendingCount(0);
  }, []);

  // Synchroniser avec l'API Laravel (et garder le cache local à jour)
  const syncWithServer = useCallback(
    async ({ silent = false } = {}) => {
      if (syncInFlightRef.current || pendingMutationsRef.current > 0) {
        return false;
      }

      syncInFlightRef.current = true;
      if (!silent) {
        setSyncStatus('syncing');
      }

      try {
        await flushPendingOps();
        const remoteTasks = await fetchTasksFromAPI();

        if (JSON.stringify(remoteTasks) !== JSON.stringify(tasksRef.current)) {
          commitTasks(remoteTasks);
        }
        await storage.saveTasks(remoteTasks);

        setSyncStatus('online');
        setSyncError(null);
        setLastSyncAt(new Date().toISOString());
        return true;
      } catch (err) {
        setSyncStatus('offline');
        setSyncError(err?.message || 'Serveur Laravel inaccessible');
        return false;
      } finally {
        syncInFlightRef.current = false;
      }
    },
    [commitTasks, flushPendingOps]
  );

  // 1. Initialisation : charger le cache local puis synchroniser avec Laravel
  const initializeTasks = useCallback(async () => {
    try {
      setLoading(true);
      const [localTasks, pending, currentUrl] = await Promise.all([
        storage.getTasks(),
        storage.getPendingOps(),
        getApiBaseUrl(),
      ]);
      commitTasks(localTasks || []);
      setPendingCount((pending || []).length);
      setApiUrl(currentUrl);

      await syncWithServer({ silent: false });
    } catch (err) {
      console.warn('Erreur lors du chargement des tâches:', err);
    } finally {
      setLoading(false);
    }
  }, [commitTasks, syncWithServer]);

  useEffect(() => {
    initializeTasks();
  }, [initializeTasks]);

  // Synchronisation automatique toutes les 10s + retour au premier plan
  useEffect(() => {
    const interval = setInterval(() => {
      syncWithServer({ silent: true });
    }, SYNC_INTERVAL_MS);

    const appSub = AppState.addEventListener('change', (nextState) => {
      if (nextState === 'active') {
        syncWithServer({ silent: true });
      }
    });

    let onWindowFocus = null;
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      onWindowFocus = () => syncWithServer({ silent: true });
      window.addEventListener('focus', onWindowFocus);
    }

    return () => {
      clearInterval(interval);
      appSub?.remove?.();
      if (onWindowFocus && typeof window !== 'undefined') {
        window.removeEventListener('focus', onWindowFocus);
      }
    };
  }, [syncWithServer]);

  // 2. Rafraîchir manuellement (Pull-to-refresh ou bouton)
  const refreshTasks = useCallback(async () => {
    setRefreshing(true);
    try {
      const ok = await syncWithServer({ silent: false });
      if (!ok) {
        const localTasks = await storage.getTasks();
        commitTasks(localTasks || []);
      }
    } finally {
      setRefreshing(false);
    }
  }, [commitTasks, syncWithServer]);

  // 3. Ajouter une tâche (API Laravel + cache local + file hors-ligne)
  const addTask = useCallback(
    async (taskInput) => {
      pendingMutationsRef.current += 1;

      const taskPayload = {
        titre: taskInput.titre.trim(),
        description: (taskInput.description || '').trim(),
        priorite: taskInput.priorite || 'Moyenne',
        statut: taskInput.statut || 'À faire',
        date_creation: taskInput.date_creation || getTodayDate(),
        attachments: taskInput.attachments || [],
        reminder: taskInput.reminder || null,
        location: taskInput.location || null,
        observers: taskInput.observers || [],
        comments: taskInput.comments || [],
      };

      try {
        const readyAttachments = await prepareAttachmentsForAPI(taskPayload.attachments);
        const created = await createTaskOnAPI({
          ...taskPayload,
          attachments: readyAttachments,
        });

        const updated = [
          created,
          ...tasksRef.current.filter((t) => String(t.id) !== String(created.id)),
        ];
        await storage.saveTasks(updated);
        commitTasks(updated);

        setSyncStatus('online');
        setSyncError(null);
        setLastSyncAt(new Date().toISOString());
        return created;
      } catch (err) {
        // Fallback hors-ligne : sauvegarde locale + file de synchronisation
        const localId = `local_${Date.now()}`;
        const localTask = {
          ...taskPayload,
          id: localId,
        };
        const updated = [localTask, ...tasksRef.current];
        await storage.saveTasks(updated);
        commitTasks(updated);

        await queuePendingOp({
          type: 'create',
          localId,
          payload: taskPayload,
        });

        setSyncStatus('offline');
        setSyncError(err?.message || 'Enregistré hors-ligne');
        return localTask;
      } finally {
        pendingMutationsRef.current = Math.max(0, pendingMutationsRef.current - 1);
      }
    },
    [commitTasks, queuePendingOp]
  );

  // 4. Modifier une tâche (API Laravel + cache local + file hors-ligne)
  const updateTask = useCallback(
    async (id, updatedFields) => {
      pendingMutationsRef.current += 1;

      const optimistic = tasksRef.current.map((t) =>
        String(t.id) === String(id) ? { ...t, ...updatedFields } : t
      );
      commitTasks(optimistic);
      await storage.saveTasks(optimistic);

      const optimisticTask = optimistic.find((t) => String(t.id) === String(id));

      try {
        if (String(id).startsWith('local_')) {
          await queuePendingOp({ type: 'update', id, payload: updatedFields });
          return optimisticTask;
        }

        const payload = { ...updatedFields };
        if ('attachments' in payload) {
          payload.attachments = await prepareAttachmentsForAPI(payload.attachments || []);
        }

        const serverTask = await updateTaskOnAPI(id, payload);
        const synced = tasksRef.current.map((t) =>
          String(t.id) === String(id) ? serverTask : t
        );
        await storage.saveTasks(synced);
        commitTasks(synced);

        setSyncStatus('online');
        setSyncError(null);
        setLastSyncAt(new Date().toISOString());
        return serverTask;
      } catch (err) {
        await queuePendingOp({ type: 'update', id, payload: updatedFields });
        setSyncStatus('offline');
        setSyncError(err?.message || 'Modification en attente de synchronisation');
        return optimisticTask;
      } finally {
        pendingMutationsRef.current = Math.max(0, pendingMutationsRef.current - 1);
      }
    },
    [commitTasks, queuePendingOp]
  );

  // 5. Supprimer une tâche (API Laravel + cache local + file hors-ligne)
  const deleteTask = useCallback(
    async (id) => {
      pendingMutationsRef.current += 1;

      const filtered = tasksRef.current.filter((t) => String(t.id) !== String(id));
      commitTasks(filtered);
      await storage.saveTasks(filtered);

      try {
        if (String(id).startsWith('local_')) {
          await queuePendingOp({ type: 'delete', id });
          return true;
        }

        await deleteTaskOnAPI(id);
        setSyncStatus('online');
        setSyncError(null);
        setLastSyncAt(new Date().toISOString());
        return true;
      } catch (err) {
        if (!String(err?.message || '').includes('404')) {
          await queuePendingOp({ type: 'delete', id });
          setSyncStatus('offline');
          setSyncError(err?.message || 'Suppression en attente de synchronisation');
        }
        return true;
      } finally {
        pendingMutationsRef.current = Math.max(0, pendingMutationsRef.current - 1);
      }
    },
    [commitTasks, queuePendingOp]
  );

  // 6. Basculer le statut rapidement (À faire <-> Terminée)
  const toggleTaskStatus = useCallback(
    async (task) => {
      const newStatus =
        task.statut === 'Terminée' || task.statut === 'terminee'
          ? 'À faire'
          : 'Terminée';
      return updateTask(task.id, { statut: newStatus });
    },
    [updateTask]
  );

  // 7. Obtenir une tâche par son ID
  const getTaskById = useCallback(
    (id) => tasks.find((t) => String(t.id) === String(id)),
    [tasks]
  );

  // 8. Réinitialiser les données de démo du TP (serveur + local)
  const resetDemo = useCallback(async () => {
    pendingMutationsRef.current += 1;
    try {
      const remoteDemo = await resetDemoOnAPI();
      await storage.clearPendingOps();
      setPendingCount(0);
      await storage.saveTasks(remoteDemo);
      commitTasks(remoteDemo);
      setSyncStatus('online');
      setSyncError(null);
      setLastSyncAt(new Date().toISOString());
      return remoteDemo;
    } catch {
      const demo = await storage.resetToDemo();
      commitTasks(demo);
      setSyncStatus('offline');
      return demo;
    } finally {
      pendingMutationsRef.current = Math.max(0, pendingMutationsRef.current - 1);
    }
  }, [commitTasks]);

  // 9. Configurer / Tester l'URL de l'API Laravel
  const testApiConnection = useCallback(async (candidateUrl) => {
    return await checkApiHealth(candidateUrl);
  }, []);

  const updateApiUrl = useCallback(
    async (newUrl) => {
      const normalized = await setApiBaseUrl(newUrl);
      setApiUrl(normalized);
      await syncWithServer({ silent: false });
      return normalized;
    },
    [syncWithServer]
  );

  const resetApiUrl = useCallback(async () => {
    const defaultUrl = await resetApiBaseUrl();
    setApiUrl(defaultUrl);
    await syncWithServer({ silent: false });
    return defaultUrl;
  }, [syncWithServer]);

  // 10. Statistiques calculées en temps réel
  const stats = {
    total: tasks.length,
    terminees: tasks.filter(
      (t) => t.statut === 'Terminée' || t.statut === 'terminee'
    ).length,
    a_faire: tasks.filter(
      (t) => t.statut !== 'Terminée' && t.statut !== 'terminee'
    ).length,
  };

  return (
    <TasksContext.Provider
      value={{
        tasks,
        loading,
        refreshing,
        syncStatus,
        lastSyncAt,
        syncError,
        apiUrl,
        pendingCount,
        stats,
        initializeTasks,
        refreshTasks,
        addTask,
        updateTask,
        deleteTask,
        toggleTaskStatus,
        getTaskById,
        resetDemo,
        testApiConnection,
        updateApiUrl,
        resetApiUrl,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error("useTasks doit être utilisé à l'intérieur de TasksProvider");
  }
  return context;
}
