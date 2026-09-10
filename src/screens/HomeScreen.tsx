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
  Modal,
} from 'react-native'
import { Baby, Leaf, User, Share2, Pencil, Check, X, Plus } from 'lucide-react-native'
import { DateField } from '../components/DateField'
import { useChildren, useCreateChild, useUpdateChild, useJoinChild } from '../hooks/useChild'
import { useAuth } from '../context/AuthContext'
import { COLORS } from '../navigation/theme'
import type { Child, Sex } from '../types'

const SEX_OPTIONS: { value: Sex; label: string }[] = [
  { value: 'MALE', label: 'Menino' },
  { value: 'FEMALE', label: 'Menina' },
  { value: 'UNKNOWN', label: 'Não definido' },
]

function formatDate(iso: string | null) {
  if (!iso) return '–'
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
}

function SexSelector({ value, onChange }: { value: Sex; onChange: (s: Sex) => void }) {
  return (
    <View style={styles.sexRow}>
      {SEX_OPTIONS.map((opt) => {
        const active = value === opt.value
        return (
          <TouchableOpacity
            key={opt.value}
            style={[styles.sexChip, active && styles.sexChipActive]}
            onPress={() => onChange(opt.value)}
          >
            <Text style={[styles.sexChipText, active && styles.sexChipTextActive]}>
              {opt.label}
            </Text>
          </TouchableOpacity>
        )
      })}
    </View>
  )
}

function ChildCard({ child }: { child: Child }) {
  const [editing, setEditing] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [editName, setEditName] = useState(child.name ?? '')
  const [editSex, setEditSex] = useState<Sex>(child.sex ?? 'UNKNOWN')
  const [editDueDate, setEditDueDate] = useState<Date | null>(
    child.dueDate ? new Date(child.dueDate.split('T')[0]) : null
  )

  const updateChild = useUpdateChild(child.id)

  const shareInvite = async () => {
    await Share.share({
      message: `Use o código ${child.inviteCode} no app Meu Filho para acompanhar nosso bebê!`,
    })
  }

  const handleSave = async () => {
    try {
      await updateChild.mutateAsync({
        name: editName.trim() || undefined,
        dueDate: editDueDate ? editDueDate.toISOString() : undefined,
        sex: editSex,
      })
      setEditing(false)
    } catch (err: any) {
      Alert.alert('Erro', err?.response?.data?.message ?? 'Não foi possível salvar')
    }
  }

  const handleCancel = () => {
    setEditName(child.name ?? '')
    setEditSex(child.sex ?? 'UNKNOWN')
    setEditDueDate(child.dueDate ? new Date(child.dueDate.split('T')[0]) : null)
    setEditing(false)
  }

  if (editing) {
    return (
      <View style={[styles.childCard, styles.childCardEdit]}>
        <View style={styles.cardHeader}>
          <Text style={styles.formTitle}>Editar bebê</Text>
          <TouchableOpacity onPress={handleCancel} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>

        <Text style={styles.fieldLabel}>Nome (opcional)</Text>
        <TextInput
          style={styles.input}
          value={editName}
          onChangeText={setEditName}
          placeholder="Nome do bebê"
          placeholderTextColor={COLORS.muted}
        />

        <Text style={styles.fieldLabel}>Sexo</Text>
        <SexSelector value={editSex} onChange={setEditSex} />

        <Text style={styles.fieldLabel}>Data prevista de nascimento</Text>
        <DateField value={editDueDate} onChange={setEditDueDate} />

        <TouchableOpacity
          style={[styles.button, updateChild.isPending && styles.buttonDisabled]}
          onPress={handleSave}
          disabled={updateChild.isPending}
        >
          {updateChild.isPending ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <View style={styles.btnInner}>
              <Check size={16} color="#fff" />
              <Text style={styles.buttonText}>Salvar</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.childCard}>
      <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
        <Pencil size={16} color={COLORS.textSecondary} />
      </TouchableOpacity>

      <View style={styles.childIconContainer}>
        <Baby size={40} color={COLORS.primary} />
      </View>
      <Text style={styles.childName}>{child.name ?? 'Nosso bebê'}</Text>

      {child.sex !== 'UNKNOWN' && (
        <View style={styles.sexBadge}>
          <Text style={styles.sexBadgeText}>
            {child.sex === 'MALE' ? 'Menino' : 'Menina'}
          </Text>
        </View>
      )}

      {child.dueDate && (
        <Text style={styles.childDue}>Previsão: {formatDate(child.dueDate)}</Text>
      )}

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

      <TouchableOpacity style={styles.inviteBtn} onPress={() => setShowInvite(true)}>
        <Share2 size={14} color={COLORS.primary} />
        <Text style={styles.inviteBtnText}>Convidar parceiro(a)</Text>
      </TouchableOpacity>

      <Modal visible={showInvite} transparent animationType="fade" onRequestClose={() => setShowInvite(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowInvite(false)}>
          <TouchableOpacity style={styles.modalCard} activeOpacity={1}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Código de convite</Text>
              <TouchableOpacity onPress={() => setShowInvite(false)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <X size={20} color={COLORS.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSub}>Compartilhe este código com o(a) parceiro(a) para que ele(a) acesse o perfil do bebê.</Text>
            <View style={styles.codeBox}>
              <Text style={styles.codeText}>{child.inviteCode}</Text>
            </View>
            <TouchableOpacity style={styles.shareBtn} onPress={shareInvite}>
              <Share2 size={16} color="#fff" />
              <Text style={styles.shareBtnText}>Compartilhar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  )
}

function AddChildSection() {
  const [mode, setMode] = useState<'closed' | 'choose' | 'create' | 'join'>('closed')
  const [name, setName] = useState('')
  const [sex, setSex] = useState<Sex>('UNKNOWN')
  const [dueDate, setDueDate] = useState<Date | null>(null)
  const [inviteCode, setInviteCode] = useState('')

  const createMutation = useCreateChild()
  const joinMutation = useJoinChild()

  const reset = () => {
    setName('')
    setSex('UNKNOWN')
    setDueDate(null)
    setInviteCode('')
    setMode('closed')
  }

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync({
        name: name.trim() || undefined,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
        sex,
      })
      reset()
    } catch (err: any) {
      Alert.alert('Erro', err?.response?.data?.message ?? 'Não foi possível criar')
    }
  }

  const handleJoin = async () => {
    const code = inviteCode.trim().toUpperCase()
    if (code.length !== 8) { Alert.alert('Código inválido', 'O código deve ter 8 caracteres'); return }
    try {
      await joinMutation.mutateAsync(code)
      reset()
    } catch (err: any) {
      Alert.alert('Erro', err?.response?.data?.message ?? 'Código inválido ou expirado')
    }
  }

  if (mode === 'closed') {
    return (
      <TouchableOpacity style={styles.addChildBtn} onPress={() => setMode('choose')}>
        <Plus size={16} color={COLORS.primary} />
        <Text style={styles.addChildBtnText}>Adicionar outro bebê</Text>
      </TouchableOpacity>
    )
  }

  if (mode === 'choose') {
    return (
      <View style={styles.formCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.formTitle}>Adicionar bebê</Text>
          <TouchableOpacity onPress={reset} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
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
        <View style={styles.cardHeader}>
          <Text style={styles.formTitle}>Código de convite</Text>
          <TouchableOpacity onPress={() => setMode('choose')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <X size={20} color={COLORS.textSecondary} />
          </TouchableOpacity>
        </View>
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
          {joinMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
        </TouchableOpacity>
      </View>
    )
  }

  return (
    <View style={styles.formCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.formTitle}>Novo bebê</Text>
        <TouchableOpacity onPress={() => setMode('choose')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <X size={20} color={COLORS.textSecondary} />
        </TouchableOpacity>
      </View>

      <Text style={styles.fieldLabel}>Nome (opcional)</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Nome do bebê"
        placeholderTextColor={COLORS.muted}
      />

      <Text style={styles.fieldLabel}>Sexo</Text>
      <SexSelector value={sex} onChange={setSex} />

      <Text style={styles.fieldLabel}>Data prevista de nascimento (opcional)</Text>
      <DateField value={dueDate} onChange={setDueDate} />

      <TouchableOpacity
        style={[styles.button, createMutation.isPending && styles.buttonDisabled]}
        onPress={handleCreate}
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Criar</Text>}
      </TouchableOpacity>
    </View>
  )
}

function EmptyState() {
  const [mode, setMode] = useState<'choose' | 'create' | 'join'>('choose')
  const [name, setName] = useState('')
  const [sex, setSex] = useState<Sex>('UNKNOWN')
  const [dueDate, setDueDate] = useState<Date | null>(null)
  const [inviteCode, setInviteCode] = useState('')

  const createMutation = useCreateChild()
  const joinMutation = useJoinChild()

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync({
        name: name.trim() || undefined,
        dueDate: dueDate ? dueDate.toISOString() : undefined,
        sex,
      })
    } catch (err: any) {
      Alert.alert('Erro', err?.response?.data?.message ?? 'Não foi possível criar')
    }
  }

  const handleJoin = async () => {
    const code = inviteCode.trim().toUpperCase()
    if (code.length !== 8) { Alert.alert('Código inválido', 'O código deve ter 8 caracteres'); return }
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
          {joinMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Entrar</Text>}
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

      <Text style={styles.fieldLabel}>Sexo</Text>
      <SexSelector value={sex} onChange={setSex} />

      <Text style={styles.fieldLabel}>Data prevista de nascimento (opcional)</Text>
      <DateField value={dueDate} onChange={setDueDate} />

      <TouchableOpacity
        style={[styles.button, createMutation.isPending && styles.buttonDisabled]}
        onPress={handleCreate}
        disabled={createMutation.isPending}
      >
        {createMutation.isPending ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Criar</Text>}
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

  const hasChildren = children && children.length > 0

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.scrollContent}>
      <View style={styles.scrollInner}>
      <View style={styles.topBar}>
        <Text style={styles.greeting}>Olá, {user?.name?.split(' ')[0]}</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </View>

      {hasChildren ? (
        <>
          {children.map((child) => (
            <ChildCard key={child.id} child={child} />
          ))}
          <AddChildSection />
        </>
      ) : (
        <EmptyState />
      )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.background },
  scrollContent: { flexGrow: 1, padding: 20, paddingBottom: 40, alignItems: 'center' },
  scrollInner: { width: '100%', maxWidth: 680 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.background },
  topBar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 18, fontWeight: '600', color: COLORS.text },
  logoutText: { fontSize: 14, color: COLORS.textSecondary },
  childCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  childCardEdit: { alignItems: 'stretch' },
  cardHeader: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  editBtn: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 6,
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
  sexBadge: {
    marginTop: 6,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 20,
  },
  sexBadgeText: { fontSize: 12, fontWeight: '600', color: COLORS.text },
  childDue: { fontSize: 14, color: COLORS.textSecondary, marginTop: 4 },
  inviteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  inviteBtnText: { fontSize: 13, color: COLORS.primary, fontWeight: '600' },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text },
  modalSub: { fontSize: 13, color: COLORS.textSecondary, lineHeight: 18, marginBottom: 20 },
  codeBox: {
    backgroundColor: COLORS.background,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  codeText: { fontSize: 32, fontWeight: '800', color: COLORS.primary, letterSpacing: 6 },
  shareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
  },
  shareBtnText: { fontSize: 15, color: '#fff', fontWeight: '600' },
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
  addChildBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderWidth: 1.5,
    borderColor: COLORS.primary,
    borderRadius: 12,
    borderStyle: 'dashed',
    marginTop: 4,
  },
  addChildBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.primary },
  formCard: {
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    padding: 24,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 2,
  },
  formTitle: { fontSize: 20, fontWeight: '700', color: COLORS.text },
  fieldLabel: { fontSize: 13, fontWeight: '500', color: COLORS.textSecondary, marginBottom: 6, marginTop: 12 },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    fontSize: 15,
    color: COLORS.text,
    backgroundColor: COLORS.background,
  },
  sexRow: { flexDirection: 'row', gap: 8 },
  sexChip: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    alignItems: 'center',
    backgroundColor: COLORS.surface,
  },
  sexChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  sexChipText: { fontSize: 12, fontWeight: '600', color: COLORS.textSecondary },
  sexChipTextActive: { color: '#fff' },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    paddingVertical: 14,
    paddingHorizontal: 32,
  },
  buttonDisabled: { opacity: 0.7 },
  btnInner: { flexDirection: 'row', alignItems: 'center', gap: 8 },
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
