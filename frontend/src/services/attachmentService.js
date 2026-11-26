import { Platform, Alert, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

/**
 * Convertir une URL Blob (courante sur Expo Web) en Data URL Base64
 * pour garantir la persistance dans AsyncStorage après rechargement de la page.
 */
async function blobToDataUrl(uri) {
  if (Platform.OS !== 'web' || !uri || !uri.startsWith('blob:')) {
    return uri;
  }
  try {
    const response = await fetch(uri);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = () => resolve(uri);
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.warn('Erreur conversion blob vers dataURL:', err);
    return uri;
  }
}

/**
 * Formater la taille des fichiers en B, KB ou MB
 */
export function formatFileSize(bytes) {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

/**
 * 1. Prendre une photo avec la caméra
 */
export async function takePhotoWithCamera() {
  try {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'L\'accès à l\'appareil photo est nécessaire pour capturer une image.'
        );
        return null;
      }
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: Platform.OS === 'web',
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    let finalUri = asset.uri;

    if (Platform.OS === 'web' && asset.base64) {
      finalUri = `data:image/jpeg;base64,${asset.base64}`;
    } else if (Platform.OS === 'web' && finalUri.startsWith('blob:')) {
      finalUri = await blobToDataUrl(finalUri);
    }

    const fileName =
      asset.fileName || `photo_${Date.now()}.${asset.mimeType?.includes('png') ? 'png' : 'jpg'}`;

    return {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: fileName,
      type: 'image',
      uri: finalUri,
      mimeType: asset.mimeType || 'image/jpeg',
      size: asset.fileSize || 0,
      width: asset.width,
      height: asset.height,
      source: 'camera',
      dateAdded: new Date().toISOString(),
    };
  } catch (error) {
    console.warn('Erreur lors de la prise de photo caméra:', error);
    Alert.alert(
      'Erreur Caméra',
      'Impossible d\'accéder à la caméra ou la capture a été annulée.'
    );
    return null;
  }
}

/**
 * 2. Choisir une image depuis la galerie (Upload image)
 */
export async function pickImageFromGallery() {
  try {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission requise',
          'L\'accès aux photos est requis pour sélectionner une image.'
        );
        return null;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.7,
      base64: Platform.OS === 'web',
    });

    if (result.canceled || !result.assets || result.assets.length === 0) {
      return null;
    }

    const asset = result.assets[0];
    let finalUri = asset.uri;

    if (Platform.OS === 'web' && asset.base64) {
      finalUri = `data:image/jpeg;base64,${asset.base64}`;
    } else if (Platform.OS === 'web' && finalUri.startsWith('blob:')) {
      finalUri = await blobToDataUrl(finalUri);
    }

    const fileName =
      asset.fileName || `image_${Date.now()}.${asset.mimeType?.includes('png') ? 'png' : 'jpg'}`;

    return {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: fileName,
      type: 'image',
      uri: finalUri,
      mimeType: asset.mimeType || 'image/jpeg',
      size: asset.fileSize || 0,
      width: asset.width,
      height: asset.height,
      source: 'gallery',
      dateAdded: new Date().toISOString(),
    };
  } catch (error) {
    console.warn('Erreur sélection image:', error);
    Alert.alert('Erreur', 'Impossible de charger l\'image sélectionnée.');
    return null;
  }
}

/**
 * 3. Choisir un document (PDF, docx, etc.)
 */
export async function pickDocumentFile() {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: ['application/pdf', 'image/*', '*/*'],
      copyToCacheDirectory: true,
      multiple: false,
    });

    let doc = null;
    if (!result.canceled && result.assets && result.assets.length > 0) {
      doc = result.assets[0];
    } else if (result.type === 'success') {
      doc = result;
    } else {
      return null;
    }

    let finalUri = doc.uri;
    if (Platform.OS === 'web' && finalUri.startsWith('blob:')) {
      finalUri = await blobToDataUrl(finalUri);
    }

    const lowerName = (doc.name || '').toLowerCase();
    const isPdf =
      doc.mimeType === 'application/pdf' ||
      lowerName.endsWith('.pdf');
    const isImage =
      (doc.mimeType && doc.mimeType.startsWith('image/')) ||
      lowerName.endsWith('.jpg') ||
      lowerName.endsWith('.jpeg') ||
      lowerName.endsWith('.png') ||
      lowerName.endsWith('.webp');

    let type = 'file';
    if (isPdf) type = 'pdf';
    else if (isImage) type = 'image';

    return {
      id: `att_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      name: doc.name || (isPdf ? 'document.pdf' : 'fichier'),
      type,
      uri: finalUri,
      mimeType: doc.mimeType || (isPdf ? 'application/pdf' : 'application/octet-stream'),
      size: doc.size || 0,
      source: 'document',
      dateAdded: new Date().toISOString(),
    };
  } catch (error) {
    console.warn('Erreur sélection document:', error);
    Alert.alert('Erreur', 'Impossible de charger le document sélectionné.');
    return null;
  }
}

/**
 * 4. Ouvrir ou afficher une pièce jointe
 */
export async function openAttachment(attachment) {
  if (!attachment || !attachment.uri) return;

  try {
    if (Platform.OS === 'web') {
      // Pour les Data URLs ou Blobs sur Web
      if (attachment.uri.startsWith('data:')) {
        // Ouvrir dans une nouvelle fenêtre ou télécharger
        const win = window.open();
        if (win) {
          if (attachment.type === 'image') {
            win.document.write(
              `<html><head><title>${attachment.name}</title></head><body style="margin:0;display:flex;align-items:center;justify-content:center;background:#0F172A;"><img src="${attachment.uri}" style="max-width:100%;max-height:100vh;object-fit:contain;" /></body></html>`
            );
          } else if (attachment.type === 'pdf') {
            win.document.write(
              `<html><head><title>${attachment.name}</title></head><body style="margin:0;"><iframe src="${attachment.uri}" frameborder="0" style="border:0; top:0px; left:0px; bottom:0px; right:0px; width:100%; height:100%;" allowfullscreen></iframe></body></html>`
            );
          } else {
            // Téléchargement direct
            const link = document.createElement('a');
            link.href = attachment.uri;
            link.download = attachment.name || 'fichier';
            link.click();
          }
        }
      } else {
        window.open(attachment.uri, '_blank');
      }
    } else {
      const supported = await Linking.canOpenURL(attachment.uri);
      if (supported) {
        await Linking.openURL(attachment.uri);
      } else {
        Alert.alert('Info', `Fichier : ${attachment.name}`);
      }
    }
  } catch (err) {
    console.warn('Erreur ouverture pièce jointe:', err);
    Alert.alert('Erreur', 'Impossible d\'ouvrir ce fichier.');
  }
}

