import { useState } from "react";
import { useListEncomendas, useUpdateEncomendaStatus } from "@workspace/api-client-react";
import { Search, Filter, Box, RefreshCcw, CheckCircle2, AlertTriangle, Clock, XCircle } from "lucide-react";
import { cn, formatDateTime } from "@/lib/utils";
import { useQueryClient } from "@tanstack/react-query";
import { getListEncomendasQueryKey } from "@workspace/api-client-react";

export default function Dashboard() {
  const [aptoFilter, setAptoFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
  const queryClient = useQueryClient();

  const { data: encomendas, isLoading, isFetching } = useListEncomendas(
    { 
      apartamento: aptoFilter || undefined,
      status_valido: statusFilter || undefined
    },
    { 
      query: { 
        refetchInterval: 30000,
        staleTime: 10000 
      } 
    }
  );

  const { mutate: updateStatus, isPending: isUpdating } = useUpdateEncomendaStatus({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListEncomendasQueryKey() });
      }
    }
  });

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'pendente': return { icon: Clock, class: "bg-amber-500/10 text-amber-500 border-amber-500/20", label: "Pendente" };
      case 'notificado': return { icon: AlertTriangle, class: "bg-blue-500/10 text-blue-400 border-blue-500/20", label: "Notificado" };
      case 'retirado': return { icon: CheckCircle2, class: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20", label: "Retirado" };
      case 'extraviado': return { icon: XCircle, class: "bg-red-500/10 text-red-500 border-red-500/20", label: "Extraviado" };
      default: return { icon: Box, class: "bg-gray-500/10 text-gray-500 border-gray-500/20", label: status };
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display text-white flex items-center gap-3">
            <Box className="w-8 h-8 text-primary" />
            Central de Encomendas
          </h1>
          <p className="text-muted-foreground mt-1">Monitoramento e triagem em tempo real</p>
        </div>

        <div className="flex items-center gap-3">
          {isFetching && <RefreshCcw className="w-4 h-4 text-muted-foreground animate-spin" />}
          <div className="text-xs text-muted-foreground font-mono bg-secondary px-3 py-1.5 rounded-md border border-border">
            Status: <span className="text-emerald-500">ONLINE</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-xl p-4 shadow-lg shadow-black/20 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar por Apartamento (ex: 101)" 
            value={aptoFilter}
            onChange={(e) => setAptoFilter(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
          />
        </div>
        <div className="sm:w-64 relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-background border border-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary appearance-none transition-all"
          >
            <option value="">Todos os Status</option>
            <option value="pendente">Pendente</option>
            <option value="notificado">Notificado</option>
            <option value="retirado">Retirado</option>
            <option value="extraviado">Extraviado</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl shadow-lg shadow-black/20 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-secondary/50 border-b border-border text-muted-foreground font-display uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">Cód. Rastreio</th>
                <th className="px-6 py-4 font-semibold">Morador</th>
                <th className="px-6 py-4 font-semibold">Apto/Bloco</th>
                <th className="px-6 py-4 font-semibold">Status OCR</th>
                <th className="px-6 py-4 font-semibold">Recebimento</th>
                <th className="px-6 py-4 font-semibold text-right">Ação Rápida</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <RefreshCcw className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
                    Carregando registros...
                  </td>
                </tr>
              ) : encomendas?.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    <Box className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    Nenhuma encomenda encontrada com os filtros atuais.
                  </td>
                </tr>
              ) : (
                encomendas?.map((enc) => {
                  const statusConf = getStatusConfig(enc.status_valido);
                  const StatusIcon = statusConf.icon;
                  
                  return (
                    <tr key={enc.id} className="hover:bg-secondary/30 transition-colors group">
                      <td className="px-6 py-4 font-mono text-primary-foreground">{enc.codigo_rastreio}</td>
                      <td className="px-6 py-4 font-medium text-white">{enc.morador_nome || 'N/A'}</td>
                      <td className="px-6 py-4">
                        <span className="bg-background px-2 py-1 rounded border border-border font-mono text-xs text-muted-foreground">
                          {enc.morador_apartamento || '-'}/{enc.morador_bloco || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className={cn("inline-flex items-center px-2.5 py-1 rounded-full border text-xs font-semibold", statusConf.class)}>
                          <StatusIcon className="w-3.5 h-3.5 mr-1.5" />
                          {statusConf.label}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatDateTime(enc.data_recebimento)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <select
                          disabled={isUpdating}
                          value={enc.status_valido}
                          onChange={(e) => updateStatus({ id: enc.id, data: { status_valido: e.target.value as any } })}
                          className="bg-background border border-border text-xs rounded px-2 py-1.5 focus:outline-none focus:border-primary disabled:opacity-50 cursor-pointer"
                        >
                          <option value="pendente">Pendente</option>
                          <option value="notificado">Notificar</option>
                          <option value="retirado">Marcar Retirado</option>
                        </select>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
