-- =============================================
-- ESCOLA DE IDIOMAS - CONFIGURAÇÃO DO BANCO
-- Execute este script no SQL Editor do Supabase
-- =============================================

-- Tabela de Turmas
CREATE TABLE IF NOT EXISTS turmas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    idioma VARCHAR(50) NOT NULL,
    nivel VARCHAR(50) NOT NULL,
    professor VARCHAR(100),
    horario VARCHAR(50),
    dias_semana VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Alunos (com todos os campos)
CREATE TABLE IF NOT EXISTS alunos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    
    -- Dados Pessoais
    nome VARCHAR(100) NOT NULL,
    cpf VARCHAR(14),
    rg VARCHAR(20),
    data_nascimento DATE,
    telefone VARCHAR(20),
    email VARCHAR(100),
    
    -- Endereço
    cep VARCHAR(10),
    rua VARCHAR(150),
    numero VARCHAR(20),
    complemento VARCHAR(100),
    bairro VARCHAR(100),
    cidade VARCHAR(100),
    estado VARCHAR(2),
    
    -- Responsável
    responsavel_nome VARCHAR(100),
    responsavel_cpf VARCHAR(14),
    responsavel_telefone VARCHAR(20),
    
    -- Pedagógico
    data_inicio DATE,
    status_pedagogico VARCHAR(20) DEFAULT 'ativo',
    observacoes_pedagogicas TEXT,
    
    -- Financeiro
    dia_vencimento INTEGER,
    valor_mensalidade DECIMAL(10,2),
    forma_pagamento VARCHAR(50),
    desconto DECIMAL(5,2) DEFAULT 0,
    status_financeiro VARCHAR(20) DEFAULT 'em_dia',
    
    -- Controle
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de Matrículas (relacionamento N:N entre Turmas e Alunos)
CREATE TABLE IF NOT EXISTS matriculas (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    turma_id UUID NOT NULL REFERENCES turmas(id) ON DELETE CASCADE,
    aluno_id UUID NOT NULL REFERENCES alunos(id) ON DELETE CASCADE,
    data_matricula TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'ativo',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(turma_id, aluno_id)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_matriculas_turma ON matriculas(turma_id);
CREATE INDEX IF NOT EXISTS idx_matriculas_aluno ON matriculas(aluno_id);
CREATE INDEX IF NOT EXISTS idx_turmas_idioma ON turmas(idioma);
CREATE INDEX IF NOT EXISTS idx_alunos_nome ON alunos(nome);
CREATE INDEX IF NOT EXISTS idx_alunos_cpf ON alunos(cpf);
CREATE INDEX IF NOT EXISTS idx_alunos_status_financeiro ON alunos(status_financeiro);
CREATE INDEX IF NOT EXISTS idx_alunos_status_pedagogico ON alunos(status_pedagogico);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_turmas_updated_at ON turmas;
CREATE TRIGGER update_turmas_updated_at
    BEFORE UPDATE ON turmas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_alunos_updated_at ON alunos;
CREATE TRIGGER update_alunos_updated_at
    BEFORE UPDATE ON alunos
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Habilitar RLS
ALTER TABLE turmas ENABLE ROW LEVEL SECURITY;
ALTER TABLE alunos ENABLE ROW LEVEL SECURITY;
ALTER TABLE matriculas ENABLE ROW LEVEL SECURITY;

-- Remover políticas existentes (caso esteja recriando)
DROP POLICY IF EXISTS "Permitir leitura de turmas" ON turmas;
DROP POLICY IF EXISTS "Permitir leitura de alunos" ON alunos;
DROP POLICY IF EXISTS "Permitir leitura de matrículas" ON matriculas;
DROP POLICY IF EXISTS "Permitir inserção de turmas" ON turmas;
DROP POLICY IF EXISTS "Permitir inserção de alunos" ON alunos;
DROP POLICY IF EXISTS "Permitir inserção de matrículas" ON matriculas;
DROP POLICY IF EXISTS "Permitir atualização de turmas" ON turmas;
DROP POLICY IF EXISTS "Permitir atualização de alunos" ON alunos;
DROP POLICY IF EXISTS "Permitir atualização de matrículas" ON matriculas;
DROP POLICY IF EXISTS "Permitir exclusão de turmas" ON turmas;
DROP POLICY IF EXISTS "Permitir exclusão de alunos" ON alunos;
DROP POLICY IF EXISTS "Permitir exclusão de matrículas" ON matriculas;

-- Políticas para acesso público (para uso sem autenticação)
CREATE POLICY "Permitir leitura de turmas" ON turmas FOR SELECT USING (true);
CREATE POLICY "Permitir leitura de alunos" ON alunos FOR SELECT USING (true);
CREATE POLICY "Permitir leitura de matrículas" ON matriculas FOR SELECT USING (true);

CREATE POLICY "Permitir inserção de turmas" ON turmas FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir inserção de alunos" ON alunos FOR INSERT WITH CHECK (true);
CREATE POLICY "Permitir inserção de matrículas" ON matriculas FOR INSERT WITH CHECK (true);

CREATE POLICY "Permitir atualização de turmas" ON turmas FOR UPDATE USING (true);
CREATE POLICY "Permitir atualização de alunos" ON alunos FOR UPDATE USING (true);
CREATE POLICY "Permitir atualização de matrículas" ON matriculas FOR UPDATE USING (true);

CREATE POLICY "Permitir exclusão de turmas" ON turmas FOR DELETE USING (true);
CREATE POLICY "Permitir exclusão de alunos" ON alunos FOR DELETE USING (true);
CREATE POLICY "Permitir exclusão de matrículas" ON matriculas FOR DELETE USING (true);

-- =============================================
-- DADOS DE EXEMPLO (opcional)
-- =============================================

-- Inserir turmas de exemplo
INSERT INTO turmas (nome, idioma, nivel, professor, horario, dias_semana) VALUES
('Inglês Básico A', 'Inglês', 'Básico', 'Maria Silva', '08:00 - 10:00', 'Seg, Qua, Sex'),
('Inglês Intermediário B', 'Inglês', 'Intermediário', 'João Santos', '14:00 - 16:00', 'Ter, Qui'),
('Espanhol Iniciante', 'Espanhol', 'Iniciante', 'Carlos Gonzalez', '19:00 - 21:00', 'Seg, Qua'),
('Francês Básico', 'Francês', 'Básico', 'Pierre Dubois', '10:00 - 12:00', 'Ter, Qui, Sáb'),
('Japonês Iniciante', 'Japonês', 'Iniciante', 'Yuki Tanaka', '18:00 - 20:00', 'Seg, Sex')
ON CONFLICT DO NOTHING;

-- Inserir alunos de exemplo com dados completos
INSERT INTO alunos (
    nome, cpf, rg, data_nascimento, telefone, email,
    cep, rua, numero, bairro, cidade, estado,
    responsavel_nome, responsavel_cpf, responsavel_telefone,
    data_inicio, status_pedagogico, observacoes_pedagogicas,
    dia_vencimento, valor_mensalidade, forma_pagamento, desconto, status_financeiro
) VALUES
(
    'Ana Carolina Souza', '123.456.789-00', 'MG-12.345.678', '1998-05-15', '(11) 99999-1111', 'ana.souza@email.com',
    '01310-100', 'Av. Paulista', '1000', 'Bela Vista', 'São Paulo', 'SP',
    NULL, NULL, NULL,
    '2024-02-01', 'ativo', 'Aluna dedicada, bom progresso',
    10, 350.00, 'PIX', 0, 'em_dia'
),
(
    'Bruno Oliveira', '234.567.890-11', 'SP-23.456.789', '1995-08-22', '(11) 99999-2222', 'bruno.oliveira@email.com',
    '04543-000', 'Rua Funchal', '500', 'Vila Olímpia', 'São Paulo', 'SP',
    NULL, NULL, NULL,
    '2024-01-15', 'ativo', NULL,
    15, 350.00, 'Boleto', 10, 'em_dia'
),
(
    'Pedro Henrique Lima', '345.678.901-22', 'RJ-34.567.890', '2010-03-10', '(21) 99999-3333', 'pedro.lima@email.com',
    '22041-080', 'Rua Barata Ribeiro', '200', 'Copacabana', 'Rio de Janeiro', 'RJ',
    'Márcia Lima', '987.654.321-00', '(21) 98888-3333',
    '2024-03-01', 'ativo', 'Menor de idade - acompanhar responsável',
    5, 400.00, 'Cartão', 0, 'em_dia'
),
(
    'Carla Mendes', '456.789.012-33', 'MG-45.678.901', '2000-01-10', '(31) 99999-4444', 'carla.mendes@email.com',
    '30130-000', 'Av. Afonso Pena', '1500', 'Centro', 'Belo Horizonte', 'MG',
    NULL, NULL, NULL,
    '2023-08-01', 'ativo', NULL,
    20, 350.00, 'PIX', 0, 'pendente'
),
(
    'Daniel Ferreira', '567.890.123-44', 'RS-56.789.012', '1997-11-30', '(51) 99999-5555', 'daniel.ferreira@email.com',
    '90040-000', 'Rua dos Andradas', '800', 'Centro Histórico', 'Porto Alegre', 'RS',
    NULL, NULL, NULL,
    '2024-02-15', 'trancado', 'Trancou por motivos pessoais',
    10, 350.00, 'Boleto', 0, 'em_dia'
)
ON CONFLICT DO NOTHING;

-- Matricular alunos nas turmas
DO $$
DECLARE
    turma_ingles_basico UUID;
    turma_ingles_inter UUID;
    turma_espanhol UUID;
    aluno_ana UUID;
    aluno_bruno UUID;
    aluno_pedro UUID;
    aluno_carla UUID;
BEGIN
    SELECT id INTO turma_ingles_basico FROM turmas WHERE nome = 'Inglês Básico A' LIMIT 1;
    SELECT id INTO turma_ingles_inter FROM turmas WHERE nome = 'Inglês Intermediário B' LIMIT 1;
    SELECT id INTO turma_espanhol FROM turmas WHERE nome = 'Espanhol Iniciante' LIMIT 1;
    
    SELECT id INTO aluno_ana FROM alunos WHERE nome = 'Ana Carolina Souza' LIMIT 1;
    SELECT id INTO aluno_bruno FROM alunos WHERE nome = 'Bruno Oliveira' LIMIT 1;
    SELECT id INTO aluno_pedro FROM alunos WHERE nome = 'Pedro Henrique Lima' LIMIT 1;
    SELECT id INTO aluno_carla FROM alunos WHERE nome = 'Carla Mendes' LIMIT 1;
    
    INSERT INTO matriculas (turma_id, aluno_id) VALUES
        (turma_ingles_basico, aluno_ana),
        (turma_ingles_basico, aluno_bruno),
        (turma_ingles_basico, aluno_pedro),
        (turma_ingles_inter, aluno_carla),
        (turma_espanhol, aluno_ana),
        (turma_espanhol, aluno_carla)
    ON CONFLICT DO NOTHING;
END $$;
