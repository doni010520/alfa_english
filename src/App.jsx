import { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { 
  Users, BookOpen, Plus, Search, Edit2, Trash2, X, UserPlus, GraduationCap, Clock, Globe2,
  ChevronRight, AlertCircle, Check, Loader2, LayoutDashboard, User, DollarSign, MapPin,
  FileText, Eye, BookMarked, LogIn, LogOut, Lock, UserCheck, UserX, ClipboardList, Save, Mail, Menu,
  Bot, Send, Sparkles
} from 'lucide-react'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'SUA_URL_SUPABASE'
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'SUA_CHAVE_ANON'
const API_URL = import.meta.env.VITE_ASSISTANT_API_URL || 'http://localhost:8000'
const supabase = createClient(supabaseUrl, supabaseKey)


function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setIsLoading(true)
    try {
      const { data, error } = await supabase.rpc('verificar_login', { p_email: email, p_senha: senha })
      if (error) throw error
      if (data && data.length > 0) {
        onLogin(data[0])
      } else {
        setError('Email ou senha incorretos')
      }
    } catch (err) {
      console.error('Erro no login:', err)
      setError('Erro ao fazer login. Tente novamente.')
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-brand-50 via-white to-accent-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-brand-500 to-accent-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Globe2 className="w-9 h-9 text-white" />
          </div>
          <h1 className="text-3xl font-display font-bold text-surface-900">EduLingua</h1>
          <p className="text-surface-500 mt-1">Gestão de Turmas</p>
        </div>
        <form onSubmit={handleLogin} className="bg-white rounded-2xl shadow-card p-6 sm:p-8 space-y-5">
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="seu@email.com" required className="w-full pl-10 pr-4 py-3 border border-surface-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 mb-1">Senha</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
              <input type="password" value={senha} onChange={(e) => setSenha(e.target.value)} placeholder="••••••••" required className="w-full pl-10 pr-4 py-3 border border-surface-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20" />
            </div>
          </div>
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}
          <button type="submit" disabled={isLoading} className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 transition-colors disabled:opacity-50">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><LogIn className="w-5 h-5" />Entrar</>}
          </button>
        </form>
      </div>
    </div>
  )
}

function Toast({ message, type, onClose }) {
  useEffect(() => { const timer = setTimeout(onClose, 3000); return () => clearTimeout(timer) }, [onClose])
  return (
    <div className={`fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-auto z-50 animate-slide-up flex items-center gap-3 px-4 py-3 rounded-xl shadow-lg ${type === 'success' ? 'bg-emerald-500 text-white' : type === 'error' ? 'bg-red-500 text-white' : 'bg-surface-800 text-white'}`}>
      {type === 'success' && <Check className="w-5 h-5 flex-shrink-0" />}
      {type === 'error' && <AlertCircle className="w-5 h-5 flex-shrink-0" />}
      <span className="font-medium flex-1">{message}</span>
      <button onClick={onClose} className="ml-2 hover:opacity-70"><X className="w-4 h-4" /></button>
    </div>
  )
}

function LoadingSpinner() {
  return <div className="flex items-center justify-center py-12"><Loader2 className="w-8 h-8 text-brand-500 animate-spin" /></div>
}

function Modal({ isOpen, onClose, title, children, size = 'md' }) {
  if (!isOpen) return null
  const sizeClasses = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 modal-backdrop" onClick={onClose}>
      <div className={`bg-white rounded-t-2xl sm:rounded-2xl shadow-2xl w-full ${sizeClasses[size]} animate-scale-in overflow-hidden max-h-[90vh] flex flex-col`} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-surface-100 shrink-0">
          <h3 className="text-lg sm:text-xl font-semibold text-surface-900 font-display">{title}</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-surface-100 text-surface-500 transition-colors"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-4 sm:p-6 overflow-y-auto">{children}</div>
      </div>
    </div>
  )
}

const IDIOMAS = ['Inglês', 'Espanhol', 'Francês']
const STATUS_PEDAGOGICO = ['ativo', 'trancado', 'concluido']
const STATUS_FINANCEIRO = ['em_dia', 'pendente', 'inadimplente']
const FORMAS_PAGAMENTO = ['PIX', 'Boleto', 'Cartão', 'Dinheiro', 'Transferência']
const ESTADOS_BR = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO']

const IDIOMA_COLORS = { 'Inglês': 'bg-blue-100 text-blue-700', 'Espanhol': 'bg-amber-100 text-amber-700', 'Francês': 'bg-rose-100 text-rose-700' }
const STATUS_COLORS = { 'ativo': 'bg-emerald-100 text-emerald-700', 'trancado': 'bg-amber-100 text-amber-700', 'concluido': 'bg-blue-100 text-blue-700', 'em_dia': 'bg-emerald-100 text-emerald-700', 'pendente': 'bg-amber-100 text-amber-700', 'inadimplente': 'bg-red-100 text-red-700' }
const STATUS_LABELS = { 'ativo': 'Ativo', 'trancado': 'Trancado', 'concluido': 'Concluído', 'em_dia': 'Em dia', 'pendente': 'Pendente', 'inadimplente': 'Inadimplente' }

const emptyFormAluno = {
  nome: '', cpf: '', rg: '', aniversario_dia: '', aniversario_mes: '', telefone: '', email: '',
  cep: '', rua: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '',
  responsavel_nome: '', responsavel_cpf: '', responsavel_telefone: '',
  data_inicio: '', status_pedagogico: 'ativo', observacoes_pedagogicas: '', usa_transporte: false,
  dia_vencimento: '', valor_mensalidade: '', forma_pagamento: 'PIX', desconto: '', status_financeiro: 'em_dia',
}

function AssistenteIA() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Olá! 👋 Sou o assistente virtual da EduLingua. Posso ajudar você a consultar informações sobre turmas, alunos, professores, presenças e finanças.\n\nExemplos de perguntas:\n• Quais turmas existem?\n• Quem são os alunos da turma de Inglês Básico?\n• Quem está inadimplente?\n• Quem faltou essa semana?\n• Quais são as estatísticas da escola?'
    }
  ])
  const [inputMsg, setInputMsg] = useState('')
  const [isLoadingChat, setIsLoadingChat] = useState(false)
  const [chatError, setChatError] = useState(null)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSendMessage(e) {
    e.preventDefault()
    if (!inputMsg.trim() || isLoadingChat) return

    const userMessage = inputMsg.trim()
    setInputMsg('')
    setChatError(null)
    setMessages(prev => [...prev, { role: 'user', content: userMessage }])
    setIsLoadingChat(true)

    try {
      const history = messages.slice(1).map(m => ({ role: m.role, content: m.content }))
      const response = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage, history: history.slice(-10) })
      })

      if (!response.ok) throw new Error(`Erro ${response.status}`)
      const data = await response.json()
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }])
    } catch (err) {
      setChatError(err.message)
      setMessages(prev => [...prev, { role: 'assistant', content: '❌ Erro ao processar. Tente novamente.' }])
    } finally {
      setIsLoadingChat(false)
    }
  }

  function formatMessage(content) {
    return content.split('\n').map((line, i) => {
      if (line.startsWith('• ') || line.startsWith('- ')) return <li key={i} className="ml-4">{line.substring(2)}</li>
      if (!line.trim()) return <br key={i} />
      return <p key={i}>{line}</p>
    })
  }

  return (
    <div className="animate-fade-in h-[calc(100vh-8rem)] sm:h-[calc(100vh-10rem)] flex flex-col">
      <div className="mb-4 sm:mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl sm:text-3xl font-display font-bold text-surface-900 mb-1 flex items-center gap-3">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Sparkles className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            Assistente IA
          </h2>
          <p className="text-surface-600 text-sm sm:text-base">Consulte informações da escola em linguagem natural</p>
        </div>
        <button onClick={() => setMessages([{ role: 'assistant', content: 'Conversa limpa! Como posso ajudar?' }])} className="flex items-center gap-2 px-3 py-2 text-sm text-surface-600 hover:text-red-600 hover:bg-red-50 rounded-lg">
          <Trash2 className="w-4 h-4" /><span className="hidden sm:inline">Limpar</span>
        </button>
      </div>

      <div className="flex-1 bg-white rounded-xl sm:rounded-2xl shadow-card overflow-hidden flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex-shrink-0 flex items-center justify-center ${msg.role === 'user' ? 'bg-brand-100 text-brand-600' : 'bg-gradient-to-br from-violet-500 to-purple-600 text-white'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4 sm:w-5 sm:h-5" /> : <Bot className="w-4 h-4 sm:w-5 sm:h-5" />}
              </div>
              <div className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-brand-600 text-white rounded-tr-md' : 'bg-surface-100 text-surface-800 rounded-tl-md'}`}>
                <div className="text-sm sm:text-base leading-relaxed space-y-1">{formatMessage(msg.content)}</div>
              </div>
            </div>
          ))}
          {isLoadingChat && (
            <div className="flex gap-3">
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-violet-500 to-purple-600 text-white">
                <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div className="bg-surface-100 rounded-2xl rounded-tl-md px-4 py-3">
                <div className="flex items-center gap-2 text-surface-500">
                  <Loader2 className="w-4 h-4 animate-spin" /><span className="text-sm">Pensando...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {chatError && (
          <div className="mx-4 sm:mx-6 mb-2 flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm">
            <AlertCircle className="w-4 h-4" /><span>{chatError}</span>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="p-4 sm:p-6 border-t border-surface-100">
          <div className="flex gap-3">
            <input ref={inputRef} type="text" value={inputMsg} onChange={(e) => setInputMsg(e.target.value)} placeholder="Digite sua pergunta..." disabled={isLoadingChat} className="flex-1 px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 text-sm sm:text-base disabled:opacity-50" />
            <button type="submit" disabled={!inputMsg.trim() || isLoadingChat} className="px-4 sm:px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-medium hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 flex items-center gap-2">
              {isLoadingChat ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              <span className="hidden sm:inline">Enviar</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function App() {
  const [usuario, setUsuario] = useState(null)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')
  const [turmas, setTurmas] = useState([])
  const [alunos, setAlunos] = useState([])
  const [usuarios, setUsuarios] = useState([])
  const [aulas, setAulas] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTurma, setSearchTurma] = useState('')
  const [searchAluno, setSearchAluno] = useState('')
  const [searchProfessor, setSearchProfessor] = useState('')
  const [toast, setToast] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const [modalTurma, setModalTurma] = useState({ open: false, data: null })
  const [modalAluno, setModalAluno] = useState({ open: false, data: null })
  const [modalMatricula, setModalMatricula] = useState({ open: false, turmaId: null })
  const [modalDetalheTurma, setModalDetalheTurma] = useState({ open: false, turma: null })
  const [modalDetalheAluno, setModalDetalheAluno] = useState({ open: false, aluno: null })
  const [modalProfessor, setModalProfessor] = useState({ open: false, data: null })
  const [modalAula, setModalAula] = useState({ open: false, turma: null, data: null })

  const [alunoTab, setAlunoTab] = useState('pessoais')
  const [diarioTurmaId, setDiarioTurmaId] = useState('')

  const [formTurma, setFormTurma] = useState({ nome: '', idioma: 'Inglês', professor_id: '', horario: '', dias_semana: '', livro: '' })
  const [formAluno, setFormAluno] = useState({ ...emptyFormAluno })
  const [formProfessor, setFormProfessor] = useState({ nome: '', email: '', senha: '' })
  const [formAula, setFormAula] = useState({ data: new Date().toISOString().split('T')[0], unidade_livro: '', conteudo: '', observacoes: '', presencas: {} })
  const [modalSenha, setModalSenha] = useState(false)
  const [formSenha, setFormSenha] = useState({ atual: '', nova: '', confirmar: '' })
  const [senhaLoading, setSenhaLoading] = useState(false)

  useEffect(() => {
    const savedUser = localStorage.getItem('edulingua_user')
    if (savedUser) {
      const user = JSON.parse(savedUser)
      setUsuario(user)
      if (user.perfil === 'professor') setActiveTab('diario')
    }
    setCheckingAuth(false)
  }, [])

  useEffect(() => { if (usuario) loadData() }, [usuario])

  useEffect(() => { setSidebarOpen(false) }, [activeTab])

  function handleLogin(user) {
    localStorage.setItem('edulingua_user', JSON.stringify(user))
    setUsuario(user)
    if (user.perfil === 'professor') setActiveTab('diario')
  }

  function handleLogout() {
    localStorage.removeItem('edulingua_user')
    setUsuario(null)
    setTurmas([])
    setAlunos([])
    setUsuarios([])
    setAulas([])
  }

  async function loadData() {
    setLoading(true)
    try {
      const [turmasRes, alunosRes, usuariosRes, aulasRes] = await Promise.all([
        supabase.from('turmas').select('*, matriculas(*, alunos(*)), professor:usuarios!turmas_professor_id_fkey(id, nome, email, perfil)').order('created_at', { ascending: false }),
        supabase.from('alunos').select('*, matriculas(*, turmas(*))').order('nome'),
        supabase.from('usuarios').select('*').eq('ativo', true).order('nome'),
        supabase.from('aulas').select('*, turma:turmas(*), presencas(*, aluno:alunos(*))').order('data', { ascending: false })
      ])
      if (turmasRes.error) throw turmasRes.error
      if (alunosRes.error) throw alunosRes.error
      if (usuariosRes.error) throw usuariosRes.error
      if (aulasRes.error) throw aulasRes.error
      setTurmas(turmasRes.data || [])
      setAlunos(alunosRes.data || [])
      setUsuarios(usuariosRes.data || [])
      setAulas(aulasRes.data || [])
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
      showToast('Erro ao carregar dados', 'error')
    }
    setLoading(false)
  }

  function showToast(message, type = 'info') { setToast({ message, type }) }

  const minhasTurmas = usuario?.perfil === 'professor' ? turmas.filter(t => t.professor_id === usuario.id) : turmas
  const usuariosParaDropdown = usuarios
  const professoresLista = usuarios.filter(u => u.perfil === 'professor')

  async function buscarCep(cep) {
    const cepLimpo = cep.replace(/\D/g, '')
    if (cepLimpo.length !== 8) return
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setFormAluno(prev => ({ ...prev, rua: data.logradouro || '', bairro: data.bairro || '', cidade: data.localidade || '', estado: data.uf || '' }))
      }
    } catch (error) { console.error('Erro ao buscar CEP:', error) }
  }

  async function saveTurma() {
    try {
      const dataToSave = { ...formTurma, professor_id: formTurma.professor_id || null }
      if (modalTurma.data) {
        const { error } = await supabase.from('turmas').update(dataToSave).eq('id', modalTurma.data.id)
        if (error) throw error
        showToast('Turma atualizada!', 'success')
      } else {
        const { error } = await supabase.from('turmas').insert([dataToSave])
        if (error) throw error
        showToast('Turma criada!', 'success')
      }
      setModalTurma({ open: false, data: null })
      resetFormTurma()
      loadData()
    } catch (error) { console.error('Erro ao salvar turma:', error); showToast('Erro ao salvar turma', 'error') }
  }

  async function deleteTurma(id) {
    if (!confirm('Excluir esta turma?')) return
    try {
      const { error } = await supabase.from('turmas').delete().eq('id', id)
      if (error) throw error
      showToast('Turma excluída!', 'success')
      loadData()
    } catch (error) { console.error('Erro ao excluir turma:', error); showToast('Erro ao excluir turma', 'error') }
  }

  function openEditTurma(turma) {
    setFormTurma({ nome: turma.nome, idioma: turma.idioma, professor_id: turma.professor_id || '', horario: turma.horario || '', dias_semana: turma.dias_semana || '', livro: turma.livro || '' })
    setModalTurma({ open: true, data: turma })
  }

  function resetFormTurma() { setFormTurma({ nome: '', idioma: 'Inglês', professor_id: '', horario: '', dias_semana: '', livro: '' }) }

  async function saveAluno() {
    try {
      const dataToSave = {
        ...formAluno,
        aniversario_dia: formAluno.aniversario_dia ? parseInt(formAluno.aniversario_dia) : null,
        aniversario_mes: formAluno.aniversario_mes ? parseInt(formAluno.aniversario_mes) : null,
        dia_vencimento: formAluno.dia_vencimento ? parseInt(formAluno.dia_vencimento) : null,
        valor_mensalidade: formAluno.valor_mensalidade ? parseFloat(formAluno.valor_mensalidade) : null,
        desconto: formAluno.desconto ? parseFloat(formAluno.desconto) : 0,
      }
      if (modalAluno.data) {
        const { error } = await supabase.from('alunos').update(dataToSave).eq('id', modalAluno.data.id)
        if (error) throw error
        showToast('Aluno atualizado!', 'success')
      } else {
        const { error } = await supabase.from('alunos').insert([dataToSave])
        if (error) throw error
        showToast('Aluno cadastrado!', 'success')
      }
      setModalAluno({ open: false, data: null })
      resetFormAluno()
      loadData()
    } catch (error) { console.error('Erro ao salvar aluno:', error); showToast('Erro ao salvar aluno', 'error') }
  }

  async function deleteAluno(id) {
    if (!confirm('Excluir este aluno?')) return
    try {
      const { error } = await supabase.from('alunos').delete().eq('id', id)
      if (error) throw error
      showToast('Aluno excluído!', 'success')
      loadData()
    } catch (error) { console.error('Erro ao excluir aluno:', error); showToast('Erro ao excluir aluno', 'error') }
  }

  function openEditAluno(aluno) {
    setFormAluno({
      nome: aluno.nome || '', cpf: aluno.cpf || '', rg: aluno.rg || '',
      aniversario_dia: aluno.aniversario_dia || '', aniversario_mes: aluno.aniversario_mes || '',
      telefone: aluno.telefone || '', email: aluno.email || '',
      cep: aluno.cep || '', rua: aluno.rua || '', numero: aluno.numero || '', complemento: aluno.complemento || '',
      bairro: aluno.bairro || '', cidade: aluno.cidade || '', estado: aluno.estado || '',
      responsavel_nome: aluno.responsavel_nome || '', responsavel_cpf: aluno.responsavel_cpf || '', responsavel_telefone: aluno.responsavel_telefone || '',
      data_inicio: aluno.data_inicio || '', status_pedagogico: aluno.status_pedagogico || 'ativo',
      observacoes_pedagogicas: aluno.observacoes_pedagogicas || '', usa_transporte: aluno.usa_transporte || false,
      dia_vencimento: aluno.dia_vencimento || '', valor_mensalidade: aluno.valor_mensalidade || '',
      forma_pagamento: aluno.forma_pagamento || 'PIX', desconto: aluno.desconto || '', status_financeiro: aluno.status_financeiro || 'em_dia',
    })
    setAlunoTab('pessoais')
    setModalAluno({ open: true, data: aluno })
  }

  function resetFormAluno() { setFormAluno({ ...emptyFormAluno }); setAlunoTab('pessoais') }

  async function saveProfessor() {
    try {
      if (modalProfessor.data) {
        const { error } = await supabase.from('usuarios').update({ nome: formProfessor.nome, email: formProfessor.email }).eq('id', modalProfessor.data.id)
        if (error) throw error
        if (formProfessor.senha) {
          const { error: senhaError } = await supabase.rpc('atualizar_senha', { p_usuario_id: modalProfessor.data.id, p_nova_senha: formProfessor.senha })
          if (senhaError) throw senhaError
        }
        showToast('Professor atualizado!', 'success')
      } else {
        const { error } = await supabase.rpc('criar_professor', { p_email: formProfessor.email, p_senha: formProfessor.senha, p_nome: formProfessor.nome })
        if (error) throw error
        showToast('Professor cadastrado!', 'success')
      }
      setModalProfessor({ open: false, data: null })
      setFormProfessor({ nome: '', email: '', senha: '' })
      loadData()
    } catch (error) {
      console.error('Erro ao salvar professor:', error)
      showToast(error.message?.includes('duplicate') ? 'Email já está em uso' : 'Erro ao salvar professor', 'error')
    }
  }

  async function deleteProfessor(id) {
    if (!confirm('Excluir este professor?')) return
    try {
      const { error } = await supabase.from('usuarios').delete().eq('id', id)
      if (error) throw error
      showToast('Professor excluído!', 'success')
      loadData()
    } catch (error) { console.error('Erro ao excluir professor:', error); showToast('Erro ao excluir professor', 'error') }
  }

  function openEditProfessor(professor) {
    setFormProfessor({ nome: professor.nome || '', email: professor.email || '', senha: '' })
    setModalProfessor({ open: true, data: professor })
  }

  async function matricularAluno(alunoId) {
    try {
      const { error } = await supabase.from('matriculas').insert([{ turma_id: modalMatricula.turmaId, aluno_id: alunoId }])
      if (error) {
        if (error.code === '23505') { showToast('Aluno já matriculado', 'error'); return }
        throw error
      }
      showToast('Aluno matriculado!', 'success')
      setModalMatricula({ open: false, turmaId: null })
      loadData()
    } catch (error) { console.error('Erro ao matricular:', error); showToast('Erro ao matricular', 'error') }
  }

  async function cancelarMatricula(turmaId, alunoId) {
    if (!confirm('Remover aluno da turma?')) return
    try {
      const { error } = await supabase.from('matriculas').delete().eq('turma_id', turmaId).eq('aluno_id', alunoId)
      if (error) throw error
      showToast('Matrícula cancelada', 'success')
      loadData()
    } catch (error) { console.error('Erro ao cancelar matrícula:', error); showToast('Erro ao cancelar', 'error') }
  }

  function openNovaAula(turma) {
    const presencasIniciais = {}
    turma.matriculas?.forEach(m => { if (m.alunos) presencasIniciais[m.alunos.id] = { presente: true, observacao: '' } })
    setFormAula({ data: new Date().toISOString().split('T')[0], unidade_livro: '', conteudo: '', observacoes: '', presencas: presencasIniciais })
    setModalAula({ open: true, turma, data: null })
  }

  function openEditAula(aula, turma) {
    const presencasMap = {}
    aula.presencas?.forEach(p => { presencasMap[p.aluno_id] = { presente: p.presente, observacao: p.observacao || '' } })
    turma.matriculas?.forEach(m => { if (m.alunos && !presencasMap[m.alunos.id]) presencasMap[m.alunos.id] = { presente: true, observacao: '' } })
    setFormAula({ data: aula.data, unidade_livro: aula.unidade_livro || '', conteudo: aula.conteudo || '', observacoes: aula.observacoes || '', presencas: presencasMap })
    setModalAula({ open: true, turma, data: aula })
  }

  async function saveAula() {
    try {
      let aulaId = modalAula.data?.id
      if (modalAula.data) {
        const { error } = await supabase.from('aulas').update({ data: formAula.data, unidade_livro: formAula.unidade_livro, conteudo: formAula.conteudo, observacoes: formAula.observacoes }).eq('id', aulaId)
        if (error) throw error
        await supabase.from('presencas').delete().eq('aula_id', aulaId)
      } else {
        const { data, error } = await supabase.from('aulas').insert([{ turma_id: modalAula.turma.id, data: formAula.data, unidade_livro: formAula.unidade_livro, conteudo: formAula.conteudo, observacoes: formAula.observacoes }]).select()
        if (error) throw error
        aulaId = data[0].id
      }
      const presencasToInsert = Object.entries(formAula.presencas).map(([alunoId, p]) => ({ aula_id: aulaId, aluno_id: alunoId, presente: p.presente, observacao: p.observacao || null }))
      if (presencasToInsert.length > 0) {
        const { error } = await supabase.from('presencas').insert(presencasToInsert)
        if (error) throw error
      }
      showToast(modalAula.data ? 'Aula atualizada!' : 'Aula registrada!', 'success')
      setModalAula({ open: false, turma: null, data: null })
      loadData()
    } catch (error) { console.error('Erro ao salvar aula:', error); showToast('Erro ao salvar aula', 'error') }
  }

  async function deleteAula(aulaId) {
    if (!confirm('Excluir esta aula?')) return
    try {
      const { error } = await supabase.from('aulas').delete().eq('id', aulaId)
      if (error) throw error
      showToast('Aula excluída!', 'success')
      loadData()
    } catch (error) { console.error('Erro ao excluir aula:', error); showToast('Erro ao excluir aula', 'error') }
  }

  async function alterarSenha() {
    if (formSenha.nova !== formSenha.confirmar) { showToast('As senhas não coincidem', 'error'); return }
    if (formSenha.nova.length < 4) { showToast('A nova senha deve ter pelo menos 4 caracteres', 'error'); return }
    setSenhaLoading(true)
    try {
      const { data, error } = await supabase.rpc('alterar_minha_senha', { p_usuario_id: usuario.id, p_senha_atual: formSenha.atual, p_nova_senha: formSenha.nova })
      if (error) throw error
      if (data === true) { showToast('Senha alterada com sucesso!', 'success'); setModalSenha(false); setFormSenha({ atual: '', nova: '', confirmar: '' }) }
      else { showToast('Senha atual incorreta', 'error') }
    } catch (error) { console.error('Erro ao alterar senha:', error); showToast('Erro ao alterar senha', 'error') }
    setSenhaLoading(false)
  }

  const turmasFiltradas = turmas.filter(t => t.nome.toLowerCase().includes(searchTurma.toLowerCase()) || t.idioma.toLowerCase().includes(searchTurma.toLowerCase()) || (t.professor?.nome && t.professor.nome.toLowerCase().includes(searchTurma.toLowerCase())) || (t.livro && t.livro.toLowerCase().includes(searchTurma.toLowerCase())))
  const alunosFiltrados = alunos.filter(a => (a.nome || '').toLowerCase().includes(searchAluno.toLowerCase()) || (a.email && a.email.toLowerCase().includes(searchAluno.toLowerCase())) || (a.cpf && a.cpf.includes(searchAluno)))
  const professoresFiltrados = professoresLista.filter(p => (p.nome || '').toLowerCase().includes(searchProfessor.toLowerCase()) || (p.email && p.email.toLowerCase().includes(searchProfessor.toLowerCase())))
  const alunosDisponiveis = alunos.filter(a => { const turma = turmas.find(t => t.id === modalMatricula.turmaId); if (!turma) return true; return !turma.matriculas?.some(m => m.aluno_id === a.id) })
  const aulasDaTurma = aulas.filter(a => a.turma_id === diarioTurmaId)
  const turmaSelecionada = minhasTurmas.find(t => t.id === diarioTurmaId)

  const stats = { totalTurmas: turmas.length, totalAlunos: alunos.length, totalProfessores: professoresLista.length, alunosAtivos: alunos.filter(a => a.status_pedagogico === 'ativo').length, alunosPendentes: alunos.filter(a => a.status_financeiro === 'pendente' || a.status_financeiro === 'inadimplente').length }

  function formatCurrency(value) { if (!value) return '-'; return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value) }

 const menuItems = usuario?.perfil === 'professor' 
    ? [{ id: 'diario', icon: ClipboardList, label: 'Diário de Classe' }]
    : [
        { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
        { id: 'turmas', icon: BookOpen, label: 'Turmas' },
        { id: 'alunos', icon: Users, label: 'Alunos' },
        { id: 'professores', icon: GraduationCap, label: 'Professores' },
        { id: 'diario', icon: ClipboardList, label: 'Diário de Classe' },
        { id: 'assistente', icon: Bot, label: 'Assistente IA' },
      ]

  return (
    <>
      {checkingAuth ? (
        <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 text-brand-500 animate-spin" /></div>
      ) : !usuario ? (
        <LoginScreen onLogin={handleLogin} />
      ) : (
        <div className="min-h-screen">
          {/* Mobile Header */}
          <header className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-surface-200 z-40 flex items-center justify-between px-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-surface-100">
                <Menu className="w-6 h-6 text-surface-600" />
              </button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-brand-500 to-accent-500 rounded-lg flex items-center justify-center">
                  <Globe2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-display font-bold text-surface-900">EduLingua</span>
              </div>
            </div>
            <div className="w-8 h-8 bg-surface-100 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-surface-600" />
            </div>
          </header>

          {/* Mobile Sidebar Overlay */}
          {sidebarOpen && (
            <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setSidebarOpen(false)}>
              <aside className="w-72 h-full bg-white shadow-xl" onClick={e => e.stopPropagation()}>
                <div className="p-4 border-b border-surface-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-accent-500 rounded-xl flex items-center justify-center">
                      <Globe2 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h1 className="font-display font-bold text-surface-900">EduLingua</h1>
                      <p className="text-xs text-surface-500">{usuario?.perfil === 'professor' ? 'Área do Professor' : 'Gestão de Turmas'}</p>
                    </div>
                  </div>
                  <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-lg hover:bg-surface-100">
                    <X className="w-5 h-5 text-surface-500" />
                  </button>
                </div>
                <nav className="p-4 space-y-1">
                  {menuItems.map(item => (
                    <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeTab === item.id ? 'bg-brand-50 text-brand-600 font-medium' : 'text-surface-600 hover:bg-surface-50'}`}>
                      <item.icon className="w-5 h-5" />{item.label}
                    </button>
                  ))}
                </nav>
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-surface-100">
                  <div className="flex items-center gap-3 mb-3 p-2 bg-surface-50 rounded-xl">
                    <div className="w-10 h-10 bg-surface-200 rounded-full flex items-center justify-center"><User className="w-5 h-5 text-surface-600" /></div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-surface-900 truncate">{usuario?.nome || 'Usuário'}</p>
                      <p className="text-xs text-surface-500 truncate">{usuario?.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => { setModalSenha(true); setSidebarOpen(false) }} className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-surface-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                      <Lock className="w-4 h-4" />Senha
                    </button>
                    <button onClick={handleLogout} className="flex items-center justify-center gap-2 px-3 py-2 text-sm text-surface-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                      <LogOut className="w-4 h-4" />Sair
                    </button>
                  </div>
                </div>
              </aside>
            </div>
          )}

          {/* Desktop Sidebar */}
          <aside className="hidden lg:block fixed left-0 top-0 h-full w-64 bg-white border-r border-surface-200 shadow-soft z-40">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-accent-500 rounded-xl flex items-center justify-center">
                  <Globe2 className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="font-display font-bold text-surface-900">EduLingua</h1>
                  <p className="text-xs text-surface-500">{usuario?.perfil === 'professor' ? 'Área do Professor' : 'Gestão de Turmas'}</p>
                </div>
              </div>
              <nav className="space-y-1">
                {menuItems.map(item => (
                  <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeTab === item.id ? 'bg-brand-50 text-brand-600 font-medium' : 'text-surface-600 hover:bg-surface-50'}`}>
                    <item.icon className="w-5 h-5" />{item.label}
                  </button>
                ))}
              </nav>
            </div>
            <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-surface-100">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-surface-100 rounded-full flex items-center justify-center"><User className="w-5 h-5 text-surface-600" /></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-surface-900 truncate">{usuario?.nome || 'Usuário'}</p>
                  <p className="text-xs text-surface-500 truncate">{usuario?.email}</p>
                </div>
              </div>
              <div className="space-y-1">
                <button onClick={() => setModalSenha(true)} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-surface-600 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors">
                  <Lock className="w-4 h-4" />Alterar Senha
                </button>
                <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm text-surface-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <LogOut className="w-4 h-4" />Sair
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="lg:ml-64 min-h-screen pt-16 lg:pt-0">
            <div className="p-4 sm:p-6 lg:p-8">
              {loading ? <LoadingSpinner /> : (
                <>
                  {/* Dashboard */}
                  {activeTab === 'dashboard' && usuario?.perfil === 'admin' && (
                    <div className="animate-fade-in">
                      <div className="mb-6 sm:mb-8">
                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-surface-900 mb-1 sm:mb-2">Dashboard</h2>
                        <p className="text-surface-600 text-sm sm:text-base">Visão geral da escola</p>
                      </div>
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-6 sm:mb-8">
                        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-card">
                          <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-brand-100 rounded-lg sm:rounded-xl flex items-center justify-center"><BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-brand-600" /></div>
                            <span className="text-2xl sm:text-3xl font-display font-bold text-surface-900">{stats.totalTurmas}</span>
                          </div>
                          <h3 className="font-medium text-surface-900 text-sm sm:text-base">Turmas</h3>
                        </div>
                        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-card">
                          <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-accent-100 rounded-lg sm:rounded-xl flex items-center justify-center"><Users className="w-5 h-5 sm:w-6 sm:h-6 text-accent-600" /></div>
                            <span className="text-2xl sm:text-3xl font-display font-bold text-surface-900">{stats.totalAlunos}</span>
                          </div>
                          <h3 className="font-medium text-surface-900 text-sm sm:text-base">Alunos</h3>
                          <p className="text-xs sm:text-sm text-surface-500">{stats.alunosAtivos} ativos</p>
                        </div>
                        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-card">
                          <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-lg sm:rounded-xl flex items-center justify-center"><GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" /></div>
                            <span className="text-2xl sm:text-3xl font-display font-bold text-surface-900">{stats.totalProfessores}</span>
                          </div>
                          <h3 className="font-medium text-surface-900 text-sm sm:text-base">Professores</h3>
                        </div>
                        <div className="bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 shadow-card">
                          <div className="flex items-center justify-between mb-3 sm:mb-4">
                            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-lg sm:rounded-xl flex items-center justify-center"><AlertCircle className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" /></div>
                            <span className="text-2xl sm:text-3xl font-display font-bold text-surface-900">{stats.alunosPendentes}</span>
                          </div>
                          <h3 className="font-medium text-surface-900 text-sm sm:text-base">Pendentes</h3>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-card overflow-hidden">
                          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-surface-100 flex items-center justify-between">
                            <h3 className="font-display font-semibold text-surface-900 text-sm sm:text-base">Turmas Recentes</h3>
                            <button onClick={() => setActiveTab('turmas')} className="text-xs sm:text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">Ver todas <ChevronRight className="w-4 h-4" /></button>
                          </div>
                          <div className="divide-y divide-surface-100">
                            {turmas.slice(0, 5).map(turma => (
                              <div key={turma.id} className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-surface-50">
                                <div className="flex items-center gap-3 sm:gap-4">
                                  <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center ${IDIOMA_COLORS[turma.idioma] || 'bg-surface-100'}`}><Globe2 className="w-4 h-4 sm:w-5 sm:h-5" /></div>
                                  <div>
                                    <p className="font-medium text-surface-900 text-sm sm:text-base">{turma.nome}</p>
                                    <p className="text-xs sm:text-sm text-surface-500">{turma.idioma}</p>
                                  </div>
                                </div>
                                <span className="text-xs sm:text-sm text-surface-600">{turma.matriculas?.length || 0} alunos</span>
                              </div>
                            ))}
                            {turmas.length === 0 && <div className="px-4 sm:px-6 py-6 sm:py-8 text-center text-surface-500 text-sm">Nenhuma turma</div>}
                          </div>
                        </div>
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-card overflow-hidden">
                          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-surface-100 flex items-center justify-between">
                            <h3 className="font-display font-semibold text-surface-900 text-sm sm:text-base">Alunos com Pendências</h3>
                            <button onClick={() => setActiveTab('alunos')} className="text-xs sm:text-sm text-brand-600 hover:text-brand-700 font-medium flex items-center gap-1">Ver todos <ChevronRight className="w-4 h-4" /></button>
                          </div>
                          <div className="divide-y divide-surface-100">
                            {alunos.filter(a => a.status_financeiro !== 'em_dia').slice(0, 5).map(aluno => (
                              <div key={aluno.id} className="px-4 sm:px-6 py-3 sm:py-4 flex items-center justify-between hover:bg-surface-50">
                                <div className="flex items-center gap-3 sm:gap-4">
                                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-brand-400 to-accent-400 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm">{(aluno.nome || '?').charAt(0).toUpperCase()}</div>
                                  <div>
                                    <p className="font-medium text-surface-900 text-sm sm:text-base">{aluno.nome || 'Sem nome'}</p>
                                    <p className="text-xs sm:text-sm text-surface-500">Venc. dia {aluno.dia_vencimento || '-'}</p>
                                  </div>
                                </div>
                                <span className={`badge text-xs ${STATUS_COLORS[aluno.status_financeiro]}`}>{STATUS_LABELS[aluno.status_financeiro]}</span>
                              </div>
                            ))}
                            {alunos.filter(a => a.status_financeiro !== 'em_dia').length === 0 && <div className="px-4 sm:px-6 py-6 sm:py-8 text-center text-surface-500 text-sm">Todos em dia! 🎉</div>}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  {/* Turmas */}
                  {activeTab === 'turmas' && usuario?.perfil === 'admin' && (
                    <div className="animate-fade-in">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-display font-bold text-surface-900 mb-1 sm:mb-2">Turmas</h2>
                          <p className="text-surface-600 text-sm sm:text-base">Gerencie as turmas</p>
                        </div>
                        <button onClick={() => { resetFormTurma(); setModalTurma({ open: true, data: null }) }} className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 shadow-lg shadow-brand-500/25 text-sm sm:text-base">
                          <Plus className="w-5 h-5" />Nova Turma
                        </button>
                      </div>
                      <div className="bg-white rounded-xl sm:rounded-2xl shadow-card overflow-hidden">
                        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-surface-100">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                            <input type="text" placeholder="Buscar turmas..." value={searchTurma} onChange={(e) => setSearchTurma(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-surface-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm sm:text-base" />
                          </div>
                        </div>
                        <div className="sm:hidden divide-y divide-surface-100">
                          {turmasFiltradas.map(turma => (
                            <div key={turma.id} className="p-4">
                              <div className="flex items-start gap-3 mb-3">
                                <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${IDIOMA_COLORS[turma.idioma] || 'bg-surface-100'}`}><Globe2 className="w-5 h-5" /></div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-surface-900">{turma.nome}</p>
                                  <div className="flex items-center gap-2 mt-1 flex-wrap">
                                    <span className={`badge text-xs ${IDIOMA_COLORS[turma.idioma] || 'bg-surface-100 text-surface-600'}`}>{turma.idioma}</span>
                                    <span className="text-xs text-surface-500">{turma.matriculas?.length || 0} alunos</span>
                                  </div>
                                </div>
                              </div>
                              {turma.professor && <p className="text-xs text-surface-500 mb-1">Prof. {turma.professor.nome}</p>}
                              {turma.horario && <p className="text-xs text-surface-500 flex items-center gap-1 mb-3"><Clock className="w-3 h-3" />{turma.horario}</p>}
                              <div className="flex items-center gap-2 pt-3 border-t border-surface-100">
                                <button onClick={() => setModalDetalheTurma({ open: true, turma })} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-surface-50 text-surface-600 text-sm"><Users className="w-4 h-4" />Alunos</button>
                                <button onClick={() => setModalMatricula({ open: true, turmaId: turma.id })} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-brand-50 text-brand-600 text-sm"><UserPlus className="w-4 h-4" />Matricular</button>
                                <button onClick={() => openEditTurma(turma)} className="p-2 rounded-lg hover:bg-surface-100 text-surface-500"><Edit2 className="w-4 h-4" /></button>
                                <button onClick={() => deleteTurma(turma.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="hidden sm:block divide-y divide-surface-100">
                          {turmasFiltradas.map(turma => (
                            <div key={turma.id} className="px-6 py-4 flex items-center justify-between table-row-hover">
                              <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${IDIOMA_COLORS[turma.idioma] || 'bg-surface-100'}`}><Globe2 className="w-6 h-6" /></div>
                                <div>
                                  <p className="font-semibold text-surface-900">{turma.nome}</p>
                                  <div className="flex items-center gap-3 mt-1">
                                    <span className={`badge ${IDIOMA_COLORS[turma.idioma] || 'bg-surface-100 text-surface-600'}`}>{turma.idioma}</span>
                                    {turma.professor && <span className="text-sm text-surface-500">Prof. {turma.professor.nome}</span>}
                                    {turma.livro && <span className="text-sm text-surface-500 flex items-center gap-1"><BookMarked className="w-3 h-3" />{turma.livro}</span>}
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="text-right"><p className="font-semibold text-surface-900">{turma.matriculas?.length || 0}</p><p className="text-xs text-surface-500">alunos</p></div>
                                {turma.horario && <div className="flex items-center gap-1.5 text-surface-500"><Clock className="w-4 h-4" /><span className="text-sm">{turma.horario}</span></div>}
                                <div className="flex items-center gap-1">
                                  <button onClick={() => setModalDetalheTurma({ open: true, turma })} className="p-2 rounded-lg hover:bg-surface-100 text-surface-500"><Users className="w-5 h-5" /></button>
                                  <button onClick={() => setModalMatricula({ open: true, turmaId: turma.id })} className="p-2 rounded-lg hover:bg-brand-50 text-brand-600"><UserPlus className="w-5 h-5" /></button>
                                  <button onClick={() => openEditTurma(turma)} className="p-2 rounded-lg hover:bg-surface-100 text-surface-500"><Edit2 className="w-5 h-5" /></button>
                                  <button onClick={() => deleteTurma(turma.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-5 h-5" /></button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {turmasFiltradas.length === 0 && <div className="px-4 sm:px-6 py-8 sm:py-12 text-center"><BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-surface-300 mx-auto mb-4" /><p className="text-surface-500 text-sm sm:text-base">Nenhuma turma</p></div>}
                      </div>
                    </div>
                  )}

                  {/* Alunos */}
                  {activeTab === 'alunos' && usuario?.perfil === 'admin' && (
                    <div className="animate-fade-in">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-display font-bold text-surface-900 mb-1 sm:mb-2">Alunos</h2>
                          <p className="text-surface-600 text-sm sm:text-base">Gerencie os alunos</p>
                        </div>
                        <button onClick={() => { resetFormAluno(); setModalAluno({ open: true, data: null }) }} className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-accent-600 text-white rounded-xl font-medium hover:bg-accent-700 shadow-lg shadow-accent-500/25 text-sm sm:text-base">
                          <Plus className="w-5 h-5" />Novo Aluno
                        </button>
                      </div>
                      <div className="bg-white rounded-xl sm:rounded-2xl shadow-card overflow-hidden">
                        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-surface-100">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                            <input type="text" placeholder="Buscar por nome, email ou CPF..." value={searchAluno} onChange={(e) => setSearchAluno(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 text-sm sm:text-base" />
                          </div>
                        </div>
                        <div className="sm:hidden divide-y divide-surface-100">
                          {alunosFiltrados.map(aluno => (
                            <div key={aluno.id} className="p-4">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-brand-400 to-accent-400 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">{(aluno.nome || '?').charAt(0).toUpperCase()}</div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-semibold text-surface-900 truncate">{aluno.nome || 'Sem nome'}</p>
                                  <p className="text-xs text-surface-500 truncate">{aluno.email || aluno.telefone || 'Sem contato'}</p>
                                </div>
                              </div>
                              <div className="flex flex-wrap gap-1 mb-3">
                                <span className={`badge text-xs ${STATUS_COLORS[aluno.status_pedagogico]}`}>{STATUS_LABELS[aluno.status_pedagogico]}</span>
                                <span className={`badge text-xs ${STATUS_COLORS[aluno.status_financeiro]}`}>{STATUS_LABELS[aluno.status_financeiro]}</span>
                              </div>
                              {aluno.matriculas?.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {aluno.matriculas?.slice(0, 2).map(m => <span key={m.id} className={`badge text-xs ${IDIOMA_COLORS[m.turmas?.idioma] || 'bg-surface-100 text-surface-600'}`}>{m.turmas?.nome}</span>)}
                                  {(aluno.matriculas?.length || 0) > 2 && <span className="badge bg-surface-100 text-surface-600 text-xs">+{aluno.matriculas.length - 2}</span>}
                                </div>
                              )}
                              <div className="flex items-center gap-2 pt-3 border-t border-surface-100">
                                <button onClick={() => setModalDetalheAluno({ open: true, aluno })} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-surface-50 text-surface-600 text-sm"><Eye className="w-4 h-4" />Ver</button>
                                <button onClick={() => openEditAluno(aluno)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-accent-50 text-accent-600 text-sm"><Edit2 className="w-4 h-4" />Editar</button>
                                <button onClick={() => deleteAluno(aluno.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="hidden sm:block divide-y divide-surface-100">
                          {alunosFiltrados.map(aluno => (
                            <div key={aluno.id} className="px-6 py-4 flex items-center justify-between table-row-hover">
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-brand-400 to-accent-400 rounded-full flex items-center justify-center text-white font-semibold">{(aluno.nome || '?').charAt(0).toUpperCase()}</div>
                                <div>
                                  <p className="font-semibold text-surface-900">{aluno.nome || 'Sem nome'}</p>
                                  <p className="text-sm text-surface-500">{aluno.email || aluno.telefone || 'Sem contato'}</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="flex flex-wrap gap-1 max-w-xs">
                                  {aluno.matriculas?.slice(0, 2).map(m => <span key={m.id} className={`badge text-xs ${IDIOMA_COLORS[m.turmas?.idioma] || 'bg-surface-100 text-surface-600'}`}>{m.turmas?.nome}</span>)}
                                  {(aluno.matriculas?.length || 0) > 2 && <span className="badge bg-surface-100 text-surface-600 text-xs">+{aluno.matriculas.length - 2}</span>}
                                </div>
                                <span className={`badge ${STATUS_COLORS[aluno.status_pedagogico]}`}>{STATUS_LABELS[aluno.status_pedagogico]}</span>
                                <span className={`badge ${STATUS_COLORS[aluno.status_financeiro]}`}>{STATUS_LABELS[aluno.status_financeiro]}</span>
                                <div className="flex items-center gap-1">
                                  <button onClick={() => setModalDetalheAluno({ open: true, aluno })} className="p-2 rounded-lg hover:bg-surface-100 text-surface-500"><Eye className="w-5 h-5" /></button>
                                  <button onClick={() => openEditAluno(aluno)} className="p-2 rounded-lg hover:bg-surface-100 text-surface-500"><Edit2 className="w-5 h-5" /></button>
                                  <button onClick={() => deleteAluno(aluno.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-5 h-5" /></button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        {alunosFiltrados.length === 0 && <div className="px-4 sm:px-6 py-8 sm:py-12 text-center"><Users className="w-10 h-10 sm:w-12 sm:h-12 text-surface-300 mx-auto mb-4" /><p className="text-surface-500 text-sm sm:text-base">Nenhum aluno</p></div>}
                      </div>
                    </div>
                  )}

                  {/* Professores */}
                  {activeTab === 'professores' && usuario?.perfil === 'admin' && (
                    <div className="animate-fade-in">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 sm:mb-8">
                        <div>
                          <h2 className="text-2xl sm:text-3xl font-display font-bold text-surface-900 mb-1 sm:mb-2">Professores</h2>
                          <p className="text-surface-600 text-sm sm:text-base">Gerencie os professores</p>
                        </div>
                        <button onClick={() => { setFormProfessor({ nome: '', email: '', senha: '' }); setModalProfessor({ open: true, data: null }) }} className="flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 sm:py-3 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 shadow-lg shadow-purple-500/25 text-sm sm:text-base">
                          <Plus className="w-5 h-5" />Novo Professor
                        </button>
                      </div>
                      <div className="bg-white rounded-xl sm:rounded-2xl shadow-card overflow-hidden">
                        <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-surface-100">
                          <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-surface-400" />
                            <input type="text" placeholder="Buscar professores..." value={searchProfessor} onChange={(e) => setSearchProfessor(e.target.value)} className="w-full pl-10 pr-4 py-2.5 border border-surface-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-sm sm:text-base" />
                          </div>
                        </div>
                        <div className="sm:hidden divide-y divide-surface-100">
                          {professoresFiltrados.map(professor => {
                            const turmasDoProfessor = turmas.filter(t => t.professor_id === professor.id)
                            return (
                              <div key={professor.id} className="p-4">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">{(professor.nome || '?').charAt(0).toUpperCase()}</div>
                                  <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-surface-900 truncate">{professor.nome || 'Sem nome'}</p>
                                    <p className="text-xs text-surface-500 truncate">{professor.email}</p>
                                  </div>
                                </div>
                                {turmasDoProfessor.length > 0 ? (
                                  <div className="flex flex-wrap gap-1 mb-3">
                                    {turmasDoProfessor.slice(0, 3).map(t => <span key={t.id} className={`badge text-xs ${IDIOMA_COLORS[t.idioma] || 'bg-surface-100 text-surface-600'}`}>{t.nome}</span>)}
                                    {turmasDoProfessor.length > 3 && <span className="badge bg-surface-100 text-surface-600 text-xs">+{turmasDoProfessor.length - 3}</span>}
                                  </div>
                                ) : <p className="text-xs text-surface-400 mb-3">Sem turmas</p>}
                                <div className="flex items-center gap-2 pt-3 border-t border-surface-100">
                                  <button onClick={() => openEditProfessor(professor)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-purple-50 text-purple-600 text-sm"><Edit2 className="w-4 h-4" />Editar</button>
                                  <button onClick={() => deleteProfessor(professor.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        <div className="hidden sm:block divide-y divide-surface-100">
                          {professoresFiltrados.map(professor => {
                            const turmasDoProfessor = turmas.filter(t => t.professor_id === professor.id)
                            return (
                              <div key={professor.id} className="px-6 py-4 flex items-center justify-between table-row-hover">
                                <div className="flex items-center gap-4">
                                  <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-semibold">{(professor.nome || '?').charAt(0).toUpperCase()}</div>
                                  <div>
                                    <p className="font-semibold text-surface-900">{professor.nome || 'Sem nome'}</p>
                                    <p className="text-sm text-surface-500">{professor.email}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-4">
                                  <div className="flex flex-wrap gap-1 max-w-xs">
                                    {turmasDoProfessor.slice(0, 3).map(t => <span key={t.id} className={`badge text-xs ${IDIOMA_COLORS[t.idioma] || 'bg-surface-100 text-surface-600'}`}>{t.nome}</span>)}
                                    {turmasDoProfessor.length > 3 && <span className="badge bg-surface-100 text-surface-600 text-xs">+{turmasDoProfessor.length - 3}</span>}
                                    {turmasDoProfessor.length === 0 && <span className="text-sm text-surface-400">Sem turmas</span>}
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <button onClick={() => openEditProfessor(professor)} className="p-2 rounded-lg hover:bg-surface-100 text-surface-500"><Edit2 className="w-5 h-5" /></button>
                                    <button onClick={() => deleteProfessor(professor.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-5 h-5" /></button>
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        {professoresFiltrados.length === 0 && <div className="px-4 sm:px-6 py-8 sm:py-12 text-center"><GraduationCap className="w-10 h-10 sm:w-12 sm:h-12 text-surface-300 mx-auto mb-4" /><p className="text-surface-500 text-sm sm:text-base">Nenhum professor</p></div>}
                      </div>
                    </div>
                  )}

{/* Diário de Classe */}
                  {activeTab === 'diario' && (
                    <div className="animate-fade-in">
                      <div className="mb-6 sm:mb-8">
                        <h2 className="text-2xl sm:text-3xl font-display font-bold text-surface-900 mb-1 sm:mb-2">Diário de Classe</h2>
                        <p className="text-surface-600 text-sm sm:text-base">Registre aulas e controle presença</p>
                      </div>
                      <div className="bg-white rounded-xl sm:rounded-2xl shadow-card p-4 sm:p-6 mb-4 sm:mb-6">
                        <label className="block text-sm font-medium text-surface-700 mb-2">Selecione a Turma</label>
                        <select value={diarioTurmaId} onChange={(e) => setDiarioTurmaId(e.target.value)} className="w-full px-4 py-3 border border-surface-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm sm:text-base">
                          <option value="">Escolha uma turma...</option>
                          {minhasTurmas.map(t => <option key={t.id} value={t.id}>{t.nome} - {t.idioma}</option>)}
                        </select>
                      </div>
                      {diarioTurmaId && turmaSelecionada && (
                        <div className="bg-white rounded-xl sm:rounded-2xl shadow-card overflow-hidden">
                          <div className="px-4 sm:px-6 py-3 sm:py-4 border-b border-surface-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                            <div>
                              <h3 className="font-display font-semibold text-surface-900">{turmaSelecionada.nome}</h3>
                              <p className="text-xs sm:text-sm text-surface-500">{turmaSelecionada.matriculas?.length || 0} alunos{turmaSelecionada.livro && ` • ${turmaSelecionada.livro}`}</p>
                            </div>
                            <button onClick={() => openNovaAula(turmaSelecionada)} className="flex items-center justify-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 text-sm">
                              <Plus className="w-4 h-4" />Registrar Aula
                            </button>
                          </div>
                          <div className="sm:hidden divide-y divide-surface-100">
                            {aulasDaTurma.map(aula => {
                              const presentes = aula.presencas?.filter(p => p.presente).length || 0
                              const total = aula.presencas?.length || 0
                              return (
                                <div key={aula.id} className="p-4">
                                  <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-surface-100 rounded-xl flex items-center justify-center"><ClipboardList className="w-5 h-5 text-surface-600" /></div>
                                      <div>
                                        <p className="font-semibold text-surface-900">{new Date(aula.data + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                                        <p className="text-xs text-surface-500">{aula.unidade_livro || 'Sem unidade'}</p>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-1 text-sm"><UserCheck className="w-4 h-4 text-emerald-500" /><span className="font-medium">{presentes}/{total}</span></div>
                                  </div>
                                  <div className="flex items-center gap-2 pt-3 border-t border-surface-100">
                                    <button onClick={() => openEditAula(aula, turmaSelecionada)} className="flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-lg bg-surface-50 text-surface-600 text-sm"><Edit2 className="w-4 h-4" />Editar</button>
                                    <button onClick={() => deleteAula(aula.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-4 h-4" /></button>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                          <div className="hidden sm:block divide-y divide-surface-100">
                            {aulasDaTurma.map(aula => {
                              const presentes = aula.presencas?.filter(p => p.presente).length || 0
                              const total = aula.presencas?.length || 0
                              return (
                                <div key={aula.id} className="px-6 py-4 flex items-center justify-between table-row-hover">
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-surface-100 rounded-xl flex items-center justify-center"><ClipboardList className="w-6 h-6 text-surface-600" /></div>
                                    <div>
                                      <p className="font-semibold text-surface-900">{new Date(aula.data + 'T12:00:00').toLocaleDateString('pt-BR')}</p>
                                      <p className="text-sm text-surface-500">{aula.unidade_livro || 'Sem unidade'}</p>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2"><UserCheck className="w-4 h-4 text-emerald-500" /><span className="text-sm font-medium">{presentes}/{total}</span></div>
                                    <div className="flex items-center gap-1">
                                      <button onClick={() => openEditAula(aula, turmaSelecionada)} className="p-2 rounded-lg hover:bg-surface-100 text-surface-500"><Edit2 className="w-5 h-5" /></button>
                                      <button onClick={() => deleteAula(aula.id)} className="p-2 rounded-lg hover:bg-red-50 text-red-500"><Trash2 className="w-5 h-5" /></button>
                                    </div>
                                  </div>
                                </div>
                              )
                            })}
                          </div>
                          {aulasDaTurma.length === 0 && <div className="px-4 sm:px-6 py-8 sm:py-12 text-center"><ClipboardList className="w-10 h-10 sm:w-12 sm:h-12 text-surface-300 mx-auto mb-4" /><p className="text-surface-500 text-sm sm:text-base">Nenhuma aula registrada</p></div>}
                        </div>
                      )}
                      {!diarioTurmaId && <div className="bg-white rounded-xl sm:rounded-2xl shadow-card p-8 sm:p-12 text-center"><BookOpen className="w-12 h-12 sm:w-16 sm:h-16 text-surface-300 mx-auto mb-4" /><p className="text-surface-500 text-sm sm:text-base">Selecione uma turma</p></div>}
                    </div>
                  )}

                  {/* Assistente IA - Apenas Admin */}
                  {activeTab === 'assistente' && usuario?.perfil === 'admin' && (
                    <AssistenteIA />
                  )}

                </>
              )}
            </div>
          </main>

          {/* Modal Turma */}
          <Modal isOpen={modalTurma.open} onClose={() => setModalTurma({ open: false, data: null })} title={modalTurma.data ? 'Editar Turma' : 'Nova Turma'}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Nome da Turma *</label>
                <input type="text" value={formTurma.nome} onChange={(e) => setFormTurma({ ...formTurma, nome: e.target.value })} placeholder="Ex: Inglês Básico - Segunda 19h" className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm sm:text-base" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Idioma *</label>
                  <select value={formTurma.idioma} onChange={(e) => setFormTurma({ ...formTurma, idioma: e.target.value })} className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm sm:text-base">
                    {IDIOMAS.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Professor</label>
                  <select value={formTurma.professor_id} onChange={(e) => setFormTurma({ ...formTurma, professor_id: e.target.value })} className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm sm:text-base">
                    <option value="">Selecione...</option>
                    {usuariosParaDropdown.map(u => <option key={u.id} value={u.id}>{u.nome}{u.perfil === 'admin' ? ' (Admin)' : ''}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Horário</label>
                  <input type="text" value={formTurma.horario} onChange={(e) => setFormTurma({ ...formTurma, horario: e.target.value })} placeholder="Ex: 19:00 - 21:00" className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm sm:text-base" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Dias da Semana</label>
                  <input type="text" value={formTurma.dias_semana} onChange={(e) => setFormTurma({ ...formTurma, dias_semana: e.target.value })} placeholder="Ex: Seg, Qua, Sex" className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm sm:text-base" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Livro</label>
                <input type="text" value={formTurma.livro} onChange={(e) => setFormTurma({ ...formTurma, livro: e.target.value })} placeholder="Ex: English File Intermediate" className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm sm:text-base" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setModalTurma({ open: false, data: null })} className="flex-1 px-4 py-2.5 border border-surface-200 rounded-xl font-medium text-surface-700 hover:bg-surface-50 text-sm sm:text-base">Cancelar</button>
                <button onClick={saveTurma} disabled={!formTurma.nome} className="flex-1 px-4 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 text-sm sm:text-base">{modalTurma.data ? 'Salvar' : 'Criar Turma'}</button>
              </div>
            </div>
          </Modal>

          {/* Modal Aluno */}
          <Modal isOpen={modalAluno.open} onClose={() => setModalAluno({ open: false, data: null })} title={modalAluno.data ? 'Editar Aluno' : 'Novo Aluno'} size="xl">
            <div>
              <div className="flex gap-1 p-1 bg-surface-100 rounded-xl mb-4 sm:mb-6 overflow-x-auto">
                {[{ id: 'pessoais', icon: User, label: 'Pessoais' }, { id: 'pedagogico', icon: GraduationCap, label: 'Pedagógico' }, { id: 'financeiro', icon: DollarSign, label: 'Financeiro' }].map(tab => (
                  <button key={tab.id} onClick={() => setAlunoTab(tab.id)} className={`flex-1 flex items-center justify-center gap-1 sm:gap-2 px-2 sm:px-4 py-2 sm:py-2.5 rounded-lg font-medium transition-all text-xs sm:text-sm whitespace-nowrap ${alunoTab === tab.id ? 'bg-white text-surface-900 shadow-sm' : 'text-surface-600 hover:text-surface-900'}`}>
                    <tab.icon className="w-4 h-4" />{tab.label}
                  </button>
                ))}
              </div>
              {alunoTab === 'pessoais' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-surface-700 mb-1">Nome Completo</label>
                      <input type="text" value={formAluno.nome} onChange={(e) => setFormAluno({ ...formAluno, nome: e.target.value })} placeholder="Nome do aluno" className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">CPF</label>
                      <input type="text" value={formAluno.cpf} onChange={(e) => setFormAluno({ ...formAluno, cpf: e.target.value })} placeholder="000.000.000-00" className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">RG</label>
                      <input type="text" value={formAluno.rg} onChange={(e) => setFormAluno({ ...formAluno, rg: e.target.value })} className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">Aniversário</label>
                      <div className="grid grid-cols-2 gap-2">
                        <select value={formAluno.aniversario_dia} onChange={(e) => setFormAluno({ ...formAluno, aniversario_dia: e.target.value })} className="w-full px-3 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 text-sm">
                          <option value="">Dia</option>
                          {[...Array(31)].map((_, i) => <option key={i + 1} value={i + 1}>{i + 1}</option>)}
                        </select>
                        <select value={formAluno.aniversario_mes} onChange={(e) => setFormAluno({ ...formAluno, aniversario_mes: e.target.value })} className="w-full px-3 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 text-sm">
                          <option value="">Mês</option>
                          {['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'].map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">Telefone</label>
                      <input type="text" value={formAluno.telefone} onChange={(e) => setFormAluno({ ...formAluno, telefone: e.target.value })} placeholder="(00) 00000-0000" className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 text-sm" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-surface-700 mb-1">Email</label>
                      <input type="email" value={formAluno.email} onChange={(e) => setFormAluno({ ...formAluno, email: e.target.value })} className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 text-sm" />
                    </div>
                  </div>
                  <div className="pt-4 border-t border-surface-100">
                    <h4 className="font-medium text-surface-900 mb-4 flex items-center gap-2 text-sm"><MapPin className="w-4 h-4" />Endereço</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                      <div className="col-span-1">
                        <label className="block text-sm font-medium text-surface-700 mb-1">CEP</label>
                        <input type="text" value={formAluno.cep} onChange={(e) => setFormAluno({ ...formAluno, cep: e.target.value })} onBlur={(e) => buscarCep(e.target.value)} placeholder="00000-000" className="w-full px-3 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 text-sm" />
                      </div>
                      <div className="col-span-2 sm:col-span-2">
                        <label className="block text-sm font-medium text-surface-700 mb-1">Rua</label>
                        <input type="text" value={formAluno.rua} onChange={(e) => setFormAluno({ ...formAluno, rua: e.target.value })} className="w-full px-3 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 text-sm" />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-sm font-medium text-surface-700 mb-1">Nº</label>
                        <input type="text" value={formAluno.numero} onChange={(e) => setFormAluno({ ...formAluno, numero: e.target.value })} className="w-full px-3 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 text-sm" />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-sm font-medium text-surface-700 mb-1">Bairro</label>
                        <input type="text" value={formAluno.bairro} onChange={(e) => setFormAluno({ ...formAluno, bairro: e.target.value })} className="w-full px-3 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 text-sm" />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-sm font-medium text-surface-700 mb-1">Cidade</label>
                        <input type="text" value={formAluno.cidade} onChange={(e) => setFormAluno({ ...formAluno, cidade: e.target.value })} className="w-full px-3 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 text-sm" />
                      </div>
                      <div className="col-span-1">
                        <label className="block text-sm font-medium text-surface-700 mb-1">UF</label>
                        <select value={formAluno.estado} onChange={(e) => setFormAluno({ ...formAluno, estado: e.target.value })} className="w-full px-3 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 text-sm">
                          <option value="">UF</option>
                          {ESTADOS_BR.map(uf => <option key={uf} value={uf}>{uf}</option>)}
                        </select>
                      </div>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-surface-100">
                    <h4 className="font-medium text-surface-900 mb-4 flex items-center gap-2 text-sm"><Users className="w-4 h-4" />Responsável</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">Nome</label>
                        <input type="text" value={formAluno.responsavel_nome} onChange={(e) => setFormAluno({ ...formAluno, responsavel_nome: e.target.value })} className="w-full px-3 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">CPF</label>
                        <input type="text" value={formAluno.responsavel_cpf} onChange={(e) => setFormAluno({ ...formAluno, responsavel_cpf: e.target.value })} className="w-full px-3 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 text-sm" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-surface-700 mb-1">Telefone</label>
                        <input type="text" value={formAluno.responsavel_telefone} onChange={(e) => setFormAluno({ ...formAluno, responsavel_telefone: e.target.value })} className="w-full px-3 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 text-sm" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {alunoTab === 'pedagogico' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">Data de Início</label>
                      <input type="date" value={formAluno.data_inicio} onChange={(e) => setFormAluno({ ...formAluno, data_inicio: e.target.value })} className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">Status</label>
                      <select value={formAluno.status_pedagogico} onChange={(e) => setFormAluno({ ...formAluno, status_pedagogico: e.target.value })} className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 text-sm">
                        {STATUS_PEDAGOGICO.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-surface-100">
                    <label className="block text-sm font-medium text-surface-700 mb-3">Usa Transporte?</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={formAluno.usa_transporte === true} onChange={() => setFormAluno({ ...formAluno, usa_transporte: true })} className="w-5 h-5 text-brand-600" /><span className="text-sm">Sim</span></label>
                      <label className="flex items-center gap-2 cursor-pointer"><input type="radio" checked={formAluno.usa_transporte === false} onChange={() => setFormAluno({ ...formAluno, usa_transporte: false })} className="w-5 h-5 text-brand-600" /><span className="text-sm">Não</span></label>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">Observações</label>
                    <textarea value={formAluno.observacoes_pedagogicas} onChange={(e) => setFormAluno({ ...formAluno, observacoes_pedagogicas: e.target.value })} rows={4} className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 resize-none text-sm" />
                  </div>
                </div>
              )}
              {alunoTab === 'financeiro' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">Dia de Vencimento</label>
                      <input type="number" min="1" max="31" value={formAluno.dia_vencimento} onChange={(e) => setFormAluno({ ...formAluno, dia_vencimento: e.target.value })} className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">Valor Mensalidade</label>
                      <input type="number" step="0.01" value={formAluno.valor_mensalidade} onChange={(e) => setFormAluno({ ...formAluno, valor_mensalidade: e.target.value })} className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 text-sm" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">Forma de Pagamento</label>
                      <select value={formAluno.forma_pagamento} onChange={(e) => setFormAluno({ ...formAluno, forma_pagamento: e.target.value })} className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 text-sm">
                        {FORMAS_PAGAMENTO.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 mb-1">Desconto (%)</label>
                      <input type="number" min="0" max="100" value={formAluno.desconto} onChange={(e) => setFormAluno({ ...formAluno, desconto: e.target.value })} className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 text-sm" />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-sm font-medium text-surface-700 mb-1">Status Financeiro</label>
                      <select value={formAluno.status_financeiro} onChange={(e) => setFormAluno({ ...formAluno, status_financeiro: e.target.value })} className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-accent-500 focus:ring-2 focus:ring-accent-500/20 text-sm">
                        {STATUS_FINANCEIRO.map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                    </div>
                  </div>
                  {formAluno.valor_mensalidade && (
                    <div className="p-4 bg-surface-50 rounded-xl">
                      <h4 className="font-medium text-surface-900 mb-2 text-sm">Resumo</h4>
                      <div className="flex justify-between text-sm"><span className="text-surface-600">Mensalidade:</span><span className="font-medium">{formatCurrency(formAluno.valor_mensalidade)}</span></div>
                      {formAluno.desconto > 0 && (<><div className="flex justify-between text-sm"><span className="text-surface-600">Desconto ({formAluno.desconto}%):</span><span className="font-medium text-emerald-600">-{formatCurrency(formAluno.valor_mensalidade * (formAluno.desconto / 100))}</span></div><div className="flex justify-between text-sm pt-2 border-t border-surface-200 mt-2"><span className="font-medium">Valor Final:</span><span className="font-bold">{formatCurrency(formAluno.valor_mensalidade * (1 - formAluno.desconto / 100))}</span></div></>)}
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-3 pt-6 mt-6 border-t border-surface-100">
                <button onClick={() => setModalAluno({ open: false, data: null })} className="flex-1 px-4 py-2.5 border border-surface-200 rounded-xl font-medium text-surface-700 hover:bg-surface-50 text-sm">Cancelar</button>
                <button onClick={saveAluno} className="flex-1 px-4 py-2.5 bg-accent-600 text-white rounded-xl font-medium hover:bg-accent-700 text-sm">{modalAluno.data ? 'Salvar' : 'Cadastrar'}</button>
              </div>
            </div>
          </Modal>

          {/* Modal Professor */}
          <Modal isOpen={modalProfessor.open} onClose={() => setModalProfessor({ open: false, data: null })} title={modalProfessor.data ? 'Editar Professor' : 'Novo Professor'}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Nome *</label>
                <input type="text" value={formProfessor.nome} onChange={(e) => setFormProfessor({ ...formProfessor, nome: e.target.value })} placeholder="Nome completo" className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Email *</label>
                <input type="email" value={formProfessor.email} onChange={(e) => setFormProfessor({ ...formProfessor, email: e.target.value })} placeholder="professor@escola.com" className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">{modalProfessor.data ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}</label>
                <input type="password" value={formProfessor.senha} onChange={(e) => setFormProfessor({ ...formProfessor, senha: e.target.value })} placeholder="••••••••" className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 text-sm" />
              </div>
              <div className="flex gap-3 pt-4">
                <button onClick={() => setModalProfessor({ open: false, data: null })} className="flex-1 px-4 py-2.5 border border-surface-200 rounded-xl font-medium text-surface-700 hover:bg-surface-50 text-sm">Cancelar</button>
                <button onClick={saveProfessor} disabled={!formProfessor.nome || !formProfessor.email || (!modalProfessor.data && !formProfessor.senha)} className="flex-1 px-4 py-2.5 bg-purple-600 text-white rounded-xl font-medium hover:bg-purple-700 disabled:opacity-50 text-sm">{modalProfessor.data ? 'Salvar' : 'Cadastrar'}</button>
              </div>
            </div>
          </Modal>

          {/* Modal Aula */}
          <Modal isOpen={modalAula.open} onClose={() => setModalAula({ open: false, turma: null, data: null })} title={modalAula.data ? 'Editar Aula' : 'Registrar Aula'} size="lg">
            {modalAula.turma && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">Data *</label>
                    <input type="date" value={formAula.data} onChange={(e) => setFormAula({ ...formAula, data: e.target.value })} className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-surface-700 mb-1">Unidade/Lição</label>
                    <input type="text" value={formAula.unidade_livro} onChange={(e) => setFormAula({ ...formAula, unidade_livro: e.target.value })} placeholder="Ex: Unit 3 - Lesson 2" className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-700 mb-1">Conteúdo</label>
                  <textarea value={formAula.conteudo} onChange={(e) => setFormAula({ ...formAula, conteudo: e.target.value })} placeholder="O que foi trabalhado..." rows={2} className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 resize-none text-sm" />
                </div>
                <div className="pt-4 border-t border-surface-100">
                  <h4 className="font-medium text-surface-900 mb-3 flex items-center gap-2 text-sm"><ClipboardList className="w-4 h-4" />Lista de Presença</h4>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {modalAula.turma.matriculas?.map(m => {
                      const aluno = m.alunos
                      if (!aluno) return null
                      const presenca = formAula.presencas[aluno.id] || { presente: true, observacao: '' }
                      return (
                        <div key={aluno.id} className="flex items-center gap-2 sm:gap-3 p-2 sm:p-3 bg-surface-50 rounded-xl">
                          <button onClick={() => setFormAula({ ...formAula, presencas: { ...formAula.presencas, [aluno.id]: { ...presenca, presente: !presenca.presente } } })} className={`w-9 h-9 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center transition-colors flex-shrink-0 ${presenca.presente ? 'bg-emerald-100 text-emerald-600' : 'bg-red-100 text-red-600'}`}>
                            {presenca.presente ? <UserCheck className="w-4 h-4 sm:w-5 sm:h-5" /> : <UserX className="w-4 h-4 sm:w-5 sm:h-5" />}
                          </button>
                          <div className="flex-1 min-w-0"><p className="font-medium text-surface-900 text-sm truncate">{aluno.nome || 'Sem nome'}</p></div>
                          <input type="text" value={presenca.observacao} onChange={(e) => setFormAula({ ...formAula, presencas: { ...formAula.presencas, [aluno.id]: { ...presenca, observacao: e.target.value } } })} placeholder="Obs..." className="w-20 sm:w-32 px-2 sm:px-3 py-1.5 text-xs sm:text-sm border border-surface-200 rounded-lg focus:border-brand-500" />
                        </div>
                      )
                    })}
                    {(!modalAula.turma.matriculas || modalAula.turma.matriculas.length === 0) && <div className="text-center py-4 text-surface-500 text-sm">Nenhum aluno matriculado</div>}
                  </div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button onClick={() => setModalAula({ open: false, turma: null, data: null })} className="flex-1 px-4 py-2.5 border border-surface-200 rounded-xl font-medium text-surface-700 hover:bg-surface-50 text-sm">Cancelar</button>
                  <button onClick={saveAula} disabled={!formAula.data} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 text-sm"><Save className="w-4 h-4" />{modalAula.data ? 'Salvar' : 'Registrar'}</button>
                </div>
              </div>
            )}
          </Modal>

          {/* Modal Matrícula */}
          <Modal isOpen={modalMatricula.open} onClose={() => setModalMatricula({ open: false, turmaId: null })} title="Matricular Aluno">
            <div className="space-y-4">
              <p className="text-surface-600 text-sm">Selecione um aluno:</p>
              <div className="max-h-64 overflow-y-auto space-y-2">
                {alunosDisponiveis.map(aluno => (
                  <button key={aluno.id} onClick={() => matricularAluno(aluno.id)} className="w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-surface-200 hover:border-brand-300 hover:bg-brand-50 text-left">
                    <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-to-br from-brand-400 to-accent-400 rounded-full flex items-center justify-center text-white font-semibold text-xs sm:text-sm flex-shrink-0">{(aluno.nome || '?').charAt(0).toUpperCase()}</div>
                    <div className="min-w-0">
                      <p className="font-medium text-surface-900 text-sm truncate">{aluno.nome || 'Sem nome'}</p>
                      <p className="text-xs text-surface-500 truncate">{aluno.email || 'Sem email'}</p>
                    </div>
                  </button>
                ))}
                {alunosDisponiveis.length === 0 && <div className="text-center py-8 text-surface-500"><Users className="w-10 h-10 mx-auto mb-2 text-surface-300" /><p className="text-sm">Todos já matriculados</p></div>}
              </div>
            </div>
          </Modal>

          {/* Modal Detalhe Turma */}
          <Modal isOpen={modalDetalheTurma.open} onClose={() => setModalDetalheTurma({ open: false, turma: null })} title={modalDetalheTurma.turma?.nome || 'Turma'}>
            {modalDetalheTurma.turma && (
              <div className="space-y-4">
                <div className="flex items-center gap-3 p-4 bg-surface-50 rounded-xl">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${IDIOMA_COLORS[modalDetalheTurma.turma.idioma] || 'bg-surface-100'}`}><Globe2 className="w-6 h-6" /></div>
                  <div>
                    <span className="badge bg-surface-200 text-surface-700">{modalDetalheTurma.turma.idioma}</span>
                    {modalDetalheTurma.turma.professor && <p className="text-sm text-surface-600 mt-1">Prof. {modalDetalheTurma.turma.professor.nome}</p>}
                    {modalDetalheTurma.turma.livro && <p className="text-sm text-surface-600 flex items-center gap-1"><BookMarked className="w-3 h-3" />{modalDetalheTurma.turma.livro}</p>}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-surface-900 mb-3 text-sm">Alunos ({modalDetalheTurma.turma.matriculas?.length || 0})</h4>
                  <div className="max-h-64 overflow-y-auto space-y-2">
                    {modalDetalheTurma.turma.matriculas?.map(m => (
                      <div key={m.id} className="flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 bg-surface-50 rounded-xl">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-brand-400 to-accent-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">{(m.alunos?.nome || '?').charAt(0).toUpperCase()}</div>
                          <span className="font-medium text-surface-900 text-sm">{m.alunos?.nome || 'Sem nome'}</span>
                        </div>
                        <button onClick={() => cancelarMatricula(modalDetalheTurma.turma.id, m.aluno_id)} className="text-red-500 hover:text-red-600 text-sm">Remover</button>
                      </div>
                    ))}
                    {!modalDetalheTurma.turma.matriculas?.length && <div className="text-center py-6 text-surface-500 text-sm">Nenhum aluno</div>}
                  </div>
                </div>
              </div>
            )}
          </Modal>

          {/* Modal Detalhe Aluno */}
          <Modal isOpen={modalDetalheAluno.open} onClose={() => setModalDetalheAluno({ open: false, aluno: null })} title={modalDetalheAluno.aluno?.nome || 'Aluno'} size="lg">
            {modalDetalheAluno.aluno && (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-brand-400 to-accent-400 rounded-full flex items-center justify-center text-white text-xl sm:text-2xl font-bold">{(modalDetalheAluno.aluno.nome || '?').charAt(0).toUpperCase()}</div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-semibold text-surface-900">{modalDetalheAluno.aluno.nome || 'Sem nome'}</h3>
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className={`badge text-xs ${STATUS_COLORS[modalDetalheAluno.aluno.status_pedagogico]}`}>{STATUS_LABELS[modalDetalheAluno.aluno.status_pedagogico]}</span>
                      <span className={`badge text-xs ${STATUS_COLORS[modalDetalheAluno.aluno.status_financeiro]}`}>{STATUS_LABELS[modalDetalheAluno.aluno.status_financeiro]}</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <h4 className="font-medium text-surface-900 flex items-center gap-2"><User className="w-4 h-4" />Dados Pessoais</h4>
                    <div className="space-y-2 text-surface-600">
                      {modalDetalheAluno.aluno.cpf && <p><span className="text-surface-500">CPF:</span> {modalDetalheAluno.aluno.cpf}</p>}
                      {modalDetalheAluno.aluno.aniversario_dia && modalDetalheAluno.aluno.aniversario_mes && <p><span className="text-surface-500">Aniversário:</span> {modalDetalheAluno.aluno.aniversario_dia}/{String(modalDetalheAluno.aluno.aniversario_mes).padStart(2, '0')}</p>}
                      {modalDetalheAluno.aluno.email && <p><span className="text-surface-500">Email:</span> {modalDetalheAluno.aluno.email}</p>}
                      {modalDetalheAluno.aluno.telefone && <p><span className="text-surface-500">Tel:</span> {modalDetalheAluno.aluno.telefone}</p>}
                      {modalDetalheAluno.aluno.cidade && <p><span className="text-surface-500">Cidade:</span> {modalDetalheAluno.aluno.cidade}/{modalDetalheAluno.aluno.estado}</p>}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <h4 className="font-medium text-surface-900 flex items-center gap-2"><DollarSign className="w-4 h-4" />Financeiro</h4>
                    <div className="space-y-2 text-surface-600">
                      <p><span className="text-surface-500">Vencimento:</span> Dia {modalDetalheAluno.aluno.dia_vencimento || '-'}</p>
                      <p><span className="text-surface-500">Mensalidade:</span> {formatCurrency(modalDetalheAluno.aluno.valor_mensalidade)}</p>
                      <p><span className="text-surface-500">Pagamento:</span> {modalDetalheAluno.aluno.forma_pagamento || '-'}</p>
                      {modalDetalheAluno.aluno.desconto > 0 && <p><span className="text-surface-500">Desconto:</span> {modalDetalheAluno.aluno.desconto}%</p>}
                    </div>
                  </div>
                </div>
                {modalDetalheAluno.aluno.matriculas?.length > 0 && (
                  <div className="pt-4 border-t border-surface-100">
                    <h4 className="font-medium text-surface-900 mb-3 flex items-center gap-2 text-sm"><BookOpen className="w-4 h-4" />Turmas</h4>
                    <div className="flex flex-wrap gap-2">
                      {modalDetalheAluno.aluno.matriculas.map(m => <div key={m.id} className={`badge ${IDIOMA_COLORS[m.turmas?.idioma] || 'bg-surface-100 text-surface-600'}`}>{m.turmas?.nome}</div>)}
                    </div>
                  </div>
                )}
                <div className="pt-4 border-t border-surface-100">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-surface-500">Usa Transporte:</span>
                    <span className={`badge text-xs ${modalDetalheAluno.aluno.usa_transporte ? 'bg-emerald-100 text-emerald-700' : 'bg-surface-100 text-surface-600'}`}>{modalDetalheAluno.aluno.usa_transporte ? 'Sim' : 'Não'}</span>
                  </div>
                </div>
                {modalDetalheAluno.aluno.responsavel_nome && (
                  <div className="pt-4 border-t border-surface-100">
                    <h4 className="font-medium text-surface-900 mb-3 flex items-center gap-2 text-sm"><Users className="w-4 h-4" />Responsável</h4>
                    <div className="text-sm text-surface-600 space-y-1">
                      <p><span className="text-surface-500">Nome:</span> {modalDetalheAluno.aluno.responsavel_nome}</p>
                      {modalDetalheAluno.aluno.responsavel_telefone && <p><span className="text-surface-500">Tel:</span> {modalDetalheAluno.aluno.responsavel_telefone}</p>}
                    </div>
                  </div>
                )}
                {modalDetalheAluno.aluno.observacoes_pedagogicas && (
                  <div className="pt-4 border-t border-surface-100">
                    <h4 className="font-medium text-surface-900 mb-2 flex items-center gap-2 text-sm"><FileText className="w-4 h-4" />Observações</h4>
                    <p className="text-sm text-surface-600 bg-surface-50 p-3 rounded-lg">{modalDetalheAluno.aluno.observacoes_pedagogicas}</p>
                  </div>
                )}
              </div>
            )}
          </Modal>

          {/* Modal Alterar Senha */}
          <Modal isOpen={modalSenha} onClose={() => { setModalSenha(false); setFormSenha({ atual: '', nova: '', confirmar: '' }) }} title="Alterar Senha">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Senha Atual *</label>
                <input type="password" value={formSenha.atual} onChange={(e) => setFormSenha({ ...formSenha, atual: e.target.value })} placeholder="••••••••" className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Nova Senha *</label>
                <input type="password" value={formSenha.nova} onChange={(e) => setFormSenha({ ...formSenha, nova: e.target.value })} placeholder="••••••••" className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-medium text-surface-700 mb-1">Confirmar Nova Senha *</label>
                <input type="password" value={formSenha.confirmar} onChange={(e) => setFormSenha({ ...formSenha, confirmar: e.target.value })} placeholder="••••••••" className="w-full px-4 py-2.5 border border-surface-200 rounded-xl focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 text-sm" />
              </div>
              {formSenha.nova && formSenha.confirmar && formSenha.nova !== formSenha.confirmar && (
                <div className="flex items-center gap-2 text-red-600 text-sm"><AlertCircle className="w-4 h-4" />As senhas não coincidem</div>
              )}
              <div className="flex gap-3 pt-4">
                <button onClick={() => { setModalSenha(false); setFormSenha({ atual: '', nova: '', confirmar: '' }) }} className="flex-1 px-4 py-2.5 border border-surface-200 rounded-xl font-medium text-surface-700 hover:bg-surface-50 text-sm">Cancelar</button>
                <button onClick={alterarSenha} disabled={!formSenha.atual || !formSenha.nova || !formSenha.confirmar || formSenha.nova !== formSenha.confirmar || senhaLoading} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-brand-600 text-white rounded-xl font-medium hover:bg-brand-700 disabled:opacity-50 text-sm">
                  {senhaLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}Alterar
                </button>
              </div>
            </div>
          </Modal>

          {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
        </div>
      )}
    </>
  )
}

export default App
