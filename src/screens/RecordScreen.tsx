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
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useChildren } from '../hooks/useChild'
import { useAddMeasurement } from '../hooks/useMeasurements'
import { COLORS } from '../navigation/theme'

const positiveNum = z
  .string()
  .min(1, 'Campo obrigatório')
  .refine((v) => !isNaN(Number(v)) && Number(v) > 0, 'Deve ser um número positivo')

const schema = z
  .object({
    weight: z.string().optional(),
    height: z.string().optional(),
    bpm: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    const filled = [data.weight, data.height, data.bpm].filter((v) => v && v.trim() !== '')
    if (filled.length === 0) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Preencha ao menos um campo', path: ['weight'] })
    }
    if (data.weight && data.weight.trim()) {
      const n = Number(data.weight)
      if (isNaN(n) || n <= 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Deve ser positivo', path: ['weight'] })
    }
    if (data.height && data.height.trim()) {
      const n = Number(data.height)
      if (isNaN(n) || n <= 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Deve ser positivo', path: ['height'] })
    }
    if (data.bpm && data.bpm.trim()) {
      const n = Number(data.bpm)
      if (isNaN(n) || n <= 0) ctx.addIssue({ code: z.ZodIssueCode.custom, message: 'Deve ser positivo', path: ['bpm'] })
    }
  })

type FormData = z.infer<typeof schema>

export default function RecordScreen() {
  const { data: children, isLoading: loadingChildren } = useChildren()
  const child = children?.[0]
  const addMeasurement = useAddMeasurement(child?.id ?? '')

  const [date, setDate] = useState(new Date())
  const [showPicker, setShowPicker] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const formatLocalDate = (d: Date) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const onSubmit = async (values: FormData) => {
    if (!child) return
    const dateStr = formatLocalDate(date)
    const tasks: Promise<any>[] = []

    if (values.weight?.trim()) {
      tasks.push(addMeasurement.mutateAsync({ type: 'WEIGHT', value: Number(values.weight), date: dateStr, unit: 'g' }))
    }
    if (values.height?.trim()) {
      tasks.push(addMeasurement.mutateAsync({ type: 'HEIGHT', value: Number(values.height), date: dateStr, unit: 'cm' }))
    }
    if (values.bpm?.trim()) {
      tasks.push(addMeasurement.mutateAsync({ type: 'BPM', value: Number(values.bpm), date: dateStr, unit: 'bpm' }))
    }

    try {
      await Promise.all(tasks)
      Alert.alert('Sucesso', 'Medições registradas!')
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
    <ScrollView style={styles.screen} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <Text style={styles.sectionTitle}>Nova medição</Text>
      <Text style={styles.sectionSub}>Preencha os campos disponíveis. Cada campo é registrado individualmente.</Text>

      <View style={styles.fieldsRow}>
        <View style={styles.fieldCol}>
          <Text style={styles.fieldLabel}>⚖️  Peso (g)</Text>
          <Controller
            control={control}
            name="weight"
            render={({ field: { onChange, value, onBlur } }) => (
              <TextInput
                style={[styles.measureInput, errors.weight && styles.inputError]}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                placeholder="Ex: 500"
                placeholderTextColor={COLORS.muted}
                keyboardType="numeric"
              />
            )}
          />
          {errors.weight && <Text style={styles.errorText}>{errors.weight.message}</Text>}
        </View>

        <View style={styles.fieldCol}>
          <Text style={styles.fieldLabel}>📏 Altura (cm)</Text>
          <Controller
            control={control}
            name="height"
            render={({ field: { onChange, value, onBlur } }) => (
              <TextInput
                style={[styles.measureInput, errors.height && styles.inputError]}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                placeholder="Ex: 30"
                placeholderTextColor={COLORS.muted}
                keyboardType="numeric"
              />
            )}
          />
          {errors.height && <Text style={styles.errorText}>{errors.height.message}</Text>}
        </View>

        <View style={styles.fieldCol}>
          <Text style={styles.fieldLabel}>❤️  BPM</Text>
          <Controller
            control={control}
            name="bpm"
            render={({ field: { onChange, value, onBlur } }) => (
              <TextInput
                style={[styles.measureInput, errors.bpm && styles.inputError]}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                placeholder="Ex: 140"
                placeholderTextColor={COLORS.muted}
                keyboardType="numeric"
              />
            )}
          />
          {errors.bpm && <Text style={styles.errorText}>{errors.bpm.message}</Text>}
        </View>

        <View style={styles.fieldCol}>
          <Text style={styles.fieldLabel}>📅 Data</Text>
          <TouchableOpacity style={styles.measureInput} onPress={() => setShowPicker(true)}>
            <Text style={styles.dateText}>{date.toLocaleDateString('pt-BR')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {showPicker && (
        <DateTimePicker
          value={date}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={new Date()}
          onChange={(_, selected) => {
            setShowPicker(Platform.OS === 'ios')
            if (selected) setDate(selected)
          }}
        />
      )}

      <TouchableOpacity
        style={[styles.button, addMeasurement.isPending && styles.buttonDisabled]}
        onPress={handleSubmit(onSubmit)}
        disabled={addMeasurement.isPending}
      >
        {addMeasurement.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Salvar medições</Text>
        )}
      </TouchableOpacity>
    </ScrollView>
  )
}

const FIELD_HEIGHT = 48

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: COLORS.background },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 4 },
  sectionSub: { fontSize: 13, color: COLORS.textSecondary, marginBottom: 24, lineHeight: 18 },
  fieldsRow: { gap: 16 },
  fieldCol: { marginBottom: 4 },
  fieldLabel: { fontSize: 14, fontWeight: '600', color: COLORS.text, marginBottom: 8 },
  measureInput: {
    height: FIELD_HEIGHT,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 16,
    color: COLORS.text,
    backgroundColor: COLORS.surface,
    justifyContent: 'center',
  },
  inputError: { borderColor: COLORS.error },
  errorText: { fontSize: 12, color: COLORS.error, marginTop: 4 },
  dateText: { fontSize: 16, color: COLORS.text, lineHeight: FIELD_HEIGHT - 2 },
  button: {
    height: 52,
    backgroundColor: COLORS.primary,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 28,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  noChildText: { fontSize: 15, color: COLORS.textSecondary, textAlign: 'center', lineHeight: 22 },
})
