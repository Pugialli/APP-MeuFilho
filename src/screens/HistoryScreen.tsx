import React, { useState } from 'react'
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native'
import { Scale, Ruler, Heart, Trash2, ClipboardList } from 'lucide-react-native'
import { useChildren } from '../hooks/useChild'
import { useMeasurements, useDeleteMeasurement } from '../hooks/useMeasurements'
import { COLORS } from '../navigation/theme'
import type { Measurement, MeasurementType } from '../types'

const TABS: { label: string; value: MeasurementType | undefined }[] = [
  { label: 'Todos', value: undefined },
  { label: 'Peso', value: 'WEIGHT' },
  { label: 'Altura', value: 'HEIGHT' },
  { label: 'BPM', value: 'BPM' },
]

type LucideIcon = React.ComponentType<{ size?: number; color?: string }>

const ICONS: Record<MeasurementType, LucideIcon> = {
  WEIGHT: Scale,
  HEIGHT: Ruler,
  BPM: Heart,
}

const TYPE_LABELS: Record<MeasurementType, string> = {
  WEIGHT: 'Peso',
  HEIGHT: 'Altura',
  BPM: 'BPM',
}

function MeasurementItem({
  item,
  onDelete,
}: {
  item: Measurement
  onDelete: (id: string) => void
}) {
  const Icon = ICONS[item.type]

  const handleDelete = () => {
    Alert.alert('Excluir medição', 'Deseja excluir esta medição?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Excluir', style: 'destructive', onPress: () => onDelete(item.id) },
    ])
  }

  return (
    <View style={styles.measureItem}>
      <View style={styles.measureLeft}>
        <View style={styles.iconContainer}>
          <Icon size={20} color={COLORS.primary} />
        </View>
        <View style={styles.measureInfo}>
          <Text style={styles.measureType}>{TYPE_LABELS[item.type]}</Text>
          <Text style={styles.measureBy} numberOfLines={1} ellipsizeMode="tail">por {item.recordedBy.name}</Text>
        </View>
      </View>
      <View style={styles.measureRight}>
        <Text style={styles.measureValue}>
          {item.value} <Text style={styles.measureUnit}>{item.unit}</Text>
        </Text>
        <TouchableOpacity onPress={handleDelete} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Trash2 size={18} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </View>
  )
}

function groupByDate(measurements: Measurement[]): { date: string; items: Measurement[] }[] {
  const map = new Map<string, Measurement[]>()
  for (const m of measurements) {
    const existing = map.get(m.date) ?? []
    existing.push(m)
    map.set(m.date, existing)
  }
  return Array.from(map.entries()).map(([date, items]) => ({ date, items }))
}

function formatGroupDate(dateStr: string) {
  const datePart = dateStr.split('T')[0]
  const [year, month, day] = datePart.split('-').map(Number)
  const d = new Date(year, month - 1, day)
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })
}

export default function HistoryScreen() {
  const [activeTab, setActiveTab] = useState<MeasurementType | undefined>(undefined)
  const { data: children, isLoading: loadingChild } = useChildren()
  const child = children?.[0]

  const { data: measurements, isLoading, isRefetching, refetch } = useMeasurements(child?.id ?? '', {
    type: activeTab,
  })
  const deleteMeasurement = useDeleteMeasurement(child?.id ?? '')

  const handleDelete = async (id: string) => {
    try {
      await deleteMeasurement.mutateAsync(id)
    } catch (err: any) {
      Alert.alert('Erro', err?.response?.data?.message ?? 'Não foi possível excluir')
    }
  }

  if (loadingChild || isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  if (!child) {
    return (
      <View style={styles.center}>
        <Text style={styles.noChildText}>Cadastre ou entre em um perfil de bebê primeiro na aba Bebê.</Text>
      </View>
    )
  }

  const grouped = groupByDate(measurements ?? [])

  return (
    <View style={styles.screen}>
      <View style={styles.inner}>
      <View style={styles.tabs}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={String(tab.value)}
            style={[styles.tab, activeTab === tab.value && styles.tabActive]}
            onPress={() => setActiveTab(tab.value)}
          >
            <Text style={[styles.tabText, activeTab === tab.value && styles.tabTextActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={grouped}
        keyExtractor={(item) => item.date}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefetching} onRefresh={refetch} tintColor={COLORS.primary} />
        }
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <ClipboardList size={48} color={COLORS.muted} />
            <Text style={styles.emptyText}>Nenhuma medição encontrada</Text>
          </View>
        }
        renderItem={({ item: group }) => (
          <View style={styles.dateGroup}>
            <Text style={styles.dateHeader}>{formatGroupDate(group.date)}</Text>
            {group.items.map((m) => (
              <MeasurementItem key={m.id} item={m} onDelete={handleDelete} />
            ))}
          </View>
        )}
      />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background, alignItems: 'center' },
  inner: { width: '100%', maxWidth: 680, flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: COLORS.background },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  tabActive: { backgroundColor: COLORS.primary },
  tabText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  tabTextActive: { color: '#fff' },
  listContent: { padding: 16, paddingBottom: 40 },
  dateGroup: { marginBottom: 20 },
  dateHeader: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textSecondary,
    textTransform: 'capitalize',
    marginBottom: 10,
  },
  measureItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.surface,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  measureLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  measureInfo: { flex: 1 },
  measureType: { fontSize: 15, fontWeight: '600', color: COLORS.text },
  measureBy: { fontSize: 12, color: COLORS.textSecondary, marginTop: 2 },
  measureRight: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  measureValue: { fontSize: 18, fontWeight: '700', color: COLORS.primary },
  measureUnit: { fontSize: 12, fontWeight: '400', color: COLORS.textSecondary },
  emptyState: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyText: { fontSize: 15, color: COLORS.textSecondary },
  noChildText: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
})
