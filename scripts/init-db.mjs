import pg from "pg";

const { Client } = pg;

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

await client.connect();
console.log("Conectado ao banco de dados!");

// Criar todas as tabelas
await client.query(`
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
    data_entrada TIMESTAMP,
    observacoes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS encomendas (
    id SERIAL PRIMARY KEY,
    codigo_rastreio TEXT NOT NULL,
    morador_id INTEGER REFERENCES moradores(id),
    status_valido TEXT NOT NULL DEFAULT 'pendente',
    data_recebimento TIMESTAMP NOT NULL DEFAULT NOW(),
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
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS alertas_defcom (
    id SERIAL PRIMARY KEY,
    nivel_risco TEXT NOT NULL,
    tipo_ameaca TEXT NOT NULL,
    descricao TEXT NOT NULL,
    resolucao TEXT,
    data_alerta TIMESTAMP NOT NULL DEFAULT NOW(),
    arquivado BOOLEAN NOT NULL DEFAULT false,
    autoridades_acionadas BOOLEAN NOT NULL DEFAULT false
  );

  CREATE TABLE IF NOT EXISTS visitantes (
    id SERIAL PRIMARY KEY,
    nome TEXT NOT NULL,
    documento TEXT,
    morador_id INTEGER REFERENCES moradores(id),
    motivo TEXT,
    data_visita TIMESTAMP NOT NULL DEFAULT NOW(),
    data_saida TIMESTAMP,
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
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS financeiro (
    id SERIAL PRIMARY KEY,
    tipo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    valor REAL NOT NULL,
    data_vencimento TIMESTAMP,
    data_pagamento TIMESTAMP,
    morador_id INTEGER REFERENCES moradores(id),
    status TEXT NOT NULL DEFAULT 'pendente',
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS assembleias (
    id SERIAL PRIMARY KEY,
    titulo TEXT NOT NULL,
    descricao TEXT,
    data_realizacao TIMESTAMP NOT NULL,
    local TEXT,
    status TEXT NOT NULL DEFAULT 'agendada',
    ata TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS reservas (
    id SERIAL PRIMARY KEY,
    morador_id INTEGER REFERENCES moradores(id),
    area_comum TEXT NOT NULL,
    data_reserva TIMESTAMP NOT NULL,
    data_fim TIMESTAMP,
    status TEXT NOT NULL DEFAULT 'pendente',
    observacoes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS juridico (
    id SERIAL PRIMARY KEY,
    titulo TEXT NOT NULL,
    descricao TEXT NOT NULL,
    tipo TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'em_andamento',
    morador_id INTEGER REFERENCES moradores(id),
    advogado TEXT,
    data_inicio TIMESTAMP NOT NULL DEFAULT NOW(),
    data_fim TIMESTAMP,
    observacoes TEXT
  );
`);

console.log("Tabelas criadas com sucesso!");

// Seed de Moradores
await client.query(`
  INSERT INTO moradores (nome, apartamento, bloco, telefone, email, status) VALUES
    ('Ana Silva', '101', 'A', '5511999990001', 'ana@example.com', 'ativo'),
    ('Carlos Oliveira', '202', 'A', '5511999990002', 'carlos@example.com', 'ativo'),
    ('Maria Santos', '303', 'B', '5511999990003', 'maria@example.com', 'ativo'),
    ('João Ferreira', '102', 'B', '5511999990004', 'joao@example.com', 'ativo'),
    ('Beatriz Souza', '201', 'C', '5511999990005', 'beatriz@example.com', 'inativo')
  ON CONFLICT (telefone) DO NOTHING;
`);

// Seed de Encomendas
await client.query(`
  INSERT INTO encomendas (codigo_rastreio, morador_id, status_valido, plataforma, descricao) VALUES
    ('BR123456789BR', 1, 'pendente', 'Correios', 'Caixa pequena'),
    ('JD987654321XB', 2, 'notificado', 'Mercado Livre', 'Pacote médio'),
    ('RT111222333BR', 3, 'retirado', 'Amazon', 'Caixa grande'),
    ('XP444555666BR', 1, 'pendente', 'Shopee', 'Envelope'),
    ('LK777888999XB', 4, 'pendente', 'AliExpress', 'Caixa frágil')
  ON CONFLICT DO NOTHING;
`);

// Seed de Alertas DefCom
await client.query(`
  INSERT INTO alertas_defcom (nivel_risco, tipo_ameaca, descricao, arquivado, autoridades_acionadas) VALUES
    ('critico', 'violencia', 'Briga generalizada na garagem do Bloco A', false, true),
    ('alto', 'criminalidade', 'Câmera 4 vandali zada na entrada lateral', false, false),
    ('medio', 'emergencia', 'Vazamento de gás no corredor do 3° andar', false, false),
    ('baixo', 'intimidacao', 'Morador relatou discussão no elevador', true, false)
  ON CONFLICT DO NOTHING;
`);

// Seed de Logs de Interação
await client.query(`
  INSERT INTO logs_interacao (morador_id, tipo_msg, acao, perfil_emocional, resultado) VALUES
    (1, 'texto', 'consulta_encomenda', 'neutro', 'sucesso'),
    (2, 'imagem', 'registro_encomenda', 'colaborativo', 'sucesso'),
    (3, 'texto', 'reclamacao_barulho', 'estressado', 'encaminhado'),
    (4, 'texto', 'consulta_encomenda', 'frustracao', 'sem_resultado'),
    (1, 'texto', 'aviso_ausencia', 'neutro', 'registrado')
  ON CONFLICT DO NOTHING;
`);

// Seed de Visitantes
await client.query(`
  INSERT INTO visitantes (nome, documento, morador_id, motivo, status) VALUES
    ('Pedro Alves', '123.456.789-00', 1, 'Visita familiar', 'liberado'),
    ('Julia Mendes', '987.654.321-00', 2, 'Entrega de serviço', 'aguardando'),
    ('Roberto Costa', '456.789.123-00', 3, 'Manutenção', 'liberado')
  ON CONFLICT DO NOTHING;
`);

console.log("Dados de seed inseridos com sucesso!");
await client.end();
