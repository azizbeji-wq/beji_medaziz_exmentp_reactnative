import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  Modal,
  Platform,
  ActivityIndicator,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { getCurrentPosition, reverseGeocode, searchAddress, requestLocationPermission } from '../services/locationService';

// ── Carte OSM via WebView (mobile) ou iframe (web) ───────────────────────────
let WebView = null;
if (Platform.OS !== 'web') {
  try { WebView = require('react-native-webview').WebView; } catch {}
}

function OsmMapEmbed({ latitude, longitude, onLocationSelect }) {
  if (Platform.OS === 'web') {
    const mapUrl = `https://www.openstreetmap.org/export/embed.html?bbox=${longitude - 0.02},${latitude - 0.02},${longitude + 0.02},${latitude + 0.02}&layer=mapnik&marker=${latitude},${longitude}`;
    return (
      <View style={styles.mapContainer}>
        {React.createElement('iframe', {
          src: mapUrl,
          style: { width: '100%', height: '100%', border: 'none', borderRadius: 10 },
          title: 'OpenStreetMap',
        })}
        <View style={styles.mapOverlayBtns}>
          <TouchableOpacity style={styles.mapOverlayBtn} onPress={onLocationSelect}>
            <Ionicons name="checkmark-circle" size={18} color="#fff" />
            <Text style={styles.mapOverlayBtnText}>Confirmer ce lieu</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (!WebView) return <Text style={{ color: '#64748B', textAlign: 'center', marginVertical: 16 }}>Carte non disponible dans cet environnement.</Text>;

  const html = `
    <!DOCTYPE html><html>
    <head>
      <meta name="viewport" content="width=device-width,initial-scale=1">
      <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
      <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
      <style>html,body,#map{margin:0;padding:0;height:100%;}</style>
    </head>
    <body>
      <div id="map"></div>
      <script>
        var map = L.map('map').setView([${latitude},${longitude}],15);
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{attribution:'© OpenStreetMap'}).addTo(map);
        var marker = L.marker([${latitude},${longitude}],{draggable:true}).addTo(map);
        marker.on('dragend',function(e){
          var ll = e.target.getLatLng();
          window.ReactNativeWebView.postMessage(JSON.stringify({lat:ll.lat,lng:ll.lng}));
        });
        map.on('click',function(e){
          marker.setLatLng(e.latlng);
          window.ReactNativeWebView.postMessage(JSON.stringify({lat:e.latlng.lat,lng:e.latlng.lng}));
        });
      </script>
    </body></html>`;

  return (
    <View style={styles.mapContainer}>
      <WebView
        source={{ html }}
        style={{ flex: 1, borderRadius: 10 }}
        onMessage={(ev) => {
          try {
            const { lat, lng } = JSON.parse(ev.nativeEvent.data);
            onLocationSelect({ latitude: lat, longitude: lng });
          } catch {}
        }}
      />
    </View>
  );
}

/**
 * Composant de sélection de localisation pour un rappel géographique
 * - Bouton "Ma position"
 * - Champ de recherche d'adresse (Nominatim OSM)
 * - Carte interactive OpenStreetMap (Leaflet mobile / iframe web)
 */
export default function LocationPicker({ location, onLocationChange }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [mapCoords, setMapCoords] = useState(
    location
      ? { latitude: location.latitude, longitude: location.longitude }
      : { latitude: 36.8065, longitude: 10.1815 } // Tunis par défaut
  );
  const [address, setAddress] = useState(location?.address || '');
  const [resolving, setResolving] = useState(false);
  const searchTimeout = useRef(null);

  const hasLocation = !!(location?.latitude);

  const handleUseCurrentLocation = async () => {
    setLocating(true);
    try {
      const ok = await requestLocationPermission();
      if (!ok) return;
      const pos = await getCurrentPosition();
      if (!pos) return;
      setMapCoords(pos);
      setResolving(true);
      const addr = await reverseGeocode(pos.latitude, pos.longitude);
      setAddress(addr);
      setResolving(false);
    } finally {
      setLocating(false);
    }
  };

  const handleSearch = (text) => {
    setSearchQuery(text);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (text.length < 3) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      setSearching(true);
      const results = await searchAddress(text);
      setSearchResults(results);
      setSearching(false);
    }, 600);
  };

  const handleSelectSearchResult = (item) => {
    setMapCoords({ latitude: item.latitude, longitude: item.longitude });
    setAddress(item.label);
    setSearchQuery(item.label.substring(0, 60));
    setSearchResults([]);
  };

  const handleMapLocationSelect = async (coords) => {
    setMapCoords(coords);
    setResolving(true);
    const addr = await reverseGeocode(coords.latitude, coords.longitude);
    setAddress(addr);
    setResolving(false);
  };

  const handleConfirm = () => {
    onLocationChange({
      latitude: mapCoords.latitude,
      longitude: mapCoords.longitude,
      address: address || `${mapCoords.latitude.toFixed(5)}, ${mapCoords.longitude.toFixed(5)}`,
    });
    setModalVisible(false);
  };

  const handleRemove = () => {
    onLocationChange(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Ionicons name="location" size={16} color="#10B981" />
        <Text style={styles.label}>Rappel de position (carte)</Text>
        {hasLocation && (
          <TouchableOpacity onPress={handleRemove} style={styles.clearBtn}>
            <Ionicons name="close-circle" size={18} color="#EF4444" />
          </TouchableOpacity>
        )}
      </View>

      {hasLocation ? (
        <TouchableOpacity style={styles.locationDisplay} onPress={() => setModalVisible(true)}>
          <Ionicons name="map-outline" size={18} color="#10B981" />
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.locationAddressText} numberOfLines={2}>{location.address}</Text>
            <Text style={styles.locationCoordsText}>
              {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
            </Text>
          </View>
          <Ionicons name="pencil-outline" size={15} color="#64748B" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.addLocationBtn} onPress={() => setModalVisible(true)}>
          <Ionicons name="map-outline" size={18} color="#10B981" />
          <Text style={styles.addLocationBtnText}>Sélectionner un lieu sur la carte</Text>
        </TouchableOpacity>
      )}

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#1E293B" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Choisir un lieu</Text>
            <TouchableOpacity style={styles.confirmBtn} onPress={handleConfirm}>
              <Text style={styles.confirmBtnText}>Confirmer</Text>
            </TouchableOpacity>
          </View>

          {/* Bouton Ma position */}
          <TouchableOpacity style={styles.myLocationBtn} onPress={handleUseCurrentLocation} disabled={locating}>
            {locating
              ? <ActivityIndicator size="small" color="#10B981" />
              : <Ionicons name="navigate" size={18} color="#10B981" />}
            <Text style={styles.myLocationBtnText}>Utiliser ma position actuelle</Text>
          </TouchableOpacity>

          {/* Barre de recherche Nominatim */}
          <View style={styles.searchRow}>
            <Ionicons name="search" size={16} color="#94A3B8" style={{ marginLeft: 12 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Rechercher une adresse..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={handleSearch}
              returnKeyType="search"
            />
            {searching && <ActivityIndicator size="small" color="#0284C7" style={{ marginRight: 10 }} />}
          </View>

          {/* Résultats de recherche */}
          {searchResults.length > 0 && (
            <View style={styles.searchResultsContainer}>
              {searchResults.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.searchResultItem}
                  onPress={() => handleSelectSearchResult(item)}
                >
                  <Ionicons name="location-outline" size={14} color="#64748B" />
                  <Text style={styles.searchResultText} numberOfLines={2}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Adresse résolue */}
          {(address || resolving) && (
            <View style={styles.resolvedAddressRow}>
              {resolving
                ? <ActivityIndicator size="small" color="#10B981" />
                : <Ionicons name="checkmark-circle" size={15} color="#10B981" />}
              <Text style={styles.resolvedAddressText} numberOfLines={2}>
                {resolving ? 'Résolution de l\'adresse...' : address}
              </Text>
            </View>
          )}

          {/* Carte OpenStreetMap */}
          <View style={{ flex: 1, paddingHorizontal: 16, paddingBottom: 16 }}>
            <OsmMapEmbed
              latitude={mapCoords.latitude}
              longitude={mapCoords.longitude}
              onLocationSelect={() => handleConfirm()}
            />
            <Text style={styles.mapHint}>
              {Platform.OS === 'web'
                ? 'Cliquez sur "Confirmer ce lieu" pour valider la position.'
                : 'Appuyez ou déplacez le marqueur pour choisir la position.'}
            </Text>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: 18 },
  headerRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10, gap: 6 },
  label: { fontSize: 13.5, fontWeight: '700', color: '#334155', flex: 1 },
  clearBtn: { padding: 2 },
  locationDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
    padding: 12,
  },
  locationAddressText: { fontSize: 12.5, fontWeight: '600', color: '#065F46', lineHeight: 18 },
  locationCoordsText: { fontSize: 11, color: '#10B981', marginTop: 2 },
  addLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 14,
    gap: 8,
  },
  addLocationBtnText: { fontSize: 13.5, fontWeight: '600', color: '#10B981' },
  modalSafe: { flex: 1, backgroundColor: '#F8FAFC' },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  confirmBtn: { backgroundColor: '#10B981', paddingVertical: 7, paddingHorizontal: 14, borderRadius: 8 },
  confirmBtnText: { color: '#fff', fontWeight: '700', fontSize: 13.5 },
  myLocationBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
    paddingVertical: 11,
    paddingHorizontal: 14,
    gap: 8,
  },
  myLocationBtnText: { fontSize: 13.5, fontWeight: '700', color: '#10B981' },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    marginHorizontal: 16,
    marginTop: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 11,
    paddingHorizontal: 10,
    fontSize: 14,
    color: '#0F172A',
  },
  searchResultsContainer: {
    marginHorizontal: 16,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    marginTop: 4,
    maxHeight: 180,
    overflow: 'hidden',
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    gap: 8,
  },
  searchResultText: { fontSize: 12.5, color: '#334155', flex: 1, lineHeight: 18 },
  resolvedAddressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    gap: 6,
  },
  resolvedAddressText: { fontSize: 12, color: '#065F46', flex: 1, lineHeight: 17 },
  mapContainer: {
    flex: 1,
    borderRadius: 10,
    overflow: 'hidden',
    minHeight: 220,
    backgroundColor: '#E2E8F0',
  },
  mapOverlayBtns: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  mapOverlayBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#10B981',
    paddingVertical: 9,
    paddingHorizontal: 18,
    borderRadius: 20,
    gap: 6,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  mapOverlayBtnText: { color: '#fff', fontWeight: '700', fontSize: 13.5 },
  mapHint: {
    textAlign: 'center',
    fontSize: 11.5,
    color: '#94A3B8',
    marginTop: 6,
  },
});
