/**
 * Service API — Connexion au backend Laravel REST + Upload/Download de fichiers
 *
 * Fonctionnement :
 * - Par défaut, détecte automatiquement l'URL du serveur Laravel (port 8000) :
 *   - Web : http://<hostname>:8000/api (ex: http://localhost:8000/api ou IP LAN)
 *   - Mobile (Expo Go) : http://<IP-du-PC-Expo>:8000/api
 * - L'URL peut aussi être configurée manuellement depuis l'onglet Profil (stockée en local)
 *   ou via EXPO_PUBLIC_API_URL.
 */

import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as FileSystem from 'expo-file-system';
import { storage } from './storage';

const DEFAULT_TIMEOUT_MS = 7000;

// ─── URL DYNAMIQUE DU SERVEUR LARAVEL ─────────────────────────────────────────

export function normalizeApiBaseUrl(rawUrl) {
  if (!rawUrl || typeof rawUrl !== 'string') return '';
  const trimmed = rawUrl.trim().replace(/\/+$/, '');
  if (!trimmed) return '';
  try {
    const parsed = new URL(trimmed);
    if (!parsed.pathname || parsed.pathname === '/') {
      return `${trimmed}/api`;
    }
    return trimmed;
  } catch {
    return trimmed;
  }
}

export function getDefaultApiBaseUrl() {
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    return normalizeApiBaseUrl(process.env.EXPO_PUBLIC_API_URL);
  }

  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.location?.hostname) {
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    return `${protocol}//${window.location.hostname}:8000/api`;
  }

  // Sur mobile Expo Go, récupérer automatiquement l'IP LAN du serveur Metro
  const hostUri =
    Constants.expoConfig?.hostUri ||
    Constants.manifest2?.extra?.expoGo?.debuggerHost ||
    Constants.manifest?.debuggerHost;

  if (hostUri && typeof hostUri === 'string') {
    const host = hostUri.split(':')[0];
    const isTunnelHost =
      host.endsWith('.exp.direct') ||
      host.endsWith('.ngrok.io') ||
      host.endsWith('.ngrok-free.app');
    if (host && host !== 'localhost' && host !== '127.0.0.1' && !isTunnelHost) {
      return `http://${host}:8000/api`;
    }
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000/api';
  }

  return 'http://localhost:8000/api';
}

export async function getApiBaseUrl() {
  const custom = await storage.getApiUrl();
  if (custom && custom.trim()) {
    return normalizeApiBaseUrl(custom);
  }
  return getDefaultApiBaseUrl();
}

export async function setApiBaseUrl(url) {
  const normalized = normalizeApiBaseUrl(url);
  await storage.setApiUrl(normalized);
  return normalized;
}

export async function resetApiBaseUrl() {
  await storage.removeApiUrl();
  return getDefaultApiBaseUrl();
}

// ─── HELPERS HTTP ─────────────────────────────────────────────────────────────

function buildHeaders(extraHeaders = {}) {
  return {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    ...extraHeaders,
  };
}

async function fetchWithTimeout(url, options = {}, timeoutMs = DEFAULT_TIMEOUT_MS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(url, { ...options, signal: controller.signal });
  } catch (err) {
    if (err.name === 'AbortError') {
      throw new Error(`Délai dépassé (${timeoutMs / 1000}s) pour ${url}`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

async function handleResponse(res) {
  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText);
    let message = `API ${res.status}`;
    try {
      const parsed = JSON.parse(text);
      if (parsed?.message) message = parsed.message;
    } catch {
      if (text) message = `${message} : ${text}`;
    }
    throw new Error(message);
  }
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) return res.json();
  return res.text();
}

function normalizeTaskFromAPI(task) {
  if (!task || typeof task !== 'object') return task;
  return {
    ...task,
    id: String(task.id),
    titre: task.titre || '',
    description: task.description || '',
    priorite: task.priorite || 'Moyenne',
    statut: task.statut || 'À faire',
    date_creation: task.date_creation || '',
    attachments: Array.isArray(task.attachments) ? task.attachments : [],
    reminder: task.reminder || null,
    location: task.location || null,
    observers: Array.isArray(task.observers) ? task.observers : [],
    comments: Array.isArray(task.comments) ? task.comments : [],
  };
}

// ─── SANTÉ & TÂCHES CRUD (API LARAVEL) ────────────────────────────────────────

/** Vérifier la connexion au backend Laravel */
export async function checkApiHealth(overrideUrl = null) {
  const baseUrl = overrideUrl ? normalizeApiBaseUrl(overrideUrl) : await getApiBaseUrl();
  const res = await fetchWithTimeout(`${baseUrl}/health`, { headers: buildHeaders() }, 5000);
  const data = await handleResponse(res);
  return { ...data, baseUrl };
}

/** Récupérer toutes les tâches depuis l'API Laravel */
export async function fetchTasksFromAPI() {
  const baseUrl = await getApiBaseUrl();
  const res = await fetchWithTimeout(`${baseUrl}/tasks`, { headers: buildHeaders() });
  const data = await handleResponse(res);
  const list = Array.isArray(data) ? data : Array.isArray(data?.data) ? data.data : [];
  return list.map(normalizeTaskFromAPI);
}

/** Récupérer une tâche par ID */
export async function fetchTaskByIdFromAPI(id) {
  const baseUrl = await getApiBaseUrl();
  const res = await fetchWithTimeout(`${baseUrl}/tasks/${id}`, { headers: buildHeaders() });
  const data = await handleResponse(res);
  return normalizeTaskFromAPI(data);
}

/** Créer une tâche sur le serveur Laravel */
export async function createTaskOnAPI(taskPayload) {
  const baseUrl = await getApiBaseUrl();
  const res = await fetchWithTimeout(`${baseUrl}/tasks`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(taskPayload),
  });
  const data = await handleResponse(res);
  return normalizeTaskFromAPI(data);
}

/** Mettre à jour une tâche sur le serveur Laravel */
export async function updateTaskOnAPI(id, updatedFields) {
  const baseUrl = await getApiBaseUrl();
  const res = await fetchWithTimeout(`${baseUrl}/tasks/${id}`, {
    method: 'PATCH',
    headers: buildHeaders(),
    body: JSON.stringify(updatedFields),
  });
  const data = await handleResponse(res);
  return normalizeTaskFromAPI(data);
}

/** Supprimer une tâche sur le serveur Laravel */
export async function deleteTaskOnAPI(id) {
  const baseUrl = await getApiBaseUrl();
  const res = await fetchWithTimeout(`${baseUrl}/tasks/${id}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  });
  return handleResponse(res);
}

/** Réinitialiser les données de démo sur le serveur Laravel */
export async function resetDemoOnAPI() {
  const baseUrl = await getApiBaseUrl();
  const res = await fetchWithTimeout(`${baseUrl}/tasks/reset-demo`, {
    method: 'POST',
    headers: buildHeaders(),
  });
  const data = await handleResponse(res);
  const list = Array.isArray(data) ? data : [];
  return list.map(normalizeTaskFromAPI);
}

// ─── FICHIERS & PIÈCES JOINTES ────────────────────────────────────────────────

/**
 * Télécharger un fichier depuis une URL et retourner une URI locale ou Data URL
 */
export async function downloadFileFromAPI(fileUrl, fileName = 'fichier', mimeType = 'application/octet-stream') {
  if (Platform.OS === 'web') {
    const res = await fetch(fileUrl);
    if (!res.ok) throw new Error(`Erreur téléchargement : ${res.status}`);
    const blob = await res.blob();
    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
    const isImage = mimeType.startsWith('image/');
    const isPdf = mimeType === 'application/pdf';
    return {
      id: `api_${Date.now()}`,
      name: fileName,
      uri: dataUrl,
      mimeType,
      type: isImage ? 'image' : isPdf ? 'pdf' : 'file',
      size: blob.size,
      source: 'api',
      dateAdded: new Date().toISOString(),
    };
  } else {
    const localUri = FileSystem.cacheDirectory + fileName;
    const { uri, status } = await FileSystem.downloadAsync(fileUrl, localUri);
    if (status !== 200) throw new Error(`Erreur téléchargement : ${status}`);
    const info = await FileSystem.getInfoAsync(uri, { size: true });
    const isImage = mimeType.startsWith('image/');
    const isPdf = mimeType === 'application/pdf';
    return {
      id: `api_${Date.now()}`,
      name: fileName,
      uri,
      mimeType,
      type: isImage ? 'image' : isPdf ? 'pdf' : 'file',
      size: info.size || 0,
      source: 'api',
      dateAdded: new Date().toISOString(),
    };
  }
}

/**
 * Uploader un fichier vers l'API Laravel (multipart/form-data)
 */
export async function uploadFileToAPI(uploadUrl, file, extraFields = {}) {
  const targetUrl = uploadUrl || `${await getApiBaseUrl()}/upload`;
  const formData = new FormData();

  if (Platform.OS === 'web') {
    if (file.uri.startsWith('data:') || file.uri.startsWith('blob:')) {
      const res = await fetch(file.uri);
      const blob = await res.blob();
      formData.append('file', blob, file.name || 'fichier');
    } else {
      formData.append('file', { uri: file.uri, name: file.name || 'fichier', type: file.mimeType || 'application/octet-stream' });
    }
  } else {
    formData.append('file', {
      uri: file.uri,
      name: file.name || 'fichier',
      type: file.mimeType || 'application/octet-stream',
    });
  }

  Object.entries(extraFields).forEach(([k, v]) => formData.append(k, v));

  const res = await fetchWithTimeout(
    targetUrl,
    {
      method: 'POST',
      headers: { Accept: 'application/json' },
      body: formData,
    },
    15000
  );
  return handleResponse(res);
}

/**
 * Uploader automatiquement les pièces jointes locales (caméra/galerie/PDF)
 * vers Laravel pour qu'un autre appareil (Appareil Y) puisse aussi les ouvrir.
 */
export async function prepareAttachmentsForAPI(attachments = []) {
  if (!Array.isArray(attachments) || attachments.length === 0) return [];
  const baseUrl = await getApiBaseUrl();
  const results = [];

  for (const att of attachments) {
    if (!att || !att.uri) continue;
    if (att.uri.startsWith('http://') || att.uri.startsWith('https://')) {
      results.push(att);
      continue;
    }

    try {
      const uploaded = await uploadFileToAPI(`${baseUrl}/upload`, att);
      results.push({
        ...att,
        uri: uploaded.uri || att.uri,
        size: uploaded.size || att.size || 0,
        mimeType: uploaded.mimeType || att.mimeType,
        source: att.source || 'api',
      });
    } catch (err) {
      console.warn('Upload pièce jointe échoué, conservation locale:', err.message);
      results.push(att);
    }
  }

  return results;
}

/**
 * Exemple : récupérer des photos depuis un endpoint public (Picsum)
 */
export async function fetchSampleImagesFromAPI(count = 3) {
  const images = [];
  for (let i = 1; i <= count; i++) {
    images.push({
      id: `picsum_${i}`,
      name: `photo_${i}.jpg`,
      type: 'image',
      mimeType: 'image/jpeg',
      uri: `https://picsum.photos/seed/${i + 10}/400/300`,
      size: 0,
      source: 'api',
      dateAdded: new Date().toISOString(),
    });
  }
  return images;
}
