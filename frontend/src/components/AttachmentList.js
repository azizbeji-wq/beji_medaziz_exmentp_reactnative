import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  SafeAreaView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { formatFileSize, openAttachment } from '../services/attachmentService';

export default function AttachmentList({ attachments = [] }) {
  const [selectedImage, setSelectedImage] = useState(null);

  if (!attachments || attachments.length === 0) {
    return null;
  }

  const handlePress = (item) => {
    if (item.type === 'image') {
      setSelectedImage(item);
    } else {
      openAttachment(item);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.sectionLabel}>
          Pièces jointes ({attachments.length})
        </Text>
      </View>

      <View style={styles.list}>
        {attachments.map((item) => {
          const isImage = item.type === 'image';
          const isPdf = item.type === 'pdf';

          return (
            <TouchableOpacity
              key={item.id}
              style={styles.card}
              onPress={() => handlePress(item)}
              activeOpacity={0.7}
            >
              {isImage ? (
                <Image source={{ uri: item.uri }} style={styles.thumbnail} />
              ) : (
                <View
                  style={[
                    styles.iconBox,
                    { backgroundColor: isPdf ? '#FEE2E2' : '#F1F5F9' },
                  ]}
                >
                  <Ionicons
                    name={isPdf ? 'document-text' : 'document-attach'}
                    size={24}
                    color={isPdf ? '#DC2626' : '#475569'}
                  />
                </View>
              )}

              <View style={styles.info}>
                <Text style={styles.name} numberOfLines={1}>
                  {item.name || (isPdf ? 'document.pdf' : 'fichier')}
                </Text>
                <View style={styles.metaRow}>
                  <View
                    style={[
                      styles.tag,
                      {
                        backgroundColor: isImage
                          ? '#EDE9FE'
                          : isPdf
                          ? '#FEE2E2'
                          : '#F1F5F9',
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.tagText,
                        {
                          color: isImage
                            ? '#7C3AED'
                            : isPdf
                            ? '#DC2626'
                            : '#475569',
                        },
                      ]}
                    >
                      {isImage
                        ? item.source === 'camera'
                          ? 'Photo caméra'
                          : 'Image'
                        : isPdf
                        ? 'PDF'
                        : 'Document'}
                    </Text>
                  </View>
                  {item.size ? (
                    <Text style={styles.sizeText}>{formatFileSize(item.size)}</Text>
                  ) : null}
                </View>
              </View>

              <View style={styles.actionIcon}>
                <Ionicons
                  name={isImage ? 'eye-outline' : 'open-outline'}
                  size={18}
                  color="#0284C7"
                />
                <Text style={styles.actionText}>
                  {isImage ? 'Voir' : 'Ouvrir'}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Modal d'aperçu d'image en grand */}
      <Modal
        visible={!!selectedImage}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSelectedImage(null)}
      >
        <SafeAreaView style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle} numberOfLines={1}>
                {selectedImage?.name || 'Image'}
              </Text>
              <TouchableOpacity
                style={styles.modalCloseBtn}
                onPress={() => setSelectedImage(null)}
              >
                <Ionicons name="close" size={24} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {selectedImage && (
              <View style={styles.modalImageWrapper}>
                <Image
                  source={{ uri: selectedImage.uri }}
                  style={styles.modalImage}
                  resizeMode="contain"
                />
              </View>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalOpenExternalBtn}
                onPress={() => openAttachment(selectedImage)}
              >
                <Ionicons name="open-outline" size={16} color="#FFFFFF" />
                <Text style={styles.modalOpenExternalText}>
                  {Platform.OS === 'web' ? 'Ouvrir dans un nouvel onglet' : 'Ouvrir en plein écran'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginBottom: 12,
  },
  headerRow: {
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  list: {
    gap: 8,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
  },
  thumbnail: {
    width: 52,
    height: 52,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  iconBox: {
    width: 52,
    height: 52,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },
  name: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  tag: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  sizeText: {
    fontSize: 11,
    color: '#64748B',
  },
  actionIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  actionText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0284C7',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    justifyContent: 'center',
  },
  modalContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    flex: 1,
    marginRight: 10,
  },
  modalCloseBtn: {
    padding: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 20,
  },
  modalImageWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalFooter: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalOpenExternalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0284C7',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    gap: 6,
  },
  modalOpenExternalText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
  },
});

