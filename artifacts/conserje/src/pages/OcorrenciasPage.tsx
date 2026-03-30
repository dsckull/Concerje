import { useState } from "react";
import { useListOcorrencias, useCreateOcorrencia, useUpdateOcorrencia } from "@workspace/api-client-react";
import { Wrench, Plus, RefreshCcw, AlertTriangle, CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { getListOcorrenciasQueryKey } from "@workspace/api-client-react";

const PRIO_CONFIG: Record<string, { label: string; class: string }> = {
  urgente: { label: "Urgente", class: "text-red-400 bg-red-500/10 border-red-500/30" },
  alta: { label: "Alta", class: "text-orange-400 bg-orange-500/10 border-orange-500/30" },
  normal: { label: "Normal", class: "text-amber-400 bg-amber-500/10 border-amber-500/30" },
  baixa: { label: "Baixa", class: "text-emerald-400 bg-emerald-500/10 border-emerald-500/30" },
};
const STATUS_CONFIG: Record<string, { label: string; class: string; icon: any }> = {
  aberta: { label: "Aberta", class: "text-amber-400 bg-amber-500/10 border-amber-500/20", icon: Clock },
  em_andamento: { label: "Em Andamento", class: "text-blue-400 bg-blue-500/10 border-blue-500/20", icon: RefreshCcw },
  concluida: { label: "Concluída", class: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", icon: CheckCircle2 },
  cancelada: { label: "Cancelada", class: "text-gray-400 bg-gray-500/10 border-gray-500/20", icon: XCircle },
};

export default function OcorrenciasPage() {
  const [statusFilter, setStatusFilter] = useState("aberta");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titulo: "", descricao: "", tipo: "manutencao", prioridade: "normal", area: "" });
  const qc = useQueryClient();

  const { data: ocorrencias, isLoading, isFetching } = useListOcorrencias({ status: statusFilter || undefined });
  const { mutate: create, isPending: isCreating } = useCreateOcorrencia({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListOcorrenciasQueryKey() }); setShowForm(false); setForm({ titulo: "", descricao: "", tipo: "manutencao", prioridade: "normal", area: "" }); } } });
  const { mutate: update } = useUpdateOcorrencia({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListOcorrenciasQueryKey() }) } });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-white flex items-center gap-3"><Wrench className="w-7 h-7 text-primary" /> Ocorrências & Serviços</h1>
          <p className="text-muted-foreground mt-1 text-sm">Chamados, manutenções e prestadores de serviço</p>
        </div>
        <div className="flex items-center gap-3">
          {isFetching && <RefreshCcw className="w-4 h-4 animate-spin text-muted-foreground" />}
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Nova Ocorrência
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-display font-semibold text-white">Registrar Ocorrência</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <input placeholder="Título*" value={form.titulo} onChange={e => setForm(f => ({...f, titulo: e.target.value}))} className="col-span-2 md:col-span-1 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            <select value={form.tipo} onChange={e => setForm(f => ({...f, tipo: e.target.value}))} className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
              <option value="manutencao">Manutenção</option>
              <option value="reclamacao">Reclamação</option>
              <option value="emergencia">Emergência</option>
              <option value="sugestao">Sugestão</option>
            </select>
            <select value={form.prioridade} onChange={e => setForm(f => ({...f, prioridade: e.target.value}))} className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
              <option value="baixa">Baixa Prioridade</option>
              <option value="normal">Normal</option>
              <option value="alta">Alta</option>
              <option value="urgente">Urgente</option>
            </select>
            <input placeholder="Área (ex: Piscina, Elevador)" value={form.area} onChange={e => setForm(f => ({...f, area: e.target.value}))} className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            <textarea placeholder="Descrição detalhada*" value={form.descricao} onChange={e => setForm(f => ({...f, descricao: e.target.value}))} rows={3}
              className="col-span-2 md:col-span-3 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => create({ data: form })} disabled={isCreating || !form.titulo || !form.descricao}
              className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
              {isCreating ? "Salvando..." : "Registrar"}
            </button>
            <button onClick={() => setShowForm(false)} className="bg-secondary text-muted-foreground hover:text-white text-sm px-4 py-2 rounded-lg">Cancelar</button>
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {[["", "Todos"], ["aberta", "Abertas"], ["em_andamento", "Em Andamento"], ["concluida", "Concluídas"], ["cancelada", "Canceladas"]].map(([val, label]) => (
          <button key={val} onClick={() => setStatusFilter(val)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors", statusFilter === val ? "bg-primary/20 border-primary text-primary" : "bg-secondary border-border text-muted-foreground hover:text-white")}>
            {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-10 text-muted-foreground"><RefreshCcw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />Carregando...</div>
        ) : ocorrencias?.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground bg-card border border-border rounded-xl">Nenhuma ocorrência encontrada.</div>
        ) : ocorrencias?.map(o => {
          const statusConf = STATUS_CONFIG[o.status] || STATUS_CONFIG.aberta;
          const prioConf = PRIO_CONFIG[o.prioridade] || PRIO_CONFIG.normal;
          const StatusIcon = statusConf.icon;
          return (
            <div key={o.id} className="bg-card border border-border rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <span className={cn("px-2 py-0.5 rounded border text-xs font-bold uppercase", prioConf.class)}>{prioConf.label}</span>
                  <span className="text-xs text-muted-foreground uppercase font-semibold">{o.tipo}</span>
                  {o.area && <span className="text-xs text-muted-foreground bg-secondary border border-border px-2 py-0.5 rounded">{o.area}</span>}
                </div>
                <p className="font-semibold text-white">{o.titulo}</p>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{o.descricao}</p>
                <p className="text-xs text-muted-foreground mt-2">{formatDateTime(o.created_at)}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold", statusConf.class)}>
                  <StatusIcon className="w-3 h-3" />{statusConf.label}
                </span>
                <select value={o.status} onChange={e => update({ id: o.id, data: { status: e.target.value } as any })}
                  className="bg-background border border-border text-xs rounded px-2 py-1.5 focus:outline-none focus:border-primary cursor-pointer">
                  <option value="aberta">Aberta</option>
                  <option value="em_andamento">Em Andamento</option>
                  <option value="concluida">Concluída</option>
                  <option value="cancelada">Cancelada</option>
                </select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
