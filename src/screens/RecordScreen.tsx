import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  Platform,
  Keyboard,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Scale, Ruler, Heart, Calendar } from 'lucide-react-native'
import { useChildren } from '../hooks/useChild'
import { useAddMeasurement } from '../hooks/useMeasurements'
import { COLORS } from '../navigation/theme'
import type { MeasurementType } from '../types'

const TYPES = [
  { type: 'WEIGHT' as MeasurementType, label: 'Peso', unit: 'g', placeholder: 'Ex: 3500', Icon: Scale },
  { type: 'HEIGHT' as MeasurementType, label: 'Altura', unit: 'cm', placeholder: 'Ex: 50', Icon: Ruler },
  { type: 'BPM' as MeasurementType, label: 'BPM', unit: 'bpm', placeholder: 'Ex: 140', Icon: Heart },
]

const schema = z.object({
  value: z
    .string()
    .min(1, 'Campo obrigatório')
    .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Deve ser um número positivo'),
})

type FormData = z.infer<typeof schema>

export default function RecordScreen() {
  const { data: children, isLoading: loadingChildren } = useChildren()
  const child = children?.[0]
  const addMeasurement = useAddMeasurement(child?.id ?? '')

  const [selectedType, setSelectedType] = useState<MeasurementType>('WEIGHT')
  const [date, setDate] = useState(new Date())
  const [showPicker, setShowPicker] = useState(false)

  const { control, handleSubmit, reset, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  })

  const activeType = TYPES.find((t) => t.type === selectedType)!

  const formatLocalDate = (d: Date) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const onSubmit = async (values: FormData) => {
    if (!child) return
    try {
      await addMeasurement.mutateAsync({
        type: selectedType,
        value: Number(values.value),
        date: formatLocalDate(date),
        unit: activeType.unit,
      })
      Alert.alert('Sucesso', `${activeType.label} registrado!`)
      reset()
    } catch (err: any) {
      Alert.alert('Erro', err?.response?.data?.message ?? 'Não foi possível salvar')
    }
  }

  if (loadingChildren) {
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

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.sectionTitle}>Nova medição</Text>
      <Text style={styles.sectionSub}>Selecione o tipo e informe o valor.</Text>

      {/* Type selector */}
      <View style={styles.typeRow}>
        {TYPES.map(({ type, label, Icon }) => {
          const active = selectedType === type
          return (
            <TouchableOpacity
              key={type}
              style={[styles.typeChip, active && styles.typeChipActive]}
              onPress={() => {
                setSelectedType(type)
                reset()
              }}
            >
              <Icon size={16} color={active ? '#fff' : COLORS.textSecondary} />
              <Text style={[styles.typeChipText, active && styles.typeChipTextActive]}>{label}</Text>
            </TouchableOpacity>
          )
        })}
      </View>

      {/* Value input */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>
          {activeType.label} ({activeType.unit})
        </Text>
        <Controller
          control={control}
          name="value"
          render={({ field: { onChange, value, onBlur } }) => (
            <TextInput
              style={[styles.input, errors.value && styles.inputError]}
              onChangeText={onChange}
              onBlur={onBlur}
              value={value}
              placeholder={activeType.placeholder}
              placeholderTextColor={COLORS.muted}
              keyboardType="numeric"
              returnKeyType="done"
              onSubmitEditing={Keyboard.dismiss}
              blurOnSubmit
            />
          )}
        />
        {errors.value && <Text style={styles.errorText}>{errors.value.message}</Text>}
      </View>

      {/* Date field */}
      <View style={styles.fieldGroup}>
        <Text style={styles.fieldLabel}>Data</Text>
        <TouchableOpacity
          style={styles.dateField}
          onPress={() => {
            Keyboard.dismiss()
            setShowPicker((v) => !v)
          }}
        >
          <Text style={styles.dateText}>
            {date.toLocaleDateString('pt-BR', {
              weekday: 'long',
              day: '2-digit',
              month: 'long',
              year: 'numeric',
            })}
          </Text>
          <Calendar size={18} color={COLORS.muted} />
        </TouchableOpacity>
      </View>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          maximumDate={new Date()}
          onValueChange={(_, selected) => {
            if (Platform.OS !== 'ios') setShowPicker(false)
            setDate(selected)
          }}
          onDismiss={() => setShowPicker(false)}
          style={styles.datePicker}
        />
      )}
      {showPicker && Platform.OS === 'ios' && (
        <TouchableOpacity style={styles.confirmDateBtn} onPress={() => setShowPicker(false)}>
          <Text style={styles.confirmDateBtnText}>Confirmar data</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.button, addMeasurement.isPending && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={addMeasurement.isPending}
      >
        {addMeasurement.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Salvar medição</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: COLORS.background },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  sectionSub: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 20, lineHeight: 18 },
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 24 },
  typeChip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    backgroundColor: COLORS.surface,
  },
  typeChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  typeChipText: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary },
  typeChipTextActive: { color: '#fff' },
  fieldGroup: { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: COLORS.textSecondary, marginBottom: 8 },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text,
    backgroundColor: COLORS.surface,
  },
  inputError: { borderColor: COLORS.error },
  errorText: { fontSize: 12, color: COLORS.error, marginTop: 4 },
  dateField: {
    height: 52,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.surface,
  },
  dateText: { fontSize: 14, color: COLORS.text, flex: 1, textTransform: 'capitalize' },
  datePicker: {
    backgroundColor: COLORS.surface,
    borderRadius: 12,
    marginBottom: 4,
  },
  confirmDateBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmDateBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  button: {
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  noChildText: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
})
