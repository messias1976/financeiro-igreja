import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useServerFn } from '@tanstack/react-start'
import {
  listUsersFn,
  createUserFn,
  deleteUserFn,
  seedDefaultUsersFn,
} from '@/server/functions/users'
import { toast } from 'sonner'

const ROLE_LABELS: Record<
  string,
  { label: string; color: string; icon: string }
> = {
  administrador: { label: 'Administrador', color: '#D4AF37', icon: '🛡️' },
  tesoureiro: { label: 'Tesoureiro', color: '#4ADE80', icon: '💰' },
  pastor: { label: 'Pastor', color: '#818CF8', icon: '✝️' },
  membro: { label: 'Membro', color: '#94A3B8', icon: '👤' },
}

const roleOptions = [
  { value: 'administrador', label: 'Administrador' },
  { value: 'tesoureiro', label: 'Tesoureiro' },
  { value: 'pastor', label: 'Pastor' },
]

export function GerenciarUsuarios() {
  const qc = useQueryClient()
  const listUsers = useServerFn(listUsersFn)
  const createUser = useServerFn(createUserFn)
  const deleteUser = useServerFn(deleteUserFn)
  const seedUsers = useServerFn(seedDefaultUsersFn)

  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    role: 'tesoureiro' as const,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: () => listUsers(),
  })

  const createMutation = useMutation({
    mutationFn: (payload: typeof form) => createUser({ data: payload }),
    onSuccess: () => {
      toast.success('Usuário criado com sucesso!')
      qc.invalidateQueries({ queryKey: ['users'] })
      setShowForm(false)
      setForm({ name: '', email: '', password: '', role: 'tesoureiro' })
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Erro ao criar usuário')
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (userId: string) => deleteUser({ data: { userId } }),
    onSuccess: () => {
      toast.success('Usuário removido!')
      qc.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Erro ao remover usuário')
    },
  })

  const seedMutation = useMutation({
    mutationFn: () => seedUsers(),
    onSuccess: (res) => {
      const criados = res.results.filter((r) => r.status === 'criado').length
      const existentes = res.results.filter(
        (r) => r.status === 'já existe',
      ).length
      toast.success(
        `${criados} usuário(s) criado(s), ${existentes} já existia(m).`,
      )
      qc.invalidateQueries({ queryKey: ['users'] })
    },
    onError: (err: { message?: string }) => {
      toast.error(err?.message ?? 'Erro ao criar usuários padrão')
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}
    if (!form.name || form.name.length < 2) newErrors.name = 'Nome obrigatório'
    if (!form.email || !form.email.includes('@'))
      newErrors.email = 'E-mail inválido'
    if (!form.password || form.password.length < 8)
      newErrors.password = 'Senha: mínimo 8 caracteres'
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    setErrors({})
    createMutation.mutate(form)
  }

  const users = data?.users ?? []

  return (
    <div style={{ fontFamily: "'Lato', sans-serif" }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 32,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <div>
          <h2
            style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 28,
              fontWeight: 700,
              color: '#F1E6C8',
              marginBottom: 4,
            }}
          >
            Gerenciar Usuários
          </h2>
          <p style={{ color: '#8A92A6', fontSize: 14 }}>
            {data?.total ?? 0} usuário(s) cadastrado(s)
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
            style={{
              padding: '10px 18px',
              borderRadius: 10,
              border: '1.5px solid #D4AF37',
              background: 'transparent',
              color: '#D4AF37',
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {seedMutation.isPending
              ? '⏳ Criando...'
              : '⚡ Criar Usuários Padrão'}
          </button>
          <button
            onClick={() => setShowForm(!showForm)}
            style={{
              padding: '10px 20px',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #D4AF37, #B8962E)',
              color: '#080E23',
              fontWeight: 700,
              fontSize: 14,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            {showForm ? '✕ Cancelar' : '+ Novo Usuário'}
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <div
          style={{
            background: 'linear-gradient(135deg, #0D1533 0%, #111A3E 100%)',
            border: '1.5px solid rgba(212,175,55,0.3)',
            borderRadius: 16,
            padding: 28,
            marginBottom: 28,
          }}
        >
          <h3
            style={{
              fontFamily: "'Playfair Display', serif",
              color: '#D4AF37',
              marginBottom: 20,
              fontSize: 18,
            }}
          >
            Novo Usuário
          </h3>
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 16,
              }}
            >
              <div>
                <label
                  style={{
                    color: '#8A92A6',
                    fontSize: 13,
                    display: 'block',
                    marginBottom: 6,
                  }}
                >
                  Nome completo
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Ex: João da Silva"
                  style={inputStyle}
                />
                {errors.name && (
                  <span style={{ color: '#F87171', fontSize: 12 }}>
                    {errors.name}
                  </span>
                )}
              </div>
              <div>
                <label
                  style={{
                    color: '#8A92A6',
                    fontSize: 13,
                    display: 'block',
                    marginBottom: 6,
                  }}
                >
                  E-mail
                </label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="email@igreja.com"
                  style={inputStyle}
                />
                {errors.email && (
                  <span style={{ color: '#F87171', fontSize: 12 }}>
                    {errors.email}
                  </span>
                )}
              </div>
              <div>
                <label
                  style={{
                    color: '#8A92A6',
                    fontSize: 13,
                    display: 'block',
                    marginBottom: 6,
                  }}
                >
                  Senha
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) =>
                    setForm({ ...form, password: e.target.value })
                  }
                  placeholder="Mínimo 8 caracteres"
                  style={inputStyle}
                />
                {errors.password && (
                  <span style={{ color: '#F87171', fontSize: 12 }}>
                    {errors.password}
                  </span>
                )}
              </div>
              <div>
                <label
                  style={{
                    color: '#8A92A6',
                    fontSize: 13,
                    display: 'block',
                    marginBottom: 6,
                  }}
                >
                  Perfil
                </label>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm({ ...form, role: e.target.value as 'tesoureiro' })
                  }
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  {roleOptions.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div
              style={{
                marginTop: 20,
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <button
                type="submit"
                disabled={createMutation.isPending}
                style={{
                  padding: '12px 28px',
                  borderRadius: 10,
                  border: 'none',
                  background: 'linear-gradient(135deg, #D4AF37, #B8962E)',
                  color: '#080E23',
                  fontWeight: 700,
                  fontSize: 14,
                  cursor: 'pointer',
                }}
              >
                {createMutation.isPending ? 'Criando...' : 'Criar Usuário'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* User Cards */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: 48, color: '#8A92A6' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
          <p>Carregando usuários...</p>
        </div>
      )}

      {isError && (
        <div style={{ textAlign: 'center', padding: 48, color: '#F87171' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
          <p>Erro ao carregar usuários</p>
        </div>
      )}

      {!isLoading && !isError && users.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: 48,
            background: 'linear-gradient(135deg, #0D1533, #111A3E)',
            borderRadius: 16,
            border: '1.5px dashed rgba(212,175,55,0.2)',
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16 }}>👥</div>
          <h3
            style={{
              color: '#F1E6C8',
              marginBottom: 8,
              fontFamily: "'Playfair Display', serif",
            }}
          >
            Nenhum usuário encontrado
          </h3>
          <p style={{ color: '#8A92A6', marginBottom: 20 }}>
            Clique em "Criar Usuários Padrão" para adicionar Administrador,
            Tesoureiro e Pastor
          </p>
          <button
            onClick={() => seedMutation.mutate()}
            disabled={seedMutation.isPending}
            style={{
              padding: '12px 24px',
              borderRadius: 10,
              border: 'none',
              background: 'linear-gradient(135deg, #D4AF37, #B8962E)',
              color: '#080E23',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            ⚡ Criar Usuários Padrão
          </button>
        </div>
      )}

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 16,
        }}
      >
        {users.map((user) => {
          const roleInfo = ROLE_LABELS[user.role] ?? ROLE_LABELS.membro
          return (
            <div
              key={user.id}
              style={{
                background: 'linear-gradient(135deg, #0D1533 0%, #111A3E 100%)',
                border: `1.5px solid rgba(${hexToRgb(roleInfo.color)},0.25)`,
                borderRadius: 16,
                padding: 24,
                transition: 'transform 0.2s, box-shadow 0.2s',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
                  <div
                    style={{
                      width: 52,
                      height: 52,
                      borderRadius: 14,
                      background: `rgba(${hexToRgb(roleInfo.color)},0.15)`,
                      border: `1.5px solid rgba(${hexToRgb(roleInfo.color)},0.4)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 22,
                    }}
                  >
                    {roleInfo.icon}
                  </div>
                  <div>
                    <h4
                      style={{
                        color: '#F1E6C8',
                        fontWeight: 700,
                        fontSize: 16,
                        marginBottom: 2,
                      }}
                    >
                      {user.name || '(sem nome)'}
                    </h4>
                    <p style={{ color: '#8A92A6', fontSize: 13 }}>
                      {user.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    if (confirm(`Remover ${user.name}?`))
                      deleteMutation.mutate(user.id)
                  }}
                  style={{
                    background: 'rgba(248,113,113,0.1)',
                    border: '1px solid rgba(248,113,113,0.3)',
                    borderRadius: 8,
                    color: '#F87171',
                    padding: '6px 8px',
                    cursor: 'pointer',
                    fontSize: 14,
                  }}
                >
                  🗑️
                </button>
              </div>

              <div
                style={{
                  marginTop: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 12px',
                    borderRadius: 20,
                    background: `rgba(${hexToRgb(roleInfo.color)},0.12)`,
                    border: `1px solid rgba(${hexToRgb(roleInfo.color)},0.3)`,
                    color: roleInfo.color,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  {roleInfo.icon} {roleInfo.label}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: '#8A92A6',
                    background: user.status
                      ? 'rgba(74,222,128,0.1)'
                      : 'rgba(248,113,113,0.1)',
                    border: `1px solid ${user.status ? 'rgba(74,222,128,0.3)' : 'rgba(248,113,113,0.3)'}`,
                    color: user.status ? '#4ADE80' : '#F87171',
                    padding: '3px 8px',
                    borderRadius: 10,
                  }}
                >
                  {user.status ? '● Ativo' : '● Inativo'}
                </span>
              </div>

              <div
                style={{
                  marginTop: 12,
                  paddingTop: 12,
                  borderTop: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span style={{ fontSize: 12, color: '#8A92A6' }}>
                  Criado em{' '}
                  {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function hexToRgb(hex: string): string {
  const h = hex.replace('#', '')
  const bigint = parseInt(h, 16)
  const r = (bigint >> 16) & 255
  const g = (bigint >> 8) & 255
  const b = bigint & 255
  return `${r},${g},${b}`
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 10,
  background: 'rgba(255,255,255,0.05)',
  border: '1.5px solid rgba(255,255,255,0.1)',
  color: '#F1E6C8',
  fontSize: 14,
  outline: 'none',
}
