import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  takePhotoWithCamera,
  pickImageFromGallery,
  pickDocumentFile,
  formatFileSize,
} from '../services/attachmentService';
import ApiFilePicker from './ApiFilePicker';

export default function AttachmentPicker({ attachments = [], onAttachmentsChange }) {
  const [loadingType, setLoadingType] = useState(null);

  const handleCamera = async () => {
    try {
      setLoadingType('camera');
      const photo = await takePhotoWithCamera();
      if (photo) {
        onAttachmentsChange([...attachments, photo]);
      }
    } finally {
      setLoadingType(null);
    }
  };

  const handleGallery = async () => {
    try {
      setLoadingType('gallery');
      const image = await pickImageFromGallery();
      if (image) {
        onAttachmentsChange([...attachments, image]);
      }
    } finally {
      setLoadingType(null);
    }
  };

  const handleDocument = async () => {
    try {
      setLoadingType('document');
      const doc = await pickDocumentFile();
      if (doc) {
        onAttachmentsChange([...attachments, doc]);
      }
    } finally {
      setLoadingType(null);
    }
  };

  const handleRemove = (id) => {
    onAttachmentsChange(attachments.filter((item) => item.id !== id));
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.label}>Pièces jointes</Text>
        {attachments.length > 0 && (
          <Text style={styles.counterBadge}>
            {attachments.length} {attachments.length > 1 ? 'fichiers' : 'fichier'}
          </Text>
        )}
      </View>

      {/* Boutons d'Action (Caméra, Galerie, PDF/Document) */}
      <View style={styles.buttonsRow}>
        {/* 1. Caméra */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.cameraBtn]}
          onPress={handleCamera}
          disabled={loadingType !== null}
          activeOpacity={0.7}
        >
          {loadingType === 'camera' ? (
            <ActivityIndicator size="small" color="#0284C7" />
          ) : (
            <>
              <View style={[styles.iconCircle, { backgroundColor: '#E0F2FE' }]}>
                <Ionicons name="camera" size={18} color="#0284C7" />
              </View>
              <Text style={styles.actionBtnText}>Prendre photo</Text>
              <Text style={styles.actionBtnSub}>Caméra</Text>
            </>
          )}
        </TouchableOpacity>

        {/* 2. Galerie */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.galleryBtn]}
          onPress={handleGallery}
          disabled={loadingType !== null}
          activeOpacity={0.7}
        >
          {loadingType === 'gallery' ? (
            <ActivityIndicator size="small" color="#8B5CF6" />
          ) : (
            <>
              <View style={[styles.iconCircle, { backgroundColor: '#EDE9FE' }]}>
                <Ionicons name="images" size={18} color="#8B5CF6" />
              </View>
              <Text style={styles.actionBtnText}>Galerie image</Text>
              <Text style={styles.actionBtnSub}>PNG, JPG</Text>
            </>
          )}
        </TouchableOpacity>

        {/* 3. Document PDF */}
        <TouchableOpacity
          style={[styles.actionBtn, styles.docBtn]}
          onPress={handleDocument}
          disabled={loadingType !== null}
          activeOpacity={0.7}
        >
          {loadingType === 'document' ? (
            <ActivityIndicator size="small" color="#DC2626" />
          ) : (
            <>
              <View style={[styles.iconCircle, { backgroundColor: '#FEE2E2' }]}>
                <Ionicons name="document-text" size={18} color="#DC2626" />
              </View>
              <Text style={styles.actionBtnText}>Fichier / PDF</Text>
              <Text style={styles.actionBtnSub}>Document</Text>
            </>
          )}
        </TouchableOpacity>

        {/* 4. Depuis une API */}
        <ApiFilePicker onFilesSelected={(files) => onAttachmentsChange([...attachments, ...files])} />
      </View>

      {/* Liste des pièces jointes ajoutées */}
      {attachments.length > 0 && (
        <View style={styles.listContainer}>
          {attachments.map((item) => {
            const isImage = item.type === 'image';
            const isPdf = item.type === 'pdf';

            return (
              <View key={item.id} style={styles.attachmentCard}>
                {/* Aperçu ou Icône */}
                {isImage ? (
                  <Image source={{ uri: item.uri }} style={styles.imageThumbnail} />
                ) : (
                  <View
                    style={[
                      styles.fileIconPlaceholder,
                      { backgroundColor: isPdf ? '#FEE2E2' : '#F1F5F9' },
                    ]}
                  >
                    <Ionicons
                      name={isPdf ? 'document-text' : 'document-attach'}
                      size={22}
                      color={isPdf ? '#DC2626' : '#475569'}
                    />
                  </View>
                )}

                {/* Infos du fichier */}
                <View style={styles.fileDetails}>
                  <Text style={styles.fileName} numberOfLines={1}>
                    {item.name || 'Sans titre'}
                  </Text>
                  <View style={styles.fileMetaRow}>
                    <View
                      style={[
                        styles.tagPill,
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
                          : 'Fichier'}
                      </Text>
                    </View>
                    {item.size ? (
                      <Text style={styles.fileSizeText}>
                        {formatFileSize(item.size)}
                      </Text>
                    ) : null}
                  </View>
                </View>

                {/* Bouton Supprimer */}
                <TouchableOpacity
                  style={styles.deleteBtn}
                  onPress={() => handleRemove(item.id)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="close-circle" size={22} color="#EF4444" />
                </TouchableOpacity>
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  label: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#334155',
  },
  counterBadge: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0284C7',
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 88,
  },
  cameraBtn: {
    borderColor: '#BAE6FD',
  },
  galleryBtn: {
    borderColor: '#DDD6FE',
  },
  docBtn: {
    borderColor: '#FECACA',
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#1E293B',
    textAlign: 'center',
  },
  actionBtnSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    textAlign: 'center',
  },
  listContainer: {
    marginTop: 12,
    gap: 8,
  },
  attachmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 8,
  },
  imageThumbnail: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: '#E2E8F0',
  },
  fileIconPlaceholder: {
    width: 48,
    height: 48,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fileDetails: {
    flex: 1,
    marginLeft: 10,
    marginRight: 6,
  },
  fileName: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1E293B',
  },
  fileMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    gap: 6,
  },
  tagPill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '700',
  },
  fileSizeText: {
    fontSize: 11,
    color: '#64748B',
  },
  deleteBtn: {
    padding: 4,
  },
});

