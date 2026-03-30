import { useState } from "react";
import { useListMoradores, useUpdateMorador, useCreateMorador } from "@workspace/api-client-react";
import { Users, Search, Plus, Phone, Mail, Car, CheckCircle2, AlertCircle, XCircle, RefreshCcw } from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { getListMoradoresQueryKey } from "@workspace/api-client-react";

const STATUS_CONFIG: Record<string, { label: string; class: string; icon: any }> = {
  ativo: { label: "Ativo", class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20", icon: CheckCircle2 },
  inativo: { label: "Inativo", class: "bg-gray-500/10 text-gray-400 border-gray-500/20", icon: XCircle },
  inadimplente: { label: "Inadimplente", class: "bg-red-500/10 text-red-400 border-red-500/20", icon: AlertCircle },
};

export default function MoradoresPage() {
  const [q, setQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ nome: "", apartamento: "", bloco: "", telefone: "", email: "", status: "ativo" });
  const qc = useQueryClient();

  const { data: moradores, isLoading, isFetching } = useListMoradores({ q: q || undefined, status: statusFilter || undefined });
  const { mutate: updateMorador } = useUpdateMorador({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListMoradoresQueryKey() }) } });
  const { mutate: createMorador, isPending: isCreating } = useCreateMorador({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListMoradoresQueryKey() }); setShowForm(false); setForm({ nome: "", apartamento: "", bloco: "", telefone: "", email: "", status: "ativo" }); } } });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-white flex items-center gap-3"><Users className="w-7 h-7 text-primary" /> Moradores</h1>
          <p className="text-muted-foreground mt-1 text-sm">Cadastro e gestão dos condôminos</p>
        </div>
        <div className="flex items-center gap-3">
          {isFetching && <RefreshCcw className="w-4 h-4 text-muted-foreground animate-spin" />}
          <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Novo Morador
          </button>
        </div>
      </div>

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-display font-semibold text-white">Cadastrar Novo Morador</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {[["nome","Nome Completo"],["apartamento","Apartamento"],["bloco","Bloco"],["telefone","Telefone"],["email","E-mail"]].map(([key, label]) => (
              <input key={key} placeholder={label} value={(form as any)[key]} onChange={e => setForm(f => ({...f, [key]: e.target.value}))}
                className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            ))}
            <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))} className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
              <option value="ativo">Ativo</option>
              <option value="inativo">Inativo</option>
              <option value="inadimplente">Inadimplente</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={() => createMorador({ data: form })} disabled={isCreating || !form.nome || !form.apartamento || !form.bloco || !form.telefone}
              className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
              {isCreating ? "Salvando..." : "Salvar"}
            </button>
            <button onClick={() => setShowForm(false)} className="bg-secondary text-muted-foreground hover:text-white text-sm px-4 py-2 rounded-lg transition-colors">Cancelar</button>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input placeholder="Buscar por nome, apto ou bloco..." value={q} onChange={e => setQ(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-primary">
          <option value="">Todos os Status</option>
          <option value="ativo">Ativos</option>
          <option value="inativo">Inativos</option>
          <option value="inadimplente">Inadimplentes</option>
        </select>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary/50 border-b border-border text-muted-foreground font-display uppercase tracking-wider text-xs">
            <tr>
              <th className="px-5 py-3">Morador</th>
              <th className="px-5 py-3">Apto/Bloco</th>
              <th className="px-5 py-3">Contato</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Alterar Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground"><RefreshCcw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" />Carregando...</td></tr>
            ) : moradores?.length === 0 ? (
              <tr><td colSpan={5} className="px-5 py-10 text-center text-muted-foreground">Nenhum morador encontrado.</td></tr>
            ) : moradores?.map(m => {
              const conf = STATUS_CONFIG[m.status] || STATUS_CONFIG.ativo;
              const Icon = conf.icon;
              return (
                <tr key={m.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                        <span className="text-xs font-display font-bold text-primary">{m.nome.charAt(0)}</span>
                      </div>
                      <span className="font-medium text-white">{m.nome}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3"><span className="font-mono text-xs bg-background border border-border px-2 py-1 rounded">{m.apartamento}/{m.bloco}</span></td>
                  <td className="px-5 py-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="w-3 h-3" />{m.telefone}</div>
                      {m.email && <div className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="w-3 h-3" />{m.email}</div>}
                    </div>
                  </td>
                  <td className="px-5 py-3">
                    <span className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold", conf.class)}>
                      <Icon className="w-3 h-3" />{conf.label}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <select value={m.status} onChange={e => updateMorador({ id: m.id, data: { status: e.target.value } as any })}
                      className="bg-background border border-border text-xs rounded px-2 py-1.5 focus:outline-none focus:border-primary cursor-pointer">
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                      <option value="inadimplente">Inadimplente</option>
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
