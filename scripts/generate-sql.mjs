// Script usando fetch direto para a Supabase REST API (SQL via /rest/v1/rpc)
// A anon key permite chamar funções RPC
const SUPABASE_URL = "https://xqntkuwtfhpicjkjqaax.supabase.co";
const SUPABASE_KEY = "sb_publishable_n1MEAddMsbiGIHyHoFG5-g_t3yWLnKq";

const SQL_TABLES = `
CREATE TABLE IF NOT EXISTS moradores (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  apartamento TEXT NOT NULL,
  bloco TEXT NOT NULL,
  telefone TEXT NOT NULL UNIQUE,
  email TEXT,
  cpf TEXT,
  veiculo_placa TEXT,
  foto_url TEXT,
  status TEXT NOT NULL DEFAULT 'ativo',
  data_entrada TIMESTAMPTZ,
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS encomendas (
  id SERIAL PRIMARY KEY,
  codigo_rastreio TEXT NOT NULL,
  morador_id INTEGER REFERENCES moradores(id),
  status_valido TEXT NOT NULL DEFAULT 'pendente',
  data_recebimento TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  foto_url TEXT,
  ocr_confianca REAL,
  plataforma TEXT,
  descricao TEXT
);

CREATE TABLE IF NOT EXISTS logs_interacao (
  id SERIAL PRIMARY KEY,
  morador_id INTEGER REFERENCES moradores(id),
  tipo_msg TEXT NOT NULL DEFAULT 'texto',
  acao TEXT NOT NULL,
  perfil_emocional TEXT NOT NULL DEFAULT 'neutro',
  resultado TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS alertas_defcom (
  id SERIAL PRIMARY KEY,
  nivel_risco TEXT NOT NULL,
  tipo_ameaca TEXT NOT NULL,
  descricao TEXT NOT NULL,
  resolucao TEXT,
  data_alerta TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  arquivado BOOLEAN NOT NULL DEFAULT false,
  autoridades_acionadas BOOLEAN NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS visitantes (
  id SERIAL PRIMARY KEY,
  nome TEXT NOT NULL,
  documento TEXT,
  morador_id INTEGER REFERENCES moradores(id),
  motivo TEXT,
  data_visita TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_saida TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'aguardando'
);

CREATE TABLE IF NOT EXISTS ocorrencias (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  tipo TEXT NOT NULL,
  morador_id INTEGER REFERENCES moradores(id),
  status TEXT NOT NULL DEFAULT 'aberta',
  prioridade TEXT NOT NULL DEFAULT 'media',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS financeiro (
  id SERIAL PRIMARY KEY,
  tipo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  valor REAL NOT NULL,
  data_vencimento TIMESTAMPTZ,
  data_pagamento TIMESTAMPTZ,
  morador_id INTEGER REFERENCES moradores(id),
  status TEXT NOT NULL DEFAULT 'pendente',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS assembleias (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT,
  data_realizacao TIMESTAMPTZ NOT NULL,
  local TEXT,
  status TEXT NOT NULL DEFAULT 'agendada',
  ata TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reservas (
  id SERIAL PRIMARY KEY,
  morador_id INTEGER REFERENCES moradores(id),
  area_comum TEXT NOT NULL,
  data_reserva TIMESTAMPTZ NOT NULL,
  data_fim TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pendente',
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS juridico (
  id SERIAL PRIMARY KEY,
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  tipo TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'em_andamento',
  morador_id INTEGER REFERENCES moradores(id),
  advogado TEXT,
  data_inicio TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  data_fim TIMESTAMPTZ,
  observacoes TEXT
);
`;

// Supabase anon key não tem permissão para DDL — precisamos da service_role key.
// Mas posso gerar o SQL completo para o usuário copiar no SQL Editor do Supabase
console.log("=".repeat(60));
console.log("COPIE E COLE O SQL ABAIXO NO SUPABASE SQL EDITOR:");
console.log("=".repeat(60));
console.log(SQL_TABLES);

const SEED_SQL = `
-- Seed de moradores
INSERT INTO moradores (nome, apartamento, bloco, telefone, email, status) VALUES
  ('Ana Silva',        '101', 'A', '5511999990001', 'ana@example.com',     'ativo'),
  ('Carlos Oliveira', '202', 'A', '5511999990002', 'carlos@example.com',  'ativo'),
  ('Maria Santos',    '303', 'B', '5511999990003', 'maria@example.com',   'ativo'),
  ('João Ferreira',   '102', 'B', '5511999990004', 'joao@example.com',    'ativo'),
  ('Beatriz Souza',   '201', 'C', '5511999990005', 'beatriz@example.com', 'inativo')
ON CONFLICT (telefone) DO NOTHING;

-- Seed de alertas DefCom
INSERT INTO alertas_defcom (nivel_risco, tipo_ameaca, descricao, arquivado, autoridades_acionadas) VALUES
  ('critico', 'violencia',    'Briga generalizada na garagem Bloco A',    false, true),
  ('alto',    'criminalidade','Câmera 4 vandalizada na entrada lateral',  false, false),
  ('medio',   'emergencia',  'Vazamento de gás no corredor do 3° andar', false, false),
  ('baixo',   'intimidacao', 'Morador relatou discussão no elevador',     true,  false);

-- Seed de encomendas
INSERT INTO encomendas (codigo_rastreio, morador_id, status_valido, plataforma, descricao) VALUES
  ('BR123456789BR', 1, 'pendente',   'Correios',      'Caixa pequena'),
  ('JD987654321XB', 2, 'notificado', 'Mercado Livre', 'Pacote médio'),
  ('RT111222333BR', 3, 'retirado',   'Amazon',        'Caixa grande'),
  ('XP444555666BR', 1, 'pendente',   'Shopee',        'Envelope'),
  ('LK777888999XB', 4, 'pendente',   'AliExpress',    'Caixa frágil');

-- Seed de logs de interacao
INSERT INTO logs_interacao (morador_id, tipo_msg, acao, perfil_emocional, resultado) VALUES
  (1, 'texto',  'consulta_encomenda', 'neutro',       'sucesso'),
  (2, 'imagem', 'registro_encomenda', 'colaborativo', 'sucesso'),
  (3, 'texto',  'reclamacao_barulho', 'estressado',   'encaminhado'),
  (4, 'texto',  'consulta_encomenda', 'frustrado',    'sem_resultado'),
  (1, 'texto',  'aviso_ausencia',     'neutro',       'registrado');
`;

console.log("\n" + "=".repeat(60));
console.log("DEPOIS EXECUTE TAMBÉM O SEED SQL:");
console.log("=".repeat(60));
console.log(SEED_SQL);
