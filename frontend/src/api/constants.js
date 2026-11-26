// Constantes partagées pour TP3 React Native
export const PRIORITES = [
  {
    key: 'Faible',
    label: 'Faible',
    color: '#10B981',
    bg: '#ECFDF5',
    border: '#A7F3D0',
    icon: 'arrow-down-outline',
  },
  {
    key: 'Moyenne',
    label: 'Moyenne',
    color: '#D97706',
    bg: '#FEF3C7',
    border: '#FDE68A',
    icon: 'remove-outline',
  },
  {
    key: 'Élevée',
    label: 'Élevée',
    color: '#DC2626',
    bg: '#FEE2E2',
    border: '#FECACA',
    icon: 'arrow-up-outline',
  },
];

export const STATUTS = [
  {
    key: 'À faire',
    label: 'À faire',
    color: '#0284C7',
    bg: '#E0F2FE',
    border: '#BAE6FD',
    icon: 'time-outline',
  },
  {
    key: 'Terminée',
    label: 'Terminée',
    color: '#16A34A',
    bg: '#DCFCE7',
    border: '#BBF7D0',
    icon: 'checkmark-circle-outline',
  },
];

export const FILTERS = ['Toutes', 'À faire', 'Terminées'];

export function getPriorityMeta(priorite) {
  return (
    PRIORITES.find((p) => p.key === priorite) ||
    PRIORITES[1] // Default: Moyenne
  );
}

export function getStatusMeta(statut) {
  if (statut === 'terminee' || statut === 'Terminée') {
    return STATUTS[1];
  }
  return STATUTS[0];
}

export function getTodayDate() {
  const d = new Date();
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

export function emptyTask() {
  return {
    titre: '',
    description: '',
    priorite: 'Moyenne',
    statut: 'À faire',
    date_creation: getTodayDate(),
  };
}

export const INITIAL_DEMO_TASKS = [
  {
    id: '1',
    titre: 'Préparer la présentation',
    description: 'Réaliser les diapositives pour la présentation du projet.',
    priorite: 'Élevée',
    statut: 'À faire',
    date_creation: '12/04/2025',
    attachments: [
      {
        id: 'demo_att_1',
        name: 'plan_presentation.pdf',
        type: 'pdf',
        mimeType: 'application/pdf',
        size: 245000,
        uri: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
        source: 'document',
      },
    ],
    reminder: {
      datetime: '2026-11-20T14:30:00.000Z',
      note: 'Répéter les diapositives avec l’équipe',
    },
    observers: [
      { id: 'obs_1', name: 'Professeur', addedAt: '2026-11-12T10:00:00.000Z' },
    ],
    comments: [
      {
        id: 'cmt_1',
        author: 'Aziz Beji',
        text: 'Structure du projet et diapositives prêtes pour la revue.',
        createdAt: '2026-11-13T09:15:00.000Z',
      },
    ],
  },
  {
    id: '2',
    titre: 'Répondre aux emails',
    description: 'Traiter les messages urgents des clients et partenaires.',
    priorite: 'Moyenne',
    statut: 'À faire',
    date_creation: '11/04/2025',
    attachments: [
      {
        id: 'demo_att_2',
        name: 'capture_reunion.jpg',
        type: 'image',
        mimeType: 'image/jpeg',
        size: 154000,
        uri: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=500&q=80',
        source: 'camera',
      },
    ],
    location: {
      latitude: 36.8065,
      longitude: 10.1815,
      address: 'Avenue Habib Bourguiba, Tunis, Tunisie',
    },
    observers: [],
    comments: [],
  },
  {
    id: '3',
    titre: 'Lire la documentation',
    description: 'Étudier les fonctionnalités avancées de React Native et AsyncStorage.',
    priorite: 'Faible',
    statut: 'Terminée',
    date_creation: '10/04/2025',
  },
  {
    id: '4',
    titre: 'Développer la fonctionnalité',
    description: 'Implémenter la persistance locale et la navigation multi-écrans.',
    priorite: 'Élevée',
    statut: 'À faire',
    date_creation: '09/04/2025',
  },
  {
    id: '5',
    titre: 'Tester sur mobile & web',
    description: 'Vérifier la fluidité sur Expo Go et le navigateur web.',
    priorite: 'Faible',
    statut: 'Terminée',
    date_creation: '08/04/2025',
  },
];
