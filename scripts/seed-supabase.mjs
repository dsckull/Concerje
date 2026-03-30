import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = "https://xqntkuwtfhpicjkjqaax.supabase.co";
const SUPABASE_KEY = "sb_publishable_n1MEAddMsbiGIHyHoFG5-g_t3yWLnKq";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Verificar se as tabelas existem lendo os dados
console.log("🔍 Verificando tabelas...");

const { data: moradores, error: err1 } = await supabase.from("moradores").select("count").limit(1);
console.log("moradores:", moradores, err1?.message);

const { data: alertas, error: err2 } = await supabase.from("alertas_defcom").select("count").limit(1);
console.log("alertas_defcom:", alertas, err2?.message);

const { data: encomendas, error: err3 } = await supabase.from("encomendas").select("count").limit(1);
console.log("encomendas:", encomendas, err3?.message);

// Inserir Moradores
console.log("\n📦 Inserindo moradores...");
const { error: errM } = await supabase.from("moradores").upsert([
  { nome: "Ana Silva",        apartamento: "101", bloco: "A", telefone: "5511999990001", email: "ana@example.com",     status: "ativo" },
  { nome: "Carlos Oliveira", apartamento: "202", bloco: "A", telefone: "5511999990002", email: "carlos@example.com",  status: "ativo" },
  { nome: "Maria Santos",    apartamento: "303", bloco: "B", telefone: "5511999990003", email: "maria@example.com",   status: "ativo" },
  { nome: "João Ferreira",   apartamento: "102", bloco: "B", telefone: "5511999990004", email: "joao@example.com",    status: "ativo" },
  { nome: "Beatriz Souza",   apartamento: "201", bloco: "C", telefone: "5511999990005", email: "beatriz@example.com", status: "inativo" },
], { onConflict: "telefone" });
if (errM) console.error("❌ moradores:", errM.message);
else console.log("✅ Moradores inseridos!");

// Inserir Alertas DefCom
console.log("\n🚨 Inserindo alertas DefCom...");
const { error: errA } = await supabase.from("alertas_defcom").insert([
  { nivel_risco: "critico", tipo_ameaca: "violencia",    descricao: "Briga generalizada na garagem Bloco A",        arquivado: false, autoridades_acionadas: true  },
  { nivel_risco: "alto",    tipo_ameaca: "criminalidade", descricao: "Câmera 4 vandalizada na entrada lateral",      arquivado: false, autoridades_acionadas: false },
  { nivel_risco: "medio",   tipo_ameaca: "emergencia",   descricao: "Vazamento de gás no corredor do 3° andar",     arquivado: false, autoridades_acionadas: false },
  { nivel_risco: "baixo",   tipo_ameaca: "intimidacao",  descricao: "Morador relatou discussão no elevador",        arquivado: true,  autoridades_acionadas: false },
]);
if (errA) console.error("❌ alertas_defcom:", errA.message);
else console.log("✅ Alertas inseridos!");

// Inserir Encomendas
console.log("\n📬 Inserindo encomendas...");
const { error: errE } = await supabase.from("encomendas").insert([
  { codigo_rastreio: "BR123456789BR", morador_id: 1, status_valido: "pendente",   plataforma: "Correios",      descricao: "Caixa pequena" },
  { codigo_rastreio: "JD987654321XB", morador_id: 2, status_valido: "notificado", plataforma: "Mercado Livre", descricao: "Pacote médio"  },
  { codigo_rastreio: "RT111222333BR", morador_id: 3, status_valido: "retirado",   plataforma: "Amazon",        descricao: "Caixa grande"  },
  { codigo_rastreio: "XP444555666BR", morador_id: 1, status_valido: "pendente",   plataforma: "Shopee",        descricao: "Envelope"      },
  { codigo_rastreio: "LK777888999XB", morador_id: 4, status_valido: "pendente",   plataforma: "AliExpress",    descricao: "Caixa frágil"  },
]);
if (errE) console.error("❌ encomendas:", errE.message);
else console.log("✅ Encomendas inseridas!");

// Inserir Logs
console.log("\n📝 Inserindo logs de interação...");
const { error: errL } = await supabase.from("logs_interacao").insert([
  { morador_id: 1, tipo_msg: "texto",  acao: "consulta_encomenda",  perfil_emocional: "neutro",      resultado: "sucesso"      },
  { morador_id: 2, tipo_msg: "imagem", acao: "registro_encomenda",  perfil_emocional: "colaborativo",resultado: "sucesso"      },
  { morador_id: 3, tipo_msg: "texto",  acao: "reclamacao_barulho",  perfil_emocional: "estressado",  resultado: "encaminhado"  },
  { morador_id: 4, tipo_msg: "texto",  acao: "consulta_encomenda",  perfil_emocional: "frustrado",   resultado: "sem_resultado"},
  { morador_id: 1, tipo_msg: "texto",  acao: "aviso_ausencia",      perfil_emocional: "neutro",      resultado: "registrado"   },
]);
if (errL) console.error("❌ logs:", errL.message);
else console.log("✅ Logs inseridos!");

console.log("\n🎉 Seed concluído!");
