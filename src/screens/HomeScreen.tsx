import React, { useState } from 'react'
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  Share,
  Alert,
  Platform,
} from 'react-native'
import DateTimePicker from '@react-native-community/datetimepicker'
import { Baby, Leaf, User, Share2 } from 'lucide-react-native'
import { useChildren, useCreateChild, useJoinChild } from '../hooks/useChild'
import { useAuth } from '../context/AuthContext'
import { COLORS } from '../navigation/theme'
import type { Child } from '../types'

function formatDate(iso: string | null) {
  if (!iso) return '–'
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function ChildCard({ child }: { child: Child }) {
  const shareInvite = async () => {
    await Share.share({
      message: `Use o código ${child.inviteCode} no app Meu Filho para acompanhar nosso bebê!`,
    })
  }

  return (
    <View style={styles.childCard}>
      <View style={styles.childIconContainer}>
        <Baby size={40} color={COLORS.primary} />
      </View>
      <Text style={styles.childName}>{child.name ?? 'Nosso bebê'}</Text>
      {child.dueDate && (
        <Text style={styles.childDue}>Previsão: {formatDate(child.dueDate)}</Text>
      )}

      <View style={styles.inviteBox}>
        <Text style={styles.inviteLabel}>Código de convite</Text>
        <Text style={styles.inviteCode}>{child.inviteCode}</Text>
        <TouchableOpacity style={styles.shareBtn} onPress={shareInvite}>
          <Share2 size={14} color={COLORS.text} />
          <Text style={styles.shareBtnText}>Compartilhar com parceiro(a)</Text>
        </TouchableOpacity>
      </View>

      {child.members.length > 0 && (
        <View style={styles.membersBox}>
          <Text style={styles.membersLabel}>Responsáveis</Text>
          {child.members.map((m) => (
            <View key={m.id} style={styles.memberItem}>
              <User size={14} color={COLORS.textSecondary} />
              <Text style={styles.memberItemText}>{m.name}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

function EmptyState() {
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose')
  const [name, setName] = useState('')
  const [dueDate, setDueDate] = useState<Date | null>(null)
  const [showPicker, setShowPicker] = useState(false)
  const [inviteCode, setInviteCode] = useState('')

  const createMutation = useCreateChild()
  const joinMutation = useJoinChild()

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync({
        name: name.trim() || undefined,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
      })
    } catch (err: any) {
      Alert.alert('Erro', err?.response?.data?.message ?? 'Não foi possível criar')
    }
  }

  const handleJoin = async () => {
    const code = inviteCode.trim().toUpperCase()
    if (code.length !== 8) {
      Alert.alert('Código inválido', 'O código deve ter 8 caracteres')
      return
    }
    try {
      await joinMutation.mutateAsync(code)
    } catch (err: any) {
      Alert.alert('Erro', err?.response?.data?.message ?? 'Código inválido ou expirado')
    }
  }

  if (mode === 'choose') {
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <Leaf size={48} color={COLORS.primary} />
        </View>
        <Text style={styles.emptyTitle}>Bem-vindo ao Meu Filho</Text>
        <Text style={styles.emptySubtitle}>Crie um perfil para o bebê ou entre com um código de convite</Text>
        <TouchableOpacity style={styles.button} onPress={() => setMode('create')}>
          <Text style={styles.buttonText}>Criar perfil do bebê</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.outlineBtn} onPress={() => setMode('join')}>
          <Text style={styles.outlineBtnText}>Entrar com código</Text>
        </TouchableOpacity>
      </View>
    )
  }

  if (mode === 'join') {
    return (
      <View style={styles.formCard}>
        <Text style={styles.formTitle}>Código de convite</Text>
        <TextInput
          style={styles.input}
          value={inviteCode}
          onChangeText={(t) => setInviteCode(t.toUpperCase())}
          placeholder="Ex: XKPQ7MNR"
          placeholderTextColor={COLORS.muted}
          autoCapitalize="characters"
          maxLength={8}
        />
        <TouchableOpacity
          style={[styles.button, joinMutation.isPending && styles.buttonDisabled]}
          onPress={handleJoin}
          disabled={joinMutation.isPending}
        >
          {joinMutation.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Entrar</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.backLink} onPress={() => setMode('choose')}>
          <Text style={styles.backLinkText}>← Voltar</Text>
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.formCard}>
      <Text style={styles.formTitle}>Novo bebê</Text>

      <Text style={styles.fieldLabel}>Nome (opcional)</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Nome do bebê"
        placeholderTextColor={COLORS.muted}
      />

      <Text style={styles.fieldLabel}>Data prevista de nascimento (opcional)</Text>
      <TouchableOpacity style={styles.dateInput} onPress={() => setShowPicker((v) => !v)}>
        <Text style={[styles.dateInputText, !dueDate && { color: COLORS.muted }]}>
          {dueDate ? dueDate.toLocaleDateString('pt-BR') : 'Selecionar data'}
        </Text>
      </TouchableOpacity>

      {showPicker && (
        <DateTimePicker
          value={dueDate ?? new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'inline' : 'default'}
          onValueChange={(_, date) => {
            if (Platform.OS !== 'ios') setShowPicker(false)
            setDueDate(date)
          }}
          onDismiss={() => setShowPicker(false)}
        />
      )}
      {showPicker && Platform.OS === 'ios' && (
        <TouchableOpacity style={styles.confirmDateBtn} onPress={() => setShowPicker(false)}>
          <Text style={styles.confirmDateBtnText}>Confirmar data</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.button, createMutation.isPending && styles.buttonDisabled]}
        onPress={handleCreate}
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Criar</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity style={styles.backLink} onPress={() => setMode('choose')}>
        <Text style={styles.backLinkText}>← Voltar</Text>
      </TouchableOpacity>
    </View>
  )
}

export default function HomeScreen() {
  const { data: children, isLoading, isError, refetch } = useChildren()
  const { logout, user } = useAuth()

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    )
  }

  if (isError) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Erro ao carregar dados</Text>
        <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()}>
          <Text style={styles.retryBtnText}>Tentar novamente</Text>
        </TouchableOpacity>
      </View>
    )
  }

  const child = children?.[0]

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      <View style={styles.topBar}>
        <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0]}</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {child ? <ChildCard child={child} /> : <EmptyState />}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  logoutText: { fontSize: 14, color: COLORS.textSecondary },
  childCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  childIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  childName: { fontSize: 24, fontWeight: '700', color: COLORS.text, marginTop: 12 },
  childDue: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  inviteBox: {
    width: '100%',
    backgroundColor: COLORS.background,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  inviteLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 6 },
  inviteCode: { fontSize: 28, fontWeight: '800', color: COLORS.primary, letterSpacing: 4 },
  shareBtn: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryLight,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  shareBtnText: { fontSize: 13, color: COLORS.text, fontWeight: '600' },
  membersBox: { width: '100%', marginTop: 16 },
  membersLabel: { fontSize: 12, color: COLORS.textSecondary, marginBottom: 8 },
  memberItem: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingVertical: 4 },
  memberItemText: { fontSize: 14, color: COLORS.text },
  emptyState: { alignItems: 'center', paddingTop: 40 },
  emptyIconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.primaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: COLORS.text, marginTop: 16, textAlign: 'center' },
  emptySubtitle: { fontSize: 14, color: COLORS.textSecondary, marginTop: 8, textAlign: 'center', lineHeight: 20 },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  formTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text, marginBottom: 20 },
  fieldLabel: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary, marginBottom: 6, marginTop: 4 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.background,
    marginBottom: 12,
  },
  dateInput: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    justifyContent: 'center',
    backgroundColor: COLORS.background,
    marginBottom: 12,
  },
  dateInputText: { fontSize: 15, color: COLORS.text },
  confirmDateBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmDateBtnText: { color: '#fff', fontWeight: '600', fontSize: 15 },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  buttonDisabled: { opacity: 0.7 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  outlineBtn: {
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 12,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  outlineBtnText: { color: COLORS.primary, fontSize: 16, fontWeight: '600' },
  backLink: { marginTop: 16, alignItems: 'center' },
  backLinkText: { fontSize: 14, color: COLORS.textSecondary },
  errorText: { fontSize: 15, color: COLORS.error, marginBottom: 16 },
  retryBtn: { paddingHorizontal: 24, paddingVertical: 10, backgroundColor: COLORS.primary, borderRadius: 10 },
  retryBtnText: { color: '#fff', fontWeight: '600' },
})
