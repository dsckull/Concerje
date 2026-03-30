import { useListDocumentos, useListNotificacoesJuridicas, useCreateNotificacaoJuridica, useUpdateNotificacaoJuridica } from "@workspace/api-client-react";
import { Scale, Plus, RefreshCcw, FileText, AlertTriangle, CheckCircle2, Clock } from "lucide-react";
import { cn, formatDateTime, formatCurrency } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { getListNotificacoesJuridicasQueryKey } from "@workspace/api-client-react";
import { useState } from "react";

const STATUS_CONFIG: Record<string, { label: string; icon: any; class: string }> = {
  enviada: { label: "Enviada", icon: AlertTriangle, class: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  contestada: { label: "Contestada", icon: Clock, class: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  resolvida: { label: "Resolvida", icon: CheckCircle2, class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
};

export default function JuridicoPage() {
  const [tab, setTab] = useState<"documentos" | "notificacoes">("documentos");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ morador_id: "", tipo: "multa", titulo: "", descricao: "", valor_multa: "", artigo_regimento: "" });
  const qc = useQueryClient();

  const { data: documentos, isLoading: docsLoading } = useListDocumentos();
  const { data: notificacoes, isLoading: notifsLoading } = useListNotificacoesJuridicas({ status: statusFilter || undefined });
  const { mutate: create, isPending: isCreating } = useCreateNotificacaoJuridica({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListNotificacoesJuridicasQueryKey() }); setShowForm(false); setForm({ morador_id: "", tipo: "multa", titulo: "", descricao: "", valor_multa: "", artigo_regimento: "" }); } } });
  const { mutate: update } = useUpdateNotificacaoJuridica({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListNotificacoesJuridicasQueryKey() }) } });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-white flex items-center gap-3"><Scale className="w-7 h-7 text-primary" /> Área Jurídica</h1>
          <p className="text-muted-foreground mt-1 text-sm">Documentos, notificações e multas</p>
        </div>
        {tab === "notificacoes" && (
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Nova Notificação
          </button>
        )}
      </div>

      <div className="flex gap-2 border-b border-border">
        {(["documentos", "notificacoes"] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} className={cn("px-4 py-3 border-b-2 font-semibold transition-colors -mb-[2px]", tab === t ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-white")}>
            {t === "documentos" ? "Documentos" : "Notificações"}
          </button>
        ))}
      </div>

      {tab === "documentos" && (
        <div className="space-y-3">
          {docsLoading ? (
            <div className="text-center py-10 text-muted-foreground"><RefreshCcw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" /></div>
          ) : documentos?.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground bg-card border border-border rounded-xl">Nenhum documento encontrado.</div>
          ) : documentos?.map(d => (
            <div key={d.id} className="bg-card border border-border rounded-xl p-5 flex items-center justify-between hover:border-primary/30 transition-all">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <FileText className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-white">{d.titulo}</p>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mt-1">{d.tipo} {d.versao && `(v${d.versao})`}</p>
                </div>
              </div>
              <span className={cn("px-3 py-1.5 rounded-full border text-xs font-semibold", d.vigente === "sim" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-gray-500/10 text-gray-400 border-gray-500/20")}>
                {d.vigente === "sim" ? "Vigente" : "Revogado"}
              </span>
            </div>
          ))}
        </div>
      )}

      {tab === "notificacoes" && (
        <>
          {showForm && (
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
              <h3 className="font-display font-semibold text-white">Nova Notificação</h3>
              <div className="grid grid-cols-2 gap-4">
                <input type="number" placeholder="ID Morador*" value={form.morador_id} onChange={e => setForm(f => ({...f, morador_id: e.target.value}))} className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                <select value={form.tipo} onChange={e => setForm(f => ({...f, tipo: e.target.value}))} className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
                  <option value="multa">Multa</option>
                  <option value="notificacao">Notificação</option>
                  <option value="intimacao">Intimação</option>
                </select>
                <input placeholder="Título*" value={form.titulo} onChange={e => setForm(f => ({...f, titulo: e.target.value}))} className="col-span-2 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                <input placeholder="Artigo do Regimento" value={form.artigo_regimento} onChange={e => setForm(f => ({...f, artigo_regimento: e.target.value}))} className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                <input type="number" placeholder="Valor Multa" value={form.valor_multa} onChange={e => setForm(f => ({...f, valor_multa: e.target.value}))} className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
                <textarea placeholder="Descrição*" value={form.descricao} onChange={e => setForm(f => ({...f, descricao: e.target.value}))} rows={3} className="col-span-2 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none" />
              </div>
              <div className="flex gap-3">
                <button onClick={() => create({ data: { ...form, morador_id: Number(form.morador_id) } as any })} disabled={isCreating || !form.morador_id || !form.titulo || !form.descricao} className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
                  {isCreating ? "Salvando..." : "Enviar"}
                </button>
                <button onClick={() => setShowForm(false)} className="bg-secondary text-muted-foreground hover:text-white text-sm px-4 py-2 rounded-lg">Cancelar</button>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            {[["","Todas"],["enviada","Enviadas"],["contestada","Contestadas"],["resolvida","Resolvidas"]].map(([v,l]) => (
              <button key={v} onClick={() => setStatusFilter(v)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors", statusFilter === v ? "bg-primary/20 border-primary text-primary" : "bg-secondary border-border text-muted-foreground hover:text-white")}>
                {l}
              </button>
            ))}
          </div>

          <div className="space-y-3">
            {notifsLoading ? (
              <div className="text-center py-10 text-muted-foreground"><RefreshCcw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" /></div>
            ) : notificacoes?.length === 0 ? (
              <div className="text-center py-10 text-muted-foreground bg-card border border-border rounded-xl">Nenhuma notificação encontrada.</div>
            ) : notificacoes?.map(n => {
              const statusConf = STATUS_CONFIG[n.status] || STATUS_CONFIG.enviada;
              const StatusIcon = statusConf.icon;
              return (
                <div key={n.id} className="bg-card border border-border rounded-xl p-5 space-y-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-semibold text-white">{n.titulo}</h4>
                      <p className="text-sm text-muted-foreground mt-1">{n.descricao}</p>
                    </div>
                    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-semibold shrink-0 ml-4", statusConf.class)}>
                      <StatusIcon className="w-3 h-3" />{statusConf.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
                    {n.morador_nome && <span>👤 {n.morador_nome} ({n.morador_apartamento})</span>}
                    {n.artigo_regimento && <span>📜 Art. {n.artigo_regimento}</span>}
                    {n.valor_multa && <span className="text-red-400">R$ {formatCurrency(n.valor_multa)}</span>}
                    {n.data_prazo && <span>⏰ Prazo: {new Date(n.data_prazo).toLocaleDateString("pt-BR")}</span>}
                  </div>
                  <div className="flex gap-2">
                    <select value={n.status} onChange={e => update({ id: n.id, data: { status: e.target.value } as any })} className="bg-background border border-border text-xs rounded px-2 py-1.5 focus:outline-none focus:border-primary cursor-pointer">
                      <option value="enviada">Enviada</option>
                      <option value="contestada">Contestada</option>
                      <option value="resolvida">Resolvida</option>
                    </select>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
