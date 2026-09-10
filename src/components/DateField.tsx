import DateTimePicker from '@react-native-community/datetimepicker'
import React, { useRef, useState } from 'react'
import { Platform, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { COLORS } from '../navigation/theme'

interface Props {
  value: Date | null
  onChange: (date: Date) => void
  placeholder?: string
  format?: (date: Date) => string
  maximumDate?: Date
  minimumDate?: Date
}

export function DateField({ value, onChange, placeholder = 'Selecionar data', format, maximumDate, minimumDate }: Props) {
  const [show, setShow] = useState(false)
  const webInputRef = useRef<any>(null)

  const label = value
    ? (format ? format(value) : value.toLocaleDateString('pt-BR'))
    : placeholder

  const webValue = value ? value.toISOString().split('T')[0] : ''
  const webMax = maximumDate ? maximumDate.toISOString().split('T')[0] : undefined
  const webMin = minimumDate ? minimumDate.toISOString().split('T')[0] : undefined

  const handleWebPress = () => {
    const el = webInputRef.current
    if (!el) return
    if (typeof el.showPicker === 'function') {
      el.showPicker()
    } else {
      el.click()
    }
  }

  if (Platform.OS === 'web') {
    return (
      <View>
        <TouchableOpacity style={styles.field} onPress={handleWebPress}>
          <Text style={[styles.fieldText, !value && styles.placeholder]}>{label}</Text>
        </TouchableOpacity>
        {/* @ts-ignore — HTML input para web */}
        <input
          ref={webInputRef}
          type="date"
          value={webValue}
          max={webMax}
          min={webMin}
          onChange={(e: any) => {
            if (e.target.value) onChange(new Date(e.target.value + 'T12:00:00'))
          }}
          style={{ position: 'fixed', opacity: 0, pointerEvents: 'none', width: 0, height: 0 }}
        />
      </View>
    )
  }

  return (
    <>
      <TouchableOpacity style={styles.field} onPress={() => setShow(v => !v)}>
        <Text style={[styles.fieldText, !value && styles.placeholder]}>{label}</Text>
      </TouchableOpacity>
      {show && (
        <DateTimePicker
          value={value ?? new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onValueChange={(_, selected) => {
            if (Platform.OS !== 'ios') setShow(false)
            if (selected) onChange(selected)
          }}
          onDismiss={() => setShow(false)}
        />
      )}
      {show && Platform.OS === 'ios' && (
        <TouchableOpacity style={styles.confirm} onPress={() => setShow(false)}>
          <Text style={styles.confirmText}>Confirmar data</Text>
        </TouchableOpacity>
      )}
    </>
  )
}

const styles = StyleSheet.create({
  field: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    backgroundColor: COLORS.background,
  },
  fieldText: { fontSize: 15, color: COLORS.text },
  placeholder: { color: COLORS.muted },
  confirm: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  confirmText: { color: '#fff', fontWeight: '600', fontSize: 15 },
})
