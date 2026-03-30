import { useListAssembleias, useGetAssembleia, useCreateAssembleia, useUpdateAssembleia } from "@workspace/api-client-react";
import { CalendarDays, Plus, RefreshCcw, CheckCircle2, Clock, AlertCircle } from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { getListAssembleiasQueryKey } from "@workspace/api-client-react";
import { useState } from "react";

const STATUS_CONFIG: Record<string, { label: string; icon: any; class: string }> = {
  agendada: { label: "Agendada", icon: Clock, class: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
  em_andamento: { label: "Em Andamento", icon: RefreshCcw, class: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  concluida: { label: "Concluída", icon: CheckCircle2, class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  cancelada: { label: "Cancelada", icon: AlertCircle, class: "bg-gray-500/10 text-gray-400 border-gray-500/20" },
};

export default function AssembleiasPage() {
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ titulo: "", tipo: "ordinaria", descricao: "", data_realizacao: "", local: "online", link_reuniao: "" });
  const qc = useQueryClient();

  const { data: assembleias, isLoading } = useListAssembleias({ status: statusFilter || undefined });
  const { mutate: create, isPending: isCreating } = useCreateAssembleia({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListAssembleiasQueryKey() }); setShowForm(false); setForm({ titulo: "", tipo: "ordinaria", descricao: "", data_realizacao: "", local: "online", link_reuniao: "" }); } } });
  const { mutate: update } = useUpdateAssembleia({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListAssembleiasQueryKey() }) } });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-white flex items-center gap-3"><CalendarDays className="w-7 h-7 text-primary" /> Assembleias & Votações</h1>
          <p className="text-muted-foreground mt-1 text-sm">Reuniões online, votações e atas</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Agendar Assembleia
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-display font-semibold text-white">Nova Assembleia</h3>
          <div className="grid grid-cols-2 gap-4">
            <input placeholder="Título*" value={form.titulo} onChange={e => setForm(f => ({...f, titulo: e.target.value}))} className="col-span-2 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            <select value={form.tipo} onChange={e => setForm(f => ({...f, tipo: e.target.value}))} className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
              <option value="ordinaria">Ordinária</option>
              <option value="extraordinaria">Extraordinária</option>
            </select>
            <input type="datetime-local" value={form.data_realizacao} onChange={e => setForm(f => ({...f, data_realizacao: e.target.value}))} className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            <input placeholder="Local / Link online" value={form.link_reuniao} onChange={e => setForm(f => ({...f, link_reuniao: e.target.value}))} className="col-span-2 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            <textarea placeholder="Descrição/Pauta" value={form.descricao} onChange={e => setForm(f => ({...f, descricao: e.target.value}))} rows={3} className="col-span-2 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary resize-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => create({ data: form })} disabled={isCreating || !form.titulo || !form.data_realizacao} className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
              {isCreating ? "Agendando..." : "Agendar"}
            </button>
            <button onClick={() => setShowForm(false)} className="bg-secondary text-muted-foreground hover:text-white text-sm px-4 py-2 rounded-lg">Cancelar</button>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {[["","Todas"],["agendada","Agendadas"],["em_andamento","Em Andamento"],["concluida","Concluídas"],["cancelada","Canceladas"]].map(([v,l]) => (
          <button key={v} onClick={() => setStatusFilter(v)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors", statusFilter === v ? "bg-primary/20 border-primary text-primary" : "bg-secondary border-border text-muted-foreground hover:text-white")}>
            {l}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-10 text-muted-foreground"><RefreshCcw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" /></div>
        ) : assembleias?.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground bg-card border border-border rounded-xl">Nenhuma assembleia encontrada.</div>
        ) : assembleias?.map(a => {
          const statusConf = STATUS_CONFIG[a.status] || STATUS_CONFIG.agendada;
          const StatusIcon = statusConf.icon;
          return (
            <div key={a.id} className="bg-card border border-border rounded-xl p-6 hover:border-primary/30 transition-all">
              <div className="flex flex-col md:flex-row md:items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold uppercase bg-primary/20 text-primary border border-primary/40 px-2.5 py-1 rounded">{a.tipo}</span>
                    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-semibold", statusConf.class)}>
                      <StatusIcon className="w-3 h-3" />{statusConf.label}
                    </span>
                  </div>
                  <h3 className="text-lg font-display font-semibold text-white">{a.titulo}</h3>
                  <p className="text-sm text-muted-foreground mt-2">{a.descricao}</p>
                  <div className="flex flex-wrap items-center gap-4 mt-4 text-xs text-muted-foreground">
                    <span>📅 {new Date(a.data_realizacao).toLocaleDateString("pt-BR", {weekday:"short", day:"2-digit", month:"short"})}</span>
                    <span>🕐 {new Date(a.data_realizacao).toLocaleTimeString("pt-BR", {hour:"2-digit", minute:"2-digit"})}</span>
                    <span>📍 {a.local}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {a.link_reuniao && <a href={a.link_reuniao} target="_blank" rel="noopener noreferrer" className="text-xs bg-primary hover:bg-primary/90 text-white px-3 py-1.5 rounded font-semibold transition-colors">Acessar Reunião</a>}
                  <select value={a.status} onChange={e => update({ id: a.id, data: { status: e.target.value } as any })} className="bg-background border border-border text-xs rounded px-3 py-1.5 focus:outline-none focus:border-primary cursor-pointer">
                    <option value="agendada">Agendada</option>
                    <option value="em_andamento">Em Andamento</option>
                    <option value="concluida">Concluída</option>
                    <option value="cancelada">Cancelada</option>
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
