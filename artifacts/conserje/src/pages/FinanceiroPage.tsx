import { useState } from "react";
import { useGetResumoFinanceiro, useListFinanceiro, useCreateFinanceiro, useUpdateFinanceiro } from "@workspace/api-client-react";
import { DollarSign, Plus, TrendingUp, TrendingDown, RefreshCcw } from "lucide-react";
import { cn, formatDateTime, formatCurrency } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { getListFinanceiroQueryKey } from "@workspace/api-client-react";

const TIPO_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  receita: { label: "Receita", icon: TrendingUp, color: "text-emerald-400" },
  despesa: { label: "Despesa", icon: TrendingDown, color: "text-red-400" },
  cobranca: { label: "Cobrança", icon: DollarSign, color: "text-amber-400" },
};

const STATUS_CONFIG: Record<string, { label: string; class: string }> = {
  pendente: { label: "Pendente", class: "bg-amber-500/10 text-amber-400 border-amber-500/20" },
  pago: { label: "Pago", class: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  vencido: { label: "Vencido", class: "bg-red-500/10 text-red-400 border-red-500/20" },
};

export default function FinanceiroPage() {
  const [tipo, setTipo] = useState("");
  const [status, setStatus] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ tipo: "despesa", descricao: "", valor: "", categoria: "outros", status: "pendente", data_vencimento: "" });
  const qc = useQueryClient();

  const { data: resumo } = useGetResumoFinanceiro({ query: { refetchInterval: 60000, queryKey: ["resumoP"] } as any });
  const { data: movimentacoes, isLoading } = useListFinanceiro({ tipo: tipo || undefined, status: status || undefined });
  const { mutate: create, isPending: isCreating } = useCreateFinanceiro({ mutation: { onSuccess: () => { qc.invalidateQueries({ queryKey: getListFinanceiroQueryKey() }); setShowForm(false); setForm({ tipo: "despesa", descricao: "", valor: "", categoria: "outros", status: "pendente", data_vencimento: "" }); } } });
  const { mutate: update } = useUpdateFinanceiro({ mutation: { onSuccess: () => qc.invalidateQueries({ queryKey: getListFinanceiroQueryKey() }) } });

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-display text-white flex items-center gap-3"><DollarSign className="w-7 h-7 text-primary" /> Financeiro</h1>
          <p className="text-muted-foreground mt-1 text-sm">Receitas, despesas e fluxo de caixa</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" /> Lançamento
        </button>
      </div>

      {resumo && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Saldo</p>
            <p className={cn("text-2xl font-display font-bold", resumo.saldo >= 0 ? "text-emerald-400" : "text-red-400")}>{formatCurrency(resumo.saldo)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Receitas</p>
            <p className="text-2xl font-display font-bold text-emerald-400">{formatCurrency(resumo.total_receitas)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Despesas</p>
            <p className="text-2xl font-display font-bold text-red-400">{formatCurrency(resumo.total_despesas)}</p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <p className="text-xs text-muted-foreground uppercase font-semibold mb-2">Pendentes</p>
            <p className="text-2xl font-display font-bold text-amber-400">{resumo.a_vencer}</p>
          </div>
        </div>
      )}

      {showForm && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <h3 className="font-display font-semibold text-white">Novo Lançamento</h3>
          <div className="grid grid-cols-2 gap-4">
            <select value={form.tipo} onChange={e => setForm(f => ({...f, tipo: e.target.value}))} className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
              <option value="cobranca">Cobrança</option>
            </select>
            <input type="number" placeholder="Valor" value={form.valor} onChange={e => setForm(f => ({...f, valor: e.target.value}))} className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            <input placeholder="Descrição" value={form.descricao} onChange={e => setForm(f => ({...f, descricao: e.target.value}))} className="col-span-2 bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            <input type="date" value={form.data_vencimento} onChange={e => setForm(f => ({...f, data_vencimento: e.target.value}))} className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary" />
            <select value={form.status} onChange={e => setForm(f => ({...f, status: e.target.value}))} className="bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary">
              <option value="pendente">Pendente</option>
              <option value="pago">Pago</option>
              <option value="vencido">Vencido</option>
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={() => create({ data: { ...form, valor: Number(form.valor) } as any })} disabled={isCreating || !form.descricao || !form.valor} className="bg-primary hover:bg-primary/90 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors disabled:opacity-50">
              {isCreating ? "Salvando..." : "Lançar"}
            </button>
            <button onClick={() => setShowForm(false)} className="bg-secondary text-muted-foreground hover:text-white text-sm px-4 py-2 rounded-lg">Cancelar</button>
          </div>
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        {[["","Todos"],["receita","Receitas"],["despesa","Despesas"],["cobranca","Cobranças"]].map(([v,l]) => (
          <button key={v} onClick={() => setTipo(v)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors", tipo === v ? "bg-primary/20 border-primary text-primary" : "bg-secondary border-border text-muted-foreground hover:text-white")}>
            {l}
          </button>
        ))}
        <div className="flex-1" />
        {[["","Todos"],["pago","Pagos"],["pendente","Pendentes"],["vencido","Vencidos"]].map(([v,l]) => (
          <button key={v} onClick={() => setStatus(v)} className={cn("px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors", status === v ? "bg-primary/20 border-primary text-primary" : "bg-secondary border-border text-muted-foreground hover:text-white")}>
            {l}
          </button>
        ))}
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-secondary/50 border-b border-border text-muted-foreground font-display uppercase tracking-wider text-xs">
            <tr>
              <th className="px-5 py-3">Descrição</th>
              <th className="px-5 py-3">Tipo</th>
              <th className="px-5 py-3 text-right">Valor</th>
              <th className="px-5 py-3">Vencimento</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {isLoading ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground"><RefreshCcw className="w-5 h-5 animate-spin mx-auto mb-2 text-primary" /></td></tr>
            ) : movimentacoes?.length === 0 ? (
              <tr><td colSpan={6} className="px-5 py-10 text-center text-muted-foreground">Nenhum lançamento encontrado.</td></tr>
            ) : movimentacoes?.map(m => {
              const tipoConf = TIPO_CONFIG[m.tipo] || TIPO_CONFIG.despesa;
              const statusConf = STATUS_CONFIG[m.status] || STATUS_CONFIG.pendente;
              const TipoIcon = tipoConf.icon;
              return (
                <tr key={m.id} className="hover:bg-secondary/20 transition-colors">
                  <td className="px-5 py-3 font-medium text-white">{m.descricao}</td>
                  <td className="px-5 py-3"><span className={cn("flex items-center gap-1.5 text-xs", tipoConf.color)}><TipoIcon className="w-3 h-3" />{tipoConf.label}</span></td>
                  <td className={cn("px-5 py-3 text-right font-semibold", tipoConf.color)}>{formatCurrency(m.valor)}</td>
                  <td className="px-5 py-3 text-muted-foreground text-xs">{m.data_vencimento ? new Date(m.data_vencimento).toLocaleDateString("pt-BR") : "—"}</td>
                  <td className="px-5 py-3"><span className={cn("px-2.5 py-1 rounded-full border text-xs font-semibold", statusConf.class)}>{statusConf.label}</span></td>
                  <td className="px-5 py-3 text-right">
                    <select value={m.status} onChange={e => update({ id: m.id, data: { status: e.target.value } as any })} className="bg-background border border-border text-xs rounded px-2 py-1.5 focus:outline-none focus:border-primary cursor-pointer">
                      <option value="pendente">Pendente</option>
                      <option value="pago">Pago</option>
                      <option value="vencido">Vencido</option>
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
