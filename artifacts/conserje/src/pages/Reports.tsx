import { useGetPerfilEmocionalStats, useGetAcoesStats, useListLogs } from "@workspace/api-client-react";
import { BarChart3, Activity, Users, MessageSquareWarning } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, LineChart, Line, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { formatDateTime } from "@/lib/utils";

const EMOTION_COLORS: Record<string, string> = {
  'colaborativo': '#10b981', // emerald-500
  'empolgado': '#3b82f6', // blue-500
  'neutro': '#6b7280', // gray-500
  'passivo': '#94a3b8', // gray-400
  'confuso': '#eab308', // yellow-500
  'frustrado': '#f97316', // orange-500
  'estressado': '#ef4444', // red-500
  'revoltado': '#dc2626', // red-600
  'mal-intencionado': '#991b1b', // red-800
};

export default function Reports() {
  const { data: emotionalStats } = useGetPerfilEmocionalStats({ query: { refetchInterval: 60000 } });
  const { data: actionsStats } = useGetAcoesStats({ query: { refetchInterval: 60000 } });
  const { data: recentLogs } = useListLogs(
    { }, // fetch all recent
    { query: { refetchInterval: 60000 } }
  );

  // Calculate KPIs
  const totalLogs = emotionalStats?.reduce((acc, curr) => acc + curr.count, 0) || 0;
  const negativeEmotions = emotionalStats?.filter(s => ['estressado', 'revoltado', 'mal-intencionado'].includes(s.perfil_emocional)).reduce((acc, curr) => acc + curr.count, 0) || 0;
  const positiveEmotions = emotionalStats?.filter(s => ['colaborativo', 'empolgado'].includes(s.perfil_emocional)).reduce((acc, curr) => acc + curr.count, 0) || 0;
  
  const negativePercent = totalLogs > 0 ? Math.round((negativeEmotions / totalLogs) * 100) : 0;
  const positivePercent = totalLogs > 0 ? Math.round((positiveEmotions / totalLogs) * 100) : 0;
  
  const daysWithData = actionsStats?.length || 1;
  const avgDaily = Math.round(totalLogs / daysWithData);

  const pieData = emotionalStats?.map(s => ({
    name: s.perfil_emocional.charAt(0).toUpperCase() + s.perfil_emocional.slice(1),
    value: s.count,
    fill: EMOTION_COLORS[s.perfil_emocional] || '#888888'
  })) || [];

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-display text-white flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-primary" />
          Análise e Comportamento
        </h1>
        <p className="text-muted-foreground mt-1">Inteligência do condomínio processada pelo n8n</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard 
          title="Total de Interações" 
          value={totalLogs.toString()} 
          icon={Activity} 
          trend="Período total" 
          color="text-primary" 
        />
        <KpiCard 
          title="Taxa de Atrito" 
          value={`${negativePercent}%`} 
          icon={MessageSquareWarning} 
          trend="Estressados/Revoltados" 
          color="text-red-500" 
        />
        <KpiCard 
          title="Taxa Colaborativa" 
          value={`${positivePercent}%`} 
          icon={Users} 
          trend="Colaborativos/Empolgados" 
          color="text-emerald-500" 
        />
        <KpiCard 
          title="Média Diária" 
          value={avgDaily.toString()} 
          icon={BarChart3} 
          trend="Msgs por dia" 
          color="text-blue-400" 
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Pie Chart */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg shadow-black/20">
          <h3 className="font-display font-semibold text-lg text-white mb-4">Radar Emocional</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} stroke="rgba(0,0,0,0.5)" strokeWidth={2} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Line Chart */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-lg shadow-black/20 lg:col-span-2">
          <h3 className="font-display font-semibold text-lg text-white mb-4">Volume de Interações (30 dias)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={actionsStats || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" vertical={false} />
                <XAxis dataKey="data" stroke="#6b7280" tick={{fill: '#6b7280', fontSize: 12}} tickMargin={10} />
                <YAxis stroke="#6b7280" tick={{fill: '#6b7280', fontSize: 12}} tickMargin={10} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: '#171717', borderColor: '#262626', color: '#fff', borderRadius: '8px' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                <Line type="monotone" name="Textos" dataKey="textos" stroke="#3b82f6" strokeWidth={3} dot={{r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#0a0a0a'}} activeDot={{r: 6}} />
                <Line type="monotone" name="Imagens" dataKey="imagens" stroke="#10b981" strokeWidth={3} dot={{r: 4, fill: '#10b981', strokeWidth: 2, stroke: '#0a0a0a'}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-card border border-border rounded-xl shadow-lg shadow-black/20 overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-border bg-secondary/30">
          <h3 className="font-display font-semibold text-lg text-white">Log de Operações em Tempo Real</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-background/50 border-b border-border text-muted-foreground font-display uppercase tracking-wider text-xs">
              <tr>
                <th className="px-6 py-4 font-semibold">Data/Hora</th>
                <th className="px-6 py-4 font-semibold">Morador</th>
                <th className="px-6 py-4 font-semibold">Tipo</th>
                <th className="px-6 py-4 font-semibold">Ação</th>
                <th className="px-6 py-4 font-semibold">Perfil Emocional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {recentLogs?.slice(0, 10).map((log) => (
                <tr key={log.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-3 text-muted-foreground">{formatDateTime(log.created_at || '')}</td>
                  <td className="px-6 py-3 font-medium text-white">{log.morador_nome || `Apto ${log.morador_apartamento}`}</td>
                  <td className="px-6 py-3">
                    <span className="bg-secondary px-2 py-1 rounded text-xs border border-border">{log.tipo_msg}</span>
                  </td>
                  <td className="px-6 py-3 text-white truncate max-w-[200px]">{log.acao}</td>
                  <td className="px-6 py-3">
                    <span 
                      className="px-2 py-1 rounded-full text-xs font-semibold border"
                      style={{ 
                        backgroundColor: `${EMOTION_COLORS[log.perfil_emocional]}20`,
                        color: EMOTION_COLORS[log.perfil_emocional],
                        borderColor: `${EMOTION_COLORS[log.perfil_emocional]}40`
                      }}
                    >
                      {log.perfil_emocional}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}

function KpiCard({ title, value, icon: Icon, trend, color }: { title: string, value: string, icon: any, trend: string, color: string }) {
  return (
    <div className="bg-card border border-border rounded-xl p-5 shadow-lg shadow-black/20 hover:border-primary/30 transition-colors group">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <h4 className="text-3xl font-display font-bold text-white mt-2 group-hover:scale-105 transition-transform origin-left">{value}</h4>
        </div>
        <div className={`p-3 rounded-lg bg-secondary border border-border ${color}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4 text-xs text-muted-foreground">
        {trend}
      </div>
    </div>
  );
}
