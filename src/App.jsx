import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { 
  Users, 
  BookOpen, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  X, 
  UserPlus,
  GraduationCap,
  Clock,
  Globe2,
  ChevronRight,
  AlertCircle,
  Check,
  Loader2,
  LayoutDashboard,
  User,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  Calendar,
  FileText,
  CreditCard,
  Percent,
  Eye,
  BookMarked
} from 'lucide-react'

// Configuração do Supabase
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'SUA_URL_SUPABASE'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'SUA_CHAVE_ANON'
const supabase = createClient(supabaseUrl, supabaseKey)

// Toast
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed bottom-4 right-4 z-50 animate-slide-up flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${
      type === 'success' ? 'bg-emerald-500 text-white' : 
      type === 'error' ? 'bg-red-500 text-white' : 
      'bg-surface-800 text-white'
    }`}>
      {type === 'success' && <Check className="w-5 h-5" />}
      {type === 'error' && <AlertCircle className="w-5 h-5" />}
      <span className="font-medium">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70">
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

// Loading
function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-12">
      <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
    </div>
  )
}

// Modal Base
function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={onClose}>
      <div 
        className={`bg-white rounded-2xl shadow-2xl w-full ${sizeClasses[size]} animate-scale-in overflow-hidden max-h-[90vh] flex flex-col`}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-surface-100 shrink-0">
          <h3 className="text-xl font-semibold text-surface-900 font-display">{title}</h3>
          <button 
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-surface-100 text-surface-500 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

// Constantes
const IDIOMAS = ['Inglês', 'Espanhol', 'Francês']
const STATUS_PEDAGOGICO = ['ativo', 'trancado', 'concluido']
const STATUS_FINANCEIRO = ['em_dia', 'pendente', 'inadimplente']
const FORMAS_PAGAMENTO = ['PIX', 'Boleto', 'Cartão', 'Dinheiro', 'Transferência']
const ESTADOS_BR = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

const IDIOMA_COLORS = {
  'Inglês': 'bg-blue-100 text-blue-700',
  'Espanhol': 'bg-amber-100 text-amber-700',
  'Francês': 'bg-rose-100 text-rose-700',
  'Alemão': 'bg-slate-100 text-slate-700',
  'Italiano': 'bg-green-100 text-green-700',
  'Japonês': 'bg-red-100 text-red-700',
  'Mandarim': 'bg-orange-100 text-orange-700',
  'Coreano': 'bg-purple-100 text-purple-700',
  'Português': 'bg-emerald-100 text-emerald-700',
}

const STATUS_COLORS = {
  'ativo': 'bg-emerald-100 text-emerald-700',
  'trancado': 'bg-amber-100 text-amber-700',
  'concluido': 'bg-blue-100 text-blue-700',
  'em_dia': 'bg-emerald-100 text-emerald-700',
  'pendente': 'bg-amber-100 text-amber-700',
  'inadimplente': 'bg-red-100 text-red-700',
}

const STATUS_LABELS = {
  'ativo': 'Ativo',
  'trancado': 'Trancado',
  'concluido': 'Concluído',
  'em_dia': 'Em dia',
  'pendente': 'Pendente',
  'inadimplente': 'Inadimplente',
}

// Formulário vazio de aluno
const emptyFormAluno = {
  // Dados Pessoais
  nome: '',
  cpf: '',
  rg: '',
  data_nascimento: '',
  telefone: '',
  email: '',
  cep: '',
  rua: '',
  numero: '',
  complemento: '',
  bairro: '',
  cidade: '',
  estado: '',
  responsavel_nome: '',
  responsavel_cpf: '',
  responsavel_telefone: '',
  // Pedagógico
  data_inicio: '',
  status_pedagogico: 'ativo',
  observacoes_pedagogicas: '',
  // Financeiro
  dia_vencimento: '',
  valor_mensalidade: '',
  forma_pagamento: 'PIX',
  desconto: '',
  status_financeiro: 'em_dia',
}

function App() {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [turmas, setTurmas] = useState([])
  const [alunos, setAlunos] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTurma, setSearchTurma] = useState('')
  const [searchAluno, setSearchAluno] = useState('')
  const [toast, setToast] = useState(null)

  // Estados dos modais
  const [modalTurma, setModalTurma] = useState({ open: false, data: null })
  const [modalAluno, setModalAluno] = useState({ open: false, data: null })
  const [modalMatricula, setModalMatricula] = useState({ open: false, turmaId: null })
  const [modalDetalheTurma, setModalDetalheTurma] = useState({ open: false, turma: null })
  const [modalDetalheAluno, setModalDetalheAluno] = useState({ open: false, aluno: null })

  // Tab ativa no modal de aluno
  const [alunoTab, setAlunoTab] = useState('pessoais')

  // Estados dos formulários
  const [formTurma, setFormTurma] = useState({
    nome: '', idioma: 'Inglês', professor: '', horario: '', dias_semana: '', livro: ''
  })
  const [formAluno, setFormAluno] = useState({ ...emptyFormAluno })

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    setLoading(true)
    try {
      const [turmasRes, alunosRes] = await Promise.all([
        supabase.from('turmas').select('*, matriculas(*, alunos(*))').order('created_at', { ascending: false }),
        supabase.from('alunos').select('*, matriculas(*, turmas(*))').order('nome')
      ])

      if (turmasRes.error) throw turmasRes.error
      if (alunosRes.error) throw alunosRes.error

      setTurmas(turmasRes.data || [])
      setAlunos(alunosRes.data || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      showToast('Erro ao carregar dados', 'error')
    }
    setLoading(false)
  }

  function showToast(message, type = 'info') {
    setToast({ message, type })
  }

  // Buscar CEP
  async function buscarCep(cep) {
    const cepLimpo = cep.replace(/\D/g, '')
    if (cepLimpo.length !== 8) return
    
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setFormAluno(prev => ({
          ...prev,
          rua: data.logradouro || '',
          bairro: data.bairro || '',
          cidade: data.localidade || '',
          estado: data.uf || ''
        }))
      }
    } catch (error) {
      console.error('Erro ao buscar CEP:', error)
    }
  }

  // CRUD Turmas
  async function saveTurma() {
    try {
      if (modalTurma.data) {
        const { error } = await supabase
          .from('turmas')
          .update(formTurma)
          .eq('id', modalTurma.data.id)
        if (error) throw error
        showToast('Turma atualizada com sucesso!', 'success')
      } else {
        const { error } = await supabase.from('turmas').insert([formTurma])
        if (error) throw error
        showToast('Turma criada com sucesso!', 'success')
      }
      setModalTurma({ open: false, data: null })
      resetFormTurma()
      loadData()
    } catch (error) {
      console.error('Erro ao salvar turma:', error)
      showToast('Erro ao salvar turma', 'error')
    }
  }

  async function deleteTurma(id) {
    if (!confirm('Tem certeza que deseja excluir esta turma?')) return
    try {
      const { error } = await supabase.from('turmas').delete().eq('id', id)
      if (error) throw error
      showToast('Turma excluída com sucesso!', 'success')
      loadData()
    } catch (error) {
      console.error('Erro ao excluir turma:', error)
      showToast('Erro ao excluir turma', 'error')
    }
  }

  function openEditTurma(turma) {
    setFormTurma({
      nome: turma.nome,
      idioma: turma.idioma,
      professor: turma.professor || '',
      horario: turma.horario || '',
      dias_semana: turma.dias_semana || '',
      livro: turma.livro || ''
    })
    setModalTurma({ open: true, data: turma })
  }

  function resetFormTurma() {
    setFormTurma({ nome: '', idioma: 'Inglês', professor: '', horario: '', dias_semana: '', livro: '' })
  }

  // CRUD Alunos
  async function saveAluno() {
    try {
      const dataToSave = {
        ...formAluno,
        dia_vencimento: formAluno.dia_vencimento ? parseInt(formAluno.dia_vencimento) : null,
        valor_mensalidade: formAluno.valor_mensalidade ? parseFloat(formAluno.valor_mensalidade) : null,
        desconto: formAluno.desconto ? parseFloat(formAluno.desconto) : 0,
      }

      if (modalAluno.data) {
        const { error } = await supabase
          .from('alunos')
          .update(dataToSave)
          .eq('id', modalAluno.data.id)
        if (error) throw error
        showToast('Aluno atualizado com sucesso!', 'success')
      } else {
        const { error } = await supabase.from('alunos').insert([dataToSave])
        if (error) throw error
        showToast('Aluno cadastrado com sucesso!', 'success')
      }
      setModalAluno({ open: false, data: null })
      resetFormAluno()
      loadData()
    } catch (error) {
      console.error('Erro ao salvar aluno:', error)
      showToast('Erro ao salvar aluno', 'error')
    }
  }

  async function deleteAluno(id) {
    if (!confirm('Tem certeza que deseja excluir este aluno?')) return
    try {
      const { error } = await supabase.from('alunos').delete().eq('id', id)
      if (error) throw error
      showToast('Aluno excluído com sucesso!', 'success')
      loadData()
    } catch (error) {
      console.error('Erro ao excluir aluno:', error)
      showToast('Erro ao excluir aluno', 'error')
    }
  }

  function openEditAluno(aluno) {
    setFormAluno({
      nome: aluno.nome || '',
      cpf: aluno.cpf || '',
      rg: aluno.rg || '',
      data_nascimento: aluno.data_nascimento || '',
      telefone: aluno.telefone || '',
      email: aluno.email || '',
      cep: aluno.cep || '',
      rua: aluno.rua || '',
      numero: aluno.numero || '',
      complemento: aluno.complemento || '',
      bairro: aluno.bairro || '',
      cidade: aluno.cidade || '',
      estado: aluno.estado || '',
      responsavel_nome: aluno.responsavel_nome || '',
      responsavel_cpf: aluno.responsavel_cpf || '',
      responsavel_telefone: aluno.responsavel_telefone || '',
      data_inicio: aluno.data_inicio || '',
      status_pedagogico: aluno.status_pedagogico || 'ativo',
      observacoes_pedagogicas: aluno.observacoes_pedagogicas || '',
      dia_vencimento: aluno.dia_vencimento || '',
      valor_mensalidade: aluno.valor_mensalidade || '',
      forma_pagamento: aluno.forma_pagamento || 'PIX',
      desconto: aluno.desconto || '',
      status_financeiro: aluno.status_financeiro || 'em_dia',
    })
    setAlunoTab('pessoais')
    setModalAluno({ open: true, data: aluno })
  }

  function resetFormAluno() {
    setFormAluno({ ...emptyFormAluno })
    setAlunoTab('pessoais')
  }

  // Matrículas
  async function matricularAluno(alunoId) {
    try {
      const { error } = await supabase.from('matriculas').insert([{
        turma_id: modalMatricula.turmaId,
        aluno_id: alunoId
      }])
      if (error) {
        if (error.code === '23505') {
          showToast('Aluno já está matriculado nesta turma', 'error')
          return
        }
        throw error
      }
      showToast('Aluno matriculado com sucesso!', 'success')
      setModalMatricula({ open: false, turmaId: null })
      loadData()
    } catch (error) {
      console.error('Erro ao matricular aluno:', error)
      showToast('Erro ao matricular aluno', 'error')
    }
  }

  async function cancelarMatricula(turmaId, alunoId) {
    if (!confirm('Remover este aluno da turma?')) return
    try {
      const { error } = await supabase
        .from('matriculas')
        .delete()
        .eq('turma_id', turmaId)
        .eq('aluno_id', alunoId)
      if (error) throw error
      showToast('Matrícula cancelada', 'success')
      loadData()
    } catch (error) {
      console.error('Erro ao cancelar matrícula:', error)
      showToast('Erro ao cancelar matrícula', 'error')
    }
  }

  // Filtros
  const turmasFiltradas = turmas.filter(t => 
    t.nome.toLowerCase().includes(searchTurma.toLowerCase()) ||
    t.idioma.toLowerCase().includes(searchTurma.toLowerCase()) ||
    (t.professor && t.professor.toLowerCase().includes(searchTurma.toLowerCase())) ||
    (t.livro && t.livro.toLowerCase().includes(searchTurma.toLowerCase()))
  )

  const alunosFiltrados = alunos.filter(a =>
    a.nome.toLowerCase().includes(searchAluno.toLowerCase()) ||
    (a.email && a.email.toLowerCase().includes(searchAluno.toLowerCase())) ||
    (a.cpf && a.cpf.includes(searchAluno))
  )

  const alunosDisponiveis = alunos.filter(a => {
    const turma = turmas.find(t => t.id === modalMatricula.turmaId)
    if (!turma) return true
    return !turma.matriculas?.some(m => m.aluno_id === a.id)
  })

  // Estatísticas
  const stats = {
    totalTurmas: turmas.length,
    totalAlunos: alunos.length,
    totalMatriculas: turmas.reduce((acc, t) => acc + (t.matriculas?.length || 0), 0),
    alunosAtivos: alunos.filter(a => a.status_pedagogico === 'ativo').length,
    alunosEmDia: alunos.filter(a => a.status_financeiro === 'em_dia').length,
    alunosPendentes: alunos.filter(a => a.status_financeiro === 'pendente' || a.status_financeiro === 'inadimplente').length,
  }

  // Formatar valor
  function formatCurrency(value) {
    if (!value) return '-'
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)
  }

  return (
    <div className="min-h-screen">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white border-r border-surface-200 shadow-soft z-40">
        <div className="p-6">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-accent-500 rounded-xl flex items-center justify-center">
              <Globe2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-display font-bold text-surface-900">EduLingua</h1>
              <p className="text-xs text-surface-500">Gestão de Turmas</p>
            </div>
          </div>

          <nav className="space-y-1">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'turmas', icon: BookOpen, label: 'Turmas' },
              { id: 'alunos', icon: Users, label: 'Alunos' },
            ].map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${
                  activeTab === item.id 
                    ? 'bg-brand-50 text-brand-600 font-medium' 
                    : 'text-surface-600 hover:bg-surface-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-surface-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-surface-100 rounded-full flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-surface-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-surface-900 truncate">Administrador</p>
              <p className="text-xs text-surface-500">admin@escola.com</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        <div className="p-8">
          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {/* Dashboard */}
              {activeTab === 'dashboard' && (
                <div className="animate-fade-in">
                  <div className="mb-8">
                    <h2 className="text-3xl font-display font-bold text-surface-900 mb-2">Dashboard</h2>
                    <p className="text-surface-600">Visão geral da sua escola de idiomas</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white rounded-2xl p-6 shadow-card card-hover">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-brand-600" />
                        </div>
                        <span className="text-3xl font-display font-bold text-surface-900">{stats.totalTurmas}</span>
                      </div>
                      <h3 className="font-medium text-surface-900">Turmas</h3>
                      <p className="text-sm text-surface-500">Total cadastradas</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-card card-hover">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-accent-100 rounded-xl flex items-center justify-center">
                          <Users className="w-6 h-6 text-accent-600" />
                        </div>
                        <span className="text-3xl font-display font-bold text-surface-900">{stats.totalAlunos}</span>
                      </div>
                      <h3 className="font-medium text-surface-900">Alunos</h3>
                      <p className="text-sm text-surface-500">{stats.alunosAtivos} ativos</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-card card-hover">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                          <DollarSign className="w-6 h-6 text-emerald-600" />
                        </div>
                        <span className="text-3xl font-display font-bold text-surface-900">{stats.alunosEmDia}</span>
                      </div>
                      <h3 className="font-medium text-surface-900">Em dia</h3>
                      <p className="text-sm text-surface-500">Financeiro ok</p>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-card card-hover">
                      <div className="flex items-center justify-between mb-4">
                        <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                          <AlertCircle className="w-6 h-6 text-amber-600" />
                        </div>
                        <span className="text-3xl font-display font-bold text-surface-900">{stats.alunosPendentes}</span>
                      </div>
                      <h3 className="font-medium text-surface-900">Pendentes</h3>
                      <p className="text-sm text-surface-500">Verificar pagamento</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                      <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
                        <h3 className="font-display font-semibold text-surface-900">Turmas Recentes</h3>
                        <button 
                          onClick={() => setActiveTab('turmas')}
                          className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
                        >
                          Ver todas <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="divide-y divide-surface-100">
                        {turmas.slice(0, 5).map(turma => (
                          <div key={turma.id} className="px-6 py-4 flex items-center justify-between hover:bg-surface-50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${IDIOMA_COLORS[turma.idioma] || 'bg-surface-100 text-surface-600'}`}>
                                <Globe2 className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-medium text-surface-900">{turma.nome}</p>
                                <p className="text-sm text-surface-500">{turma.idioma}</p>
                              </div>
                            </div>
                            <span className="text-sm text-surface-600">{turma.matriculas?.length || 0} alunos</span>
                          </div>
                        ))}
                        {turmas.length === 0 && (
                          <div className="px-6 py-8 text-center text-surface-500">
                            Nenhuma turma cadastrada
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                      <div className="px-6 py-4 border-b border-surface-100 flex items-center justify-between">
                        <h3 className="font-display font-semibold text-surface-900">Alunos com Pendências</h3>
                        <button 
                          onClick={() => setActiveTab('alunos')}
                          className="text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1"
                        >
                          Ver todos <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                      <div className="divide-y divide-surface-100">
                        {alunos.filter(a => a.status_financeiro !== 'em_dia').slice(0, 5).map(aluno => (
                          <div key={aluno.id} className="px-6 py-4 flex items-center justify-between hover:bg-surface-50 transition-colors">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-accent-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {aluno.nome.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-surface-900">{aluno.nome}</p>
                                <p className="text-sm text-surface-500">Venc. dia {aluno.dia_vencimento || '-'}</p>
                              </div>
                            </div>
                            <span className={`badge ${STATUS_COLORS[aluno.status_financeiro]}`}>
                              {STATUS_LABELS[aluno.status_financeiro]}
                            </span>
                          </div>
                        ))}
                        {alunos.filter(a => a.status_financeiro !== 'em_dia').length === 0 && (
                          <div className="px-6 py-8 text-center text-surface-500">
                            Todos os alunos em dia! 🎉
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Turmas */}
              {activeTab === 'turmas' && (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-display font-bold text-surface-900 mb-2">Turmas</h2>
                      <p className="text-surface-600">Gerencie as turmas da escola</p>
                    </div>
                    <button
                      onClick={() => { resetFormTurma(); setModalTurma({ open: true, data: null }) }}
                      className="flex items-center gap-2 px-5 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors shadow-lg shadow-brand-500/25"
                    >
                      <Plus className="w-5 h-5" />
                      Nova Turma
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-surface-100">
                      <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                        <input
                          type="text"
                          placeholder="Buscar turmas..."
                          value={searchTurma}
                          onChange={(e) => setSearchTurma(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 border border-surface-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
                        />
                      </div>
                    </div>

                    <div className="divide-y divide-surface-100">
                      {turmasFiltradas.map(turma => (
                        <div key={turma.id} className="px-6 py-4 flex items-center justify-between table-row-hover">
                          <div className="flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${IDIOMA_COLORS[turma.idioma] || 'bg-surface-100 text-surface-600'}`}>
                              <Globe2 className="w-6 h-6" />
                            </div>
                            <div>
                              <p className="font-semibold text-surface-900">{turma.nome}</p>
                              <div className="flex items-center gap-3 mt-1">
                                <span className={`badge ${IDIOMA_COLORS[turma.idioma] || 'bg-surface-100 text-surface-600'}`}>
                                  {turma.idioma}
                                </span>
                                {turma.professor && (
                                  <span className="text-sm text-surface-500">Prof. {turma.professor}</span>
                                )}
                                {turma.livro && (
                                  <span className="text-sm text-surface-500 flex items-center gap-1">
                                    <BookMarked className="w-3 h-3" /> {turma.livro}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="text-right">
                              <p className="font-semibold text-surface-900">{turma.matriculas?.length || 0}</p>
                              <p className="text-xs text-surface-500">alunos</p>
                            </div>
                            {turma.horario && (
                              <div className="flex items-center gap-1.5 text-surface-500">
                                <Clock className="w-4 h-4" />
                                <span className="text-sm">{turma.horario}</span>
                              </div>
                            )}
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setModalDetalheTurma({ open: true, turma })}
                                className="p-2 rounded-lg hover:bg-surface-100 text-surface-500 transition-colors"
                                title="Ver detalhes"
                              >
                                <Users className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => setModalMatricula({ open: true, turmaId: turma.id })}
                                className="p-2 rounded-lg hover:bg-brand-50 text-brand-600 transition-colors"
                                title="Adicionar aluno"
                              >
                                <UserPlus className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => openEditTurma(turma)}
                                className="p-2 rounded-lg hover:bg-surface-100 text-surface-500 transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => deleteTurma(turma.id)}
                                className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {turmasFiltradas.length === 0 && (
                        <div className="px-6 py-12 text-center">
                          <BookOpen className="w-12 h-12 text-surface-300 mx-auto mb-4" />
                          <p className="text-surface-500">Nenhuma turma encontrada</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Alunos */}
              {activeTab === 'alunos' && (
                <div className="animate-fade-in">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-3xl font-display font-bold text-surface-900 mb-2">Alunos</h2>
                      <p className="text-surface-600">Gerencie os alunos cadastrados</p>
                    </div>
                    <button
                      onClick={() => { resetFormAluno(); setModalAluno({ open: true, data: null }) }}
                      className="flex items-center gap-2 px-5 py-3 bg-accent-600 text-white rounded-xl font-medium hover:bg-accent-700 transition-colors shadow-lg shadow-accent-500/25"
                    >
                      <Plus className="w-5 h-5" />
                      Novo Aluno
                    </button>
                  </div>

                  <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                    <div className="px-6 py-4 border-b border-surface-100">
                      <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                        <input
                          type="text"
                          placeholder="Buscar por nome, email ou CPF..."
                          value={searchAluno}
                          onChange={(e) => setSearchAluno(e.target.value)}
                          className="w-full pl-10 pr-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                        />
                      </div>
                    </div>

                    <div className="divide-y divide-surface-100">
                      {alunosFiltrados.map(aluno => (
                        <div key={aluno.id} className="px-6 py-4 flex items-center justify-between table-row-hover">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-accent-400 rounded-full flex items-center justify-center text-white font-semibold">
                              {aluno.nome.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-surface-900">{aluno.nome}</p>
                              <p className="text-sm text-surface-500">{aluno.email || aluno.telefone || 'Sem contato'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex flex-wrap gap-1 max-w-xs">
                              {aluno.matriculas?.slice(0, 2).map(m => (
                                <span key={m.id} className={`badge text-xs ${IDIOMA_COLORS[m.turmas?.idioma] || 'bg-surface-100 text-surface-600'}`}>
                                  {m.turmas?.nome}
                                </span>
                              ))}
                              {(aluno.matriculas?.length || 0) > 2 && (
                                <span className="badge bg-surface-100 text-surface-600 text-xs">
                                  +{aluno.matriculas.length - 2}
                                </span>
                              )}
                            </div>
                            <span className={`badge ${STATUS_COLORS[aluno.status_pedagogico]}`}>
                              {STATUS_LABELS[aluno.status_pedagogico]}
                            </span>
                            <span className={`badge ${STATUS_COLORS[aluno.status_financeiro]}`}>
                              {STATUS_LABELS[aluno.status_financeiro]}
                            </span>
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => setModalDetalheAluno({ open: true, aluno })}
                                className="p-2 rounded-lg hover:bg-surface-100 text-surface-500 transition-colors"
                                title="Ver detalhes"
                              >
                                <Eye className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => openEditAluno(aluno)}
                                className="p-2 rounded-lg hover:bg-surface-100 text-surface-500 transition-colors"
                                title="Editar"
                              >
                                <Edit2 className="w-5 h-5" />
                              </button>
                              <button
                                onClick={() => deleteAluno(aluno.id)}
                                className="p-2 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                                title="Excluir"
                              >
                                <Trash2 className="w-5 h-5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                      {alunosFiltrados.length === 0 && (
                        <div className="px-6 py-12 text-center">
                          <Users className="w-12 h-12 text-surface-300 mx-auto mb-4" />
                          <p className="text-surface-500">Nenhum aluno encontrado</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Modal Turma */}
      <Modal
        isOpen={modalTurma.open}
        onClose={() => setModalTurma({ open: false, data: null })}
        title={modalTurma.data ? 'Editar Turma' : 'Nova Turma'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Nome da Turma *</label>
            <input
              type="text"
              value={formTurma.nome}
              onChange={(e) => setFormTurma({ ...formTurma, nome: e.target.value })}
              placeholder="Ex: Turma A - Manhã"
              className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Idioma *</label>
            <select
              value={formTurma.idioma}
              onChange={(e) => setFormTurma({ ...formTurma, idioma: e.target.value })}
              className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            >
              {IDIOMAS.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Professor</label>
            <input
              type="text"
              value={formTurma.professor}
              onChange={(e) => setFormTurma({ ...formTurma, professor: e.target.value })}
              placeholder="Nome do professor"
              className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Horário</label>
              <input
                type="text"
                value={formTurma.horario}
                onChange={(e) => setFormTurma({ ...formTurma, horario: e.target.value })}
                placeholder="Ex: 19:00 - 21:00"
                className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-surface-700 mb-1">Dias da Semana</label>
              <input
                type="text"
                value={formTurma.dias_semana}
                onChange={(e) => setFormTurma({ ...formTurma, dias_semana: e.target.value })}
                placeholder="Ex: Seg, Qua, Sex"
                className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Livro</label>
            <input
              type="text"
              value={formTurma.livro}
              onChange={(e) => setFormTurma({ ...formTurma, livro: e.target.value })}
              placeholder="Ex: English File Intermediate"
              className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20"
            />
          </div>
          <div className="flex gap-3 pt-4">
            <button
              onClick={() => setModalTurma({ open: false, data: null })}
              className="flex-1 px-4 py-2.5 border border-surface-200 rounded-xl font-medium text-surface-700 hover:bg-surface-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={saveTurma}
              disabled={!formTurma.nome}
              className="flex-1 px-4 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {modalTurma.data ? 'Salvar' : 'Criar Turma'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Aluno - Com Abas */}
      <Modal
        isOpen={modalAluno.open}
        onClose={() => setModalAluno({ open: false, data: null })}
        title={modalAluno.data ? 'Editar Aluno' : 'Novo Aluno'}
        size="xl"
      >
        <div>
          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-surface-100 rounded-xl mb-6">
            {[
              { id: 'pessoais', icon: User, label: 'Dados Pessoais' },
              { id: 'pedagogico', icon: GraduationCap, label: 'Pedagógico' },
              { id: 'financeiro', icon: DollarSign, label: 'Financeiro' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setAlunoTab(tab.id)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-all ${
                  alunoTab === tab.id
                    ? 'bg-white text-surface-900 shadow-sm'
                    : 'text-surface-600 hover:text-surface-900'
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab: Dados Pessoais */}
          {alunoTab === 'pessoais' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-surface-700 mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    value={formAluno.nome}
                    onChange={(e) => setFormAluno({ ...formAluno, nome: e.target.value })}
                    placeholder="Nome do aluno"
                    className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">CPF</label>
                  <input
                    type="text"
                    value={formAluno.cpf}
                    onChange={(e) => setFormAluno({ ...formAluno, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">RG</label>
                  <input
                    type="text"
                    value={formAluno.rg}
                    onChange={(e) => setFormAluno({ ...formAluno, rg: e.target.value })}
                    placeholder="00.000.000-0"
                    className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Data de Nascimento</label>
                  <input
                    type="date"
                    value={formAluno.data_nascimento}
                    onChange={(e) => setFormAluno({ ...formAluno, data_nascimento: e.target.value })}
                    className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Telefone/WhatsApp</label>
                  <input
                    type="text"
                    value={formAluno.telefone}
                    onChange={(e) => setFormAluno({ ...formAluno, telefone: e.target.value })}
                    placeholder="(00) 00000-0000"
                    className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-surface-700 mb-1">Email</label>
                  <input
                    type="email"
                    value={formAluno.email}
                    onChange={(e) => setFormAluno({ ...formAluno, email: e.target.value })}
                    placeholder="email@exemplo.com"
                    className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                  />
                </div>
              </div>

              {/* Endereço */}
              <div className="pt-4 border-t border-surface-100">
                <h4 className="font-medium text-surface-900 mb-4 flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> Endereço
                </h4>
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">CEP</label>
                    <input
                      type="text"
                      value={formAluno.cep}
                      onChange={(e) => setFormAluno({ ...formAluno, cep: e.target.value })}
                      onBlur={(e) => buscarCep(e.target.value)}
                      placeholder="00000-000"
                      className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-surface-700 mb-1">Rua</label>
                    <input
                      type="text"
                      value={formAluno.rua}
                      onChange={(e) => setFormAluno({ ...formAluno, rua: e.target.value })}
                      placeholder="Nome da rua"
                      className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">Número</label>
                    <input
                      type="text"
                      value={formAluno.numero}
                      onChange={(e) => setFormAluno({ ...formAluno, numero: e.target.value })}
                      placeholder="123"
                      className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-surface-700 mb-1">Complemento</label>
                    <input
                      type="text"
                      value={formAluno.complemento}
                      onChange={(e) => setFormAluno({ ...formAluno, complemento: e.target.value })}
                      placeholder="Apto, bloco..."
                      className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">Bairro</label>
                    <input
                      type="text"
                      value={formAluno.bairro}
                      onChange={(e) => setFormAluno({ ...formAluno, bairro: e.target.value })}
                      placeholder="Bairro"
                      className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">Cidade</label>
                    <input
                      type="text"
                      value={formAluno.cidade}
                      onChange={(e) => setFormAluno({ ...formAluno, cidade: e.target.value })}
                      placeholder="Cidade"
                      className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-surface-700 mb-1">Estado</label>
                    <select
                      value={formAluno.estado}
                      onChange={(e) => setFormAluno({ ...formAluno, estado: e.target.value })}
                      className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                    >
                      <option value="">Selecione</option>
                      {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              {/* Responsável */}
              <div className="pt-4 border-t border-surface-100">
                <h4 className="font-medium text-surface-900 mb-4 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Responsável
                </h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">Nome</label>
                    <input
                      type="text"
                      value={formAluno.responsavel_nome}
                      onChange={(e) => setFormAluno({ ...formAluno, responsavel_nome: e.target.value })}
                      placeholder="Nome do responsável"
                      className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">CPF</label>
                    <input
                      type="text"
                      value={formAluno.responsavel_cpf}
                      onChange={(e) => setFormAluno({ ...formAluno, responsavel_cpf: e.target.value })}
                      placeholder="000.000.000-00"
                      className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">Telefone</label>
                    <input
                      type="text"
                      value={formAluno.responsavel_telefone}
                      onChange={(e) => setFormAluno({ ...formAluno, responsavel_telefone: e.target.value })}
                      placeholder="(00) 00000-0000"
                      className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab: Pedagógico */}
          {alunoTab === 'pedagogico' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Data de Início</label>
                  <input
                    type="date"
                    value={formAluno.data_inicio}
                    onChange={(e) => setFormAluno({ ...formAluno, data_inicio: e.target.value })}
                    className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Status</label>
                  <select
                    value={formAluno.status_pedagogico}
                    onChange={(e) => setFormAluno({ ...formAluno, status_pedagogico: e.target.value })}
                    className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                  >
                    {STATUS_PEDAGOGICO.map(s => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Turmas matriculadas (apenas visualização) */}
              {modalAluno.data && modalAluno.data.matriculas?.length > 0 && (
                <div className="pt-4 border-t border-surface-100">
                  <h4 className="font-medium text-surface-900 mb-3">Turmas Matriculadas</h4>
                  <div className="flex flex-wrap gap-2">
                    {modalAluno.data.matriculas.map(m => (
                      <div key={m.id} className={`badge ${IDIOMA_COLORS[m.turmas?.idioma] || 'bg-surface-100 text-surface-600'}`}>
                        {m.turmas?.nome} • {m.turmas?.horario}
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-surface-500 mt-2">Para alterar matrículas, use a tela de Turmas</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Observações Pedagógicas</label>
                <textarea
                  value={formAluno.observacoes_pedagogicas}
                  onChange={(e) => setFormAluno({ ...formAluno, observacoes_pedagogicas: e.target.value })}
                  placeholder="Anotações sobre o progresso, comportamento, necessidades especiais..."
                  rows={4}
                  className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 resize-none"
                />
              </div>
            </div>
          )}

          {/* Tab: Financeiro */}
          {alunoTab === 'financeiro' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Dia de Vencimento</label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={formAluno.dia_vencimento}
                    onChange={(e) => setFormAluno({ ...formAluno, dia_vencimento: e.target.value })}
                    placeholder="Ex: 10"
                    className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Valor da Mensalidade</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formAluno.valor_mensalidade}
                    onChange={(e) => setFormAluno({ ...formAluno, valor_mensalidade: e.target.value })}
                    placeholder="350.00"
                    className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Forma de Pagamento</label>
                  <select
                    value={formAluno.forma_pagamento}
                    onChange={(e) => setFormAluno({ ...formAluno, forma_pagamento: e.target.value })}
                    className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                  >
                    {FORMAS_PAGAMENTO.map(f => <option key={f} value={f}>{f}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Desconto (%)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    step="0.01"
                    value={formAluno.desconto}
                    onChange={(e) => setFormAluno({ ...formAluno, desconto: e.target.value })}
                    placeholder="0"
                    className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-surface-700 mb-1">Status Financeiro</label>
                  <select
                    value={formAluno.status_financeiro}
                    onChange={(e) => setFormAluno({ ...formAluno, status_financeiro: e.target.value })}
                    className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20"
                  >
                    {STATUS_FINANCEIRO.map(s => (
                      <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Resumo */}
              {formAluno.valor_mensalidade && (
                <div className="p-4 bg-surface-50 rounded-xl">
                  <h4 className="font-medium text-surface-900 mb-2">Resumo</h4>
                  <div className="flex justify-between text-sm">
                    <span className="text-surface-600">Mensalidade:</span>
                    <span className="font-medium">{formatCurrency(formAluno.valor_mensalidade)}</span>
                  </div>
                  {formAluno.desconto > 0 && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-surface-600">Desconto ({formAluno.desconto}%):</span>
                        <span className="font-medium text-emerald-600">
                          -{formatCurrency(formAluno.valor_mensalidade * (formAluno.desconto / 100))}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm pt-2 border-t border-surface-200 mt-2">
                        <span className="text-surface-900 font-medium">Valor Final:</span>
                        <span className="font-bold text-surface-900">
                          {formatCurrency(formAluno.valor_mensalidade * (1 - formAluno.desconto / 100))}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3 pt-6 mt-6 border-t border-surface-100">
            <button
              onClick={() => setModalAluno({ open: false, data: null })}
              className="flex-1 px-4 py-2.5 border border-surface-200 rounded-xl font-medium text-surface-700 hover:bg-surface-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              onClick={saveAluno}
              disabled={!formAluno.nome}
              className="flex-1 px-4 py-2.5 bg-accent-600 text-white rounded-xl font-medium hover:bg-accent-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {modalAluno.data ? 'Salvar Alterações' : 'Cadastrar Aluno'}
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal Matrícula */}
      <Modal
        isOpen={modalMatricula.open}
        onClose={() => setModalMatricula({ open: false, turmaId: null })}
        title="Matricular Aluno"
      >
        <div className="space-y-4">
          <p className="text-surface-600">Selecione um aluno para matricular nesta turma:</p>
          <div className="max-h-64 overflow-y-auto space-y-2">
            {alunosDisponiveis.map(aluno => (
              <button
                key={aluno.id}
                onClick={() => matricularAluno(aluno.id)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl border border-surface-200 hover:border-brand-300 hover:bg-brand-50 transition-all text-left"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-accent-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {aluno.nome.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium text-surface-900">{aluno.nome}</p>
                  <p className="text-sm text-surface-500">{aluno.email || 'Sem email'}</p>
                </div>
              </button>
            ))}
            {alunosDisponiveis.length === 0 && (
              <div className="text-center py-8 text-surface-500">
                <Users className="w-10 h-10 mx-auto mb-2 text-surface-300" />
                <p>Todos os alunos já estão matriculados</p>
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal Detalhe Turma */}
      <Modal
        isOpen={modalDetalheTurma.open}
        onClose={() => setModalDetalheTurma({ open: false, turma: null })}
        title={modalDetalheTurma.turma?.nome || 'Detalhes da Turma'}
      >
        {modalDetalheTurma.turma && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-surface-50 rounded-xl">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${IDIOMA_COLORS[modalDetalheTurma.turma.idioma] || 'bg-surface-100 text-surface-600'}`}>
                <Globe2 className="w-6 h-6" />
              </div>
              <div>
                <div className="flex gap-2 flex-wrap">
                  <span className="badge bg-surface-200 text-surface-700">{modalDetalheTurma.turma.idioma}</span>
                </div>
                {modalDetalheTurma.turma.professor && (
                  <p className="text-sm text-surface-600 mt-1">Prof. {modalDetalheTurma.turma.professor}</p>
                )}
                {modalDetalheTurma.turma.livro && (
                  <p className="text-sm text-surface-600 mt-1 flex items-center gap-1">
                    <BookMarked className="w-3 h-3" /> {modalDetalheTurma.turma.livro}
                  </p>
                )}
              </div>
            </div>

            <div>
              <h4 className="font-medium text-surface-900 mb-3">
                Alunos Matriculados ({modalDetalheTurma.turma.matriculas?.length || 0})
              </h4>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {modalDetalheTurma.turma.matriculas?.map(m => (
                  <div key={m.id} className="flex items-center justify-between px-4 py-3 bg-surface-50 rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-accent-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {m.alunos?.nome?.charAt(0).toUpperCase()}
                      </div>
                      <span className="font-medium text-surface-900">{m.alunos?.nome}</span>
                    </div>
                    <button
                      onClick={() => cancelarMatricula(modalDetalheTurma.turma.id, m.aluno_id)}
                      className="text-red-500 hover:text-red-600 text-sm"
                    >
                      Remover
                    </button>
                  </div>
                ))}
                {!modalDetalheTurma.turma.matriculas?.length && (
                  <div className="text-center py-6 text-surface-500">
                    Nenhum aluno matriculado
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Modal Detalhe Aluno */}
      <Modal
        isOpen={modalDetalheAluno.open}
        onClose={() => setModalDetalheAluno({ open: false, aluno: null })}
        title={modalDetalheAluno.aluno?.nome || 'Detalhes do Aluno'}
        size="lg"
      >
        {modalDetalheAluno.aluno && (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-gradient-to-br from-brand-400 to-accent-400 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {modalDetalheAluno.aluno.nome.charAt(0).toUpperCase()}
              </div>
              <div>
                <h3 className="text-xl font-semibold text-surface-900">{modalDetalheAluno.aluno.nome}</h3>
                <div className="flex gap-2 mt-1">
                  <span className={`badge ${STATUS_COLORS[modalDetalheAluno.aluno.status_pedagogico]}`}>
                    {STATUS_LABELS[modalDetalheAluno.aluno.status_pedagogico]}
                  </span>
                  <span className={`badge ${STATUS_COLORS[modalDetalheAluno.aluno.status_financeiro]}`}>
                    {STATUS_LABELS[modalDetalheAluno.aluno.status_financeiro]}
                  </span>
                </div>
              </div>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-3">
                <h4 className="font-medium text-surface-900 flex items-center gap-2">
                  <User className="w-4 h-4" /> Dados Pessoais
                </h4>
                <div className="space-y-2 text-surface-600">
                  {modalDetalheAluno.aluno.cpf && <p><span className="text-surface-500">CPF:</span> {modalDetalheAluno.aluno.cpf}</p>}
                  {modalDetalheAluno.aluno.rg && <p><span className="text-surface-500">RG:</span> {modalDetalheAluno.aluno.rg}</p>}
                  {modalDetalheAluno.aluno.email && <p><span className="text-surface-500">Email:</span> {modalDetalheAluno.aluno.email}</p>}
                  {modalDetalheAluno.aluno.telefone && <p><span className="text-surface-500">Tel:</span> {modalDetalheAluno.aluno.telefone}</p>}
                  {modalDetalheAluno.aluno.cidade && (
                    <p><span className="text-surface-500">Cidade:</span> {modalDetalheAluno.aluno.cidade}/{modalDetalheAluno.aluno.estado}</p>
                  )}
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium text-surface-900 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" /> Financeiro
                </h4>
                <div className="space-y-2 text-surface-600">
                  <p><span className="text-surface-500">Vencimento:</span> Dia {modalDetalheAluno.aluno.dia_vencimento || '-'}</p>
                  <p><span className="text-surface-500">Mensalidade:</span> {formatCurrency(modalDetalheAluno.aluno.valor_mensalidade)}</p>
                  <p><span className="text-surface-500">Pagamento:</span> {modalDetalheAluno.aluno.forma_pagamento || '-'}</p>
                  {modalDetalheAluno.aluno.desconto > 0 && (
                    <p><span className="text-surface-500">Desconto:</span> {modalDetalheAluno.aluno.desconto}%</p>
                  )}
                </div>
              </div>
            </div>

            {/* Turmas */}
            {modalDetalheAluno.aluno.matriculas?.length > 0 && (
              <div className="pt-4 border-t border-surface-100">
                <h4 className="font-medium text-surface-900 mb-3 flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Turmas
                </h4>
                <div className="flex flex-wrap gap-2">
                  {modalDetalheAluno.aluno.matriculas.map(m => (
                    <div key={m.id} className={`badge ${IDIOMA_COLORS[m.turmas?.idioma] || 'bg-surface-100 text-surface-600'}`}>
                      {m.turmas?.nome} • {m.turmas?.horario || 'Sem horário'}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Responsável */}
            {modalDetalheAluno.aluno.responsavel_nome && (
              <div className="pt-4 border-t border-surface-100">
                <h4 className="font-medium text-surface-900 mb-3 flex items-center gap-2">
                  <Users className="w-4 h-4" /> Responsável
                </h4>
                <div className="text-sm text-surface-600 space-y-1">
                  <p><span className="text-surface-500">Nome:</span> {modalDetalheAluno.aluno.responsavel_nome}</p>
                  {modalDetalheAluno.aluno.responsavel_cpf && (
                    <p><span className="text-surface-500">CPF:</span> {modalDetalheAluno.aluno.responsavel_cpf}</p>
                  )}
                  {modalDetalheAluno.aluno.responsavel_telefone && (
                    <p><span className="text-surface-500">Tel:</span> {modalDetalheAluno.aluno.responsavel_telefone}</p>
                  )}
                </div>
              </div>
            )}

            {/* Observações */}
            {modalDetalheAluno.aluno.observacoes_pedagogicas && (
              <div className="pt-4 border-t border-surface-100">
                <h4 className="font-medium text-surface-900 mb-2 flex items-center gap-2">
                  <FileText className="w-4 h-4" /> Observações
                </h4>
                <p className="text-sm text-surface-600 bg-surface-50 p-3 rounded-lg">
                  {modalDetalheAluno.aluno.observacoes_pedagogicas}
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Toast */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={() => setToast(null)} 
        />
      )}
    </div>
  )
}

export default App
