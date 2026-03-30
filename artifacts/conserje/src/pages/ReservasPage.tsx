import { useListAreas, useListReservas, useCreateReserva, useUpdateReserva } from "@workspace/api-client-react";
import { CalendarCheck, Plus, RefreshCcw, CheckCircle2, Clock, XCircle } from "lucide-react";
import { cn, formatDateTime, formatCurrency } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { getListReservasQueryKey } from "@workspace/api-client-react";
import { useState } from "react";

const STATUS_CONFIG: Record<string, { label: string; icon: any; class: string }> = {
  confirmada: { label: "Confirmada", icon: CheckCircle2, class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  pendente: { label: "Pendente", icon: Clock, class: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  cancelada: { label: "Cancelada", icon: XCircle, class: "bg-red-500/10 text-red-400 border-red-500/20" },
};

export default function ReservasPage() {
  const [areaFilter, setAreaFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ area_id: "", morador_id: "", data_inicio: "", data_fim: "", status: "confirmada", motivo: "" });
  const qc = useQueryClient();

  const { data: areas } = useListAreas();
  const { data: reservas, isLoading } = useListReservas({ area_id: areaFilter ? parseInt(areaFilter) : undefined, status: statusFilter || undefined });
  const { mutate: create, isPending: isCreating } = useCreateReserva({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListReservasQueryKey() }); setShowForm(false); setForm({ area_id: "", morador_id: "", data_inicio: "", data_fim: "", status: "confirmada", motivo: "" }); } } });
  const { mutate: update } = useUpdateReserva({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListReservasQueryKey() }) } });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-white flex items-center gap-3"><CalendarCheck className="w-7 h-7 text-primary" /> Reservas — Áreas Comuns</h1>
          <p className="text-muted-foreground mt-1 text-sm">Calendário de reservas de piscina, salão, quadra...</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Nova Reserva
        </button>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-display font-semibold text-white">Agendar Reserva</h3>
          <div className="grid grid-cols-2 gap-4">
            <select value={form.area_id} onChange={e => setForm(f => ({...f, area_id: e.target.value}))} className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
              <option value="">Selecione uma Área</option>
              {areas?.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
            </select>
            <input type="number" placeholder="ID Morador" value={form.morador_id} onChange={e => setForm(f => ({...f, morador_id: e.target.value}))} className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            <input type="datetime-local" value={form.data_inicio} onChange={e => setForm(f => ({...f, data_inicio: e.target.value}))} className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            <input type="datetime-local" value={form.data_fim} onChange={e => setForm(f => ({...f, data_fim: e.target.value}))} className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            <input placeholder="Motivo (ex: Festa, Treino)" value={form.motivo} onChange={e => setForm(f => ({...f, motivo: e.target.value}))} className="col-span-2 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => create({ data: { ...form, area_id: Number(form.area_id), morador_id: Number(form.morador_id) } as any })} disabled={isCreating || !form.area_id || !form.morador_id || !form.data_inicio || !form.data_fim} className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
              {isCreating ? "Agendando..." : "Confirmar Reserva"}
            </button>
            <button onClick={() => setShowForm(false)} className="bg-secondary text-muted-foreground hover:text-white text-sm px-4 py-2 rounded-lg">Cancelar</button>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <select value={areaFilter} onChange={e => setAreaFilter(e.target.value)} className="bg-card border border-border rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-primary">
          <option value="">Todas as Áreas</option>
          {areas?.map(a => <option key={a.id} value={a.id}>{a.nome}</option>)}
        </select>
        {[["","Todas"],["confirmada","Confirmadas"],["pendente","Pendentes"],["cancelada","Canceladas"]].map(([v,l]) => (
          <button key={v} onClick={() => setStatusFilter(v)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors", statusFilter === v ? "bg-primary/20 border-primary text-primary" : "bg-secondary border-border text-muted-foreground hover:text-white")}>
            {l}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary/50 border-b border-border text-muted-foreground font-display uppercase tracking-wider text-xs">
            <tr>
              <th className="px-5 py-3">Área</th>
              <th className="px-5 py-3">Morador</th>
              <th className="px-5 py-3">Período</th>
              <th className="px-5 py-3">Motivo</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground"><RefreshCcw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" /></td></tr>
            ) : reservas?.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">Nenhuma reserva encontrada.</td></tr>
            ) : reservas?.map(r => {
              const statusConf = STATUS_CONFIG[r.status] || STATUS_CONFIG.confirmada;
              const StatusIcon = statusConf.icon;
              return (
                <tr key={r.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-5 py-3 font-medium text-white">{r.area_nome || `Área #${r.area_id}`}</td>
                  <td className="px-5 py-3"><span className="text-white">{r.morador_nome}</span><br/><span className="text-xs text-muted-foreground">{r.morador_apartamento}</span></td>
                  <td className="px-5 py-3 text-xs text-muted-foreground">{new Date(r.data_inicio).toLocaleDateString("pt-BR")} às {new Date(r.data_inicio).toLocaleTimeString("pt-BR", {hour:"2-digit", minute:"2-digit"})}</td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">{r.motivo || "—"}</td>
                  <td className="px-5 py-3"><span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded border text-xs font-semibold", statusConf.class)}><StatusIcon className="w-3 h-3" />{statusConf.label}</span></td>
                  <td className="px-5 py-3 text-right">
                    <select value={r.status} onChange={e => update({ id: r.id, data: { status: e.target.value } as any })} className="bg-background border border-border text-xs rounded px-2 py-1.5 focus:outline-none focus:border-primary cursor-pointer">
                      <option value="confirmada">Confirmada</option>
                      <option value="pendente">Pendente</option>
                      <option value="cancelada">Cancelada</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
