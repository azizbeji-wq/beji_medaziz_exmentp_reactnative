import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export default function StatsSummary({ total = 0, terminees = 0, aFaire = 0, style }) {
  return (
    <View style={[styles.container, style]}>
      {/* Carte Total */}
      <View style={[styles.statCard, styles.cardTotal]}>
        <View style={styles.cardHeader}>
          <Text style={styles.statLabel}>Total</Text>
          <View style={[styles.iconBadge, { backgroundColor: '#E2E8F0' }]}>
            <Ionicons name="layers-outline" size={14} color="#475569" />
          </View>
        </View>
        <Text style={[styles.statValue, { color: '#1E293B' }]}>{total}</Text>
      </View>

      {/* Carte Terminées */}
      <View style={[styles.statCard, styles.cardTerminees]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.statLabel, { color: '#15803D' }]}>Terminées</Text>
          <View style={[styles.iconBadge, { backgroundColor: '#BBF7D0' }]}>
            <Ionicons name="checkmark-circle-outline" size={14} color="#16A34A" />
          </View>
        </View>
        <Text style={[styles.statValue, { color: '#16A34A' }]}>{terminees}</Text>
      </View>

      {/* Carte À faire */}
      <View style={[styles.statCard, styles.cardAFaire]}>
        <View style={styles.cardHeader}>
          <Text style={[styles.statLabel, { color: '#B45309' }]}>À faire</Text>
          <View style={[styles.iconBadge, { backgroundColor: '#FDE68A' }]}>
            <Ionicons name="time-outline" size={14} color="#D97706" />
          </View>
        </View>
        <Text style={[styles.statValue, { color: '#D97706' }]}>{aFaire}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginHorizontal: 16,
    marginVertical: 12,
  },
  statCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderRadius: 14,
    borderWidth: 1,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  cardTotal: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  cardTerminees: {
    backgroundColor: '#DCFCE7',
    borderColor: '#BBF7D0',
  },
  cardAFaire: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  statLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  iconBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: {
    fontSize: 26,
    fontWeight: '800',
    letterSpacing: -0.5,
  },
});
