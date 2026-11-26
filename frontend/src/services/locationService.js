import { Platform } from 'react-native';
import * as Location from 'expo-location';

/**
 * Demander la permission de localisation
 */
export async function requestLocationPermission() {
  if (Platform.OS === 'web') {
    return new Promise((resolve) => {
      if (!navigator.geolocation) { resolve(false); return; }
      navigator.geolocation.getCurrentPosition(
        () => resolve(true),
        () => resolve(false),
        { timeout: 5000 }
      );
    });
  }
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}

/**
 * Obtenir la position actuelle
 * @returns {{ latitude: number, longitude: number } | null}
 */
export async function getCurrentPosition() {
  if (Platform.OS === 'web') {
    return new Promise((resolve) => {
      if (!navigator.geolocation) { resolve(null); return; }
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
        () => resolve(null),
        { timeout: 10000, enableHighAccuracy: true }
      );
    });
  }
  try {
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    return { latitude: loc.coords.latitude, longitude: loc.coords.longitude };
  } catch (err) {
    return null;
  }
}

/**
 * Faire un reverse geocoding (OpenStreetMap Nominatim - gratuit, sans clé)
 * @param {number} latitude
 * @param {number} longitude
 * @returns {string} Adresse humaine lisible
 */
export async function reverseGeocode(latitude, longitude) {
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16&addressdetails=1`;
    const response = await fetch(url, {
      headers: { 'Accept-Language': 'fr', 'User-Agent': 'RegistreTaches/1.0' },
    });
    if (!response.ok) return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
    const data = await response.json();
    return data.display_name || `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  } catch {
    return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
  }
}

/**
 * Recherche d'adresse via Nominatim (OpenStreetMap)
 * @param {string} query
 * @returns {Array<{label, latitude, longitude}>}
 */
export async function searchAddress(query) {
  if (!query || query.length < 3) return [];
  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1`;
    const response = await fetch(url, {
      headers: { 'Accept-Language': 'fr', 'User-Agent': 'RegistreTaches/1.0' },
    });
    if (!response.ok) return [];
    const data = await response.json();
    return data.map((item) => ({
      label: item.display_name,
      latitude: parseFloat(item.lat),
      longitude: parseFloat(item.lon),
    }));
  } catch {
    return [];
  }
}
