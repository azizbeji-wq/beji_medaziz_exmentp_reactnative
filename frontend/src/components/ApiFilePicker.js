import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  ActivityIndicator,
  Image,
  SafeAreaView,
  Platform,
  TextInput,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { downloadFileFromAPI, fetchSampleImagesFromAPI } from '../services/apiService';

/**
 * Composant de récupération de fichiers depuis une API distante
 * - Affiche une galerie de fichiers API disponibles
 * - Télécharge et importe le fichier dans les pièces jointes de la tâche
 */
export default function ApiFilePicker({ onFilesSelected }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [downloading, setDownloading] = useState(null);
  const [sampleImages, setSampleImages] = useState([]);
  const [customUrl, setCustomUrl] = useState('');
  const [customName, setCustomName] = useState('');
  const [customMime, setCustomMime] = useState('image/jpeg');

  const handleOpen = async () => {
    setModalVisible(true);
    setLoading(true);
    const imgs = await fetchSampleImagesFromAPI(6);
    setSampleImages(imgs);
    setLoading(false);
  };

  const handleDownloadSample = async (item) => {
    setDownloading(item.id);
    try {
      const downloaded = await downloadFileFromAPI(item.uri, item.name, item.mimeType);
      onFilesSelected([downloaded]);
      setModalVisible(false);
    } catch (err) {
      Platform.OS === 'web'
        ? alert(`Erreur de téléchargement : ${err.message}`)
        : Alert.alert('Erreur', err.message);
    } finally {
      setDownloading(null);
    }
  };

  const handleDownloadCustom = async () => {
    const url = customUrl.trim();
    const name = customName.trim() || 'fichier_api';
    if (!url) return;
    setDownloading('custom');
    try {
      const downloaded = await downloadFileFromAPI(url, name, customMime);
      onFilesSelected([downloaded]);
      setCustomUrl('');
      setCustomName('');
      setModalVisible(false);
    } catch (err) {
      Platform.OS === 'web'
        ? alert(`Erreur : ${err.message}`)
        : Alert.alert('Erreur téléchargement', err.message);
    } finally {
      setDownloading(null);
    }
  };

  return (
    <>
      <TouchableOpacity style={styles.trigger} onPress={handleOpen}>
        <View style={[styles.iconCircle, { backgroundColor: '#FEF3C7' }]}>
          <Ionicons name="cloud-download" size={18} color="#D97706" />
        </View>
        <Text style={styles.triggerText}>Depuis une API</Text>
        <Text style={styles.triggerSub}>URL distante</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <SafeAreaView style={styles.modalSafe}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Ionicons name="close" size={24} color="#1E293B" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Fichiers depuis l'API</Text>
            <View style={{ width: 24 }} />
          </View>

          <FlatList
            contentContainerStyle={styles.listContent}
            ListHeaderComponent={
              <>
                {/* URL personnalisée */}
                <View style={styles.customUrlSection}>
                  <Text style={styles.sectionLabel}>URL personnalisée</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="https://exemple.com/fichier.pdf"
                    placeholderTextColor="#94A3B8"
                    value={customUrl}
                    onChangeText={setCustomUrl}
                    autoCapitalize="none"
                    keyboardType="url"
                  />
                  <TextInput
                    style={styles.input}
                    placeholder="Nom du fichier (ex: rapport.pdf)"
                    placeholderTextColor="#94A3B8"
                    value={customName}
                    onChangeText={setCustomName}
                  />

                  {/* Sélecteur type MIME */}
                  <View style={styles.mimeRow}>
                    {['image/jpeg', 'application/pdf', 'image/png'].map((m) => (
                      <TouchableOpacity
                        key={m}
                        style={[styles.mimeChip, customMime === m && styles.mimeChipActive]}
                        onPress={() => setCustomMime(m)}
                      >
                        <Text style={[styles.mimeChipText, customMime === m && styles.mimeChipTextActive]}>
                          {m === 'image/jpeg' ? 'JPG' : m === 'application/pdf' ? 'PDF' : 'PNG'}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity
                    style={[styles.downloadBtn, !customUrl.trim() && { opacity: 0.5 }]}
                    onPress={handleDownloadCustom}
                    disabled={!customUrl.trim() || downloading === 'custom'}
                  >
                    {downloading === 'custom'
                      ? <ActivityIndicator size="small" color="#fff" />
                      : <>
                          <Ionicons name="cloud-download-outline" size={16} color="#fff" />
                          <Text style={styles.downloadBtnText}>Télécharger et joindre</Text>
                        </>}
                  </TouchableOpacity>
                </View>

                <Text style={styles.sectionLabel}>Galerie d'images (Picsum — démo)</Text>
                {loading && <ActivityIndicator size="large" color="#D97706" style={{ marginVertical: 20 }} />}
              </>
            }
            data={loading ? [] : sampleImages}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={{ gap: 12 }}
            ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
            renderItem={({ item }) => (
              <View style={styles.imageCard}>
                <Image source={{ uri: item.uri }} style={styles.imageThumb} />
                <View style={styles.imageInfo}>
                  <Text style={styles.imageName} numberOfLines={1}>{item.name}</Text>
                </View>
                <TouchableOpacity
                  style={styles.imageDownloadBtn}
                  onPress={() => handleDownloadSample(item)}
                  disabled={downloading !== null}
                >
                  {downloading === item.id
                    ? <ActivityIndicator size="small" color="#D97706" />
                    : <Ionicons name="cloud-download-outline" size={18} color="#D97706" />}
                </TouchableOpacity>
              </View>
            )}
          />
        </SafeAreaView>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  trigger: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 88,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  triggerText: { fontSize: 11.5, fontWeight: '700', color: '#1E293B', textAlign: 'center' },
  triggerSub: { fontSize: 10, color: '#64748B', marginTop: 2, textAlign: 'center' },
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
  listContent: { padding: 16 },
  customUrlSection: {
    backgroundColor: '#fff',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 20,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  input: {
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
  mimeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  mimeChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  mimeChipActive: { backgroundColor: '#FEF3C7', borderColor: '#FDE68A' },
  mimeChipText: { fontSize: 12, fontWeight: '600', color: '#64748B' },
  mimeChipTextActive: { color: '#D97706' },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#D97706',
    paddingVertical: 11,
    borderRadius: 10,
    gap: 6,
  },
  downloadBtnText: { color: '#fff', fontSize: 13.5, fontWeight: '700' },
  imageCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  imageThumb: { width: '100%', height: 110, backgroundColor: '#E2E8F0' },
  imageInfo: { paddingHorizontal: 10, paddingTop: 6 },
  imageName: { fontSize: 11.5, fontWeight: '600', color: '#334155' },
  imageDownloadBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    backgroundColor: '#FEF3C7',
  },
});
