import { useState, useRef } from "react";
import { UploadCloud, CheckCircle2, AlertCircle, Trash2, ArrowRight, Save, X, RefreshCcw, Layers } from "lucide-react";
import * as xlsx from "xlsx";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getListMoradoresQueryKey } from "@workspace/api-client-react";

type ImportStep = "upload" | "mapping" | "preview" | "result";

interface ParsedRow {
  _original: Record<string, string>;
  nome?: string;
  apartamento?: string;
  bloco?: string;
  telefone?: string;
  email?: string;
  status?: string;
}

interface ColumnMapping {
  systemField: keyof ParsedRow;
  fileColumn: string;
}

const SYSTEM_FIELDS: { key: keyof ParsedRow; label: string; required?: boolean }[] = [
  { key: "nome", label: "Nome", required: true },
  { key: "apartamento", label: "Apartamento", required: true },
  { key: "bloco", label: "Bloco", required: true },
  { key: "telefone", label: "Telefone", required: true },
  { key: "email", label: "E-mail" },
];

export default function ImportarPage() {
  const [step, setStep] = useState<ImportStep>("upload");
  const [fileHeaders, setFileHeaders] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  
  // Mapeamento: chave = system field key, valor = nome da coluna no arquivo
  const [mapping, setMapping] = useState<Record<string, string>>({});
  
  // Preview
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  
  // Resumo
  const [results, setResults] = useState<{ inserted: number; skipped: number; errors: any[] } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const qc = useQueryClient();

  // Mutation para envio à importação
  const importMutation = useMutation({
    mutationFn: async (moradores: any[]) => {
      const res = await fetch("/api/moradores/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ moradores })
      });
      if (!res.ok) {
        throw new Error("Erro ao importar dados");
      }
      return res.json();
    },
    onSuccess: (data) => {
      setResults(data);
      setStep("result");
      qc.invalidateQueries({ queryKey: getListMoradoresQueryKey() });
    }
  });

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      if (typeof bstr !== "string" && !(bstr instanceof ArrayBuffer)) return;
      
      try {
        const workbook = xlsx.read(bstr, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        const data = xlsx.utils.sheet_to_json<Record<string, string>>(worksheet, { defval: "" });
        
        if (data.length > 0) {
          const headers = Object.keys(data[0]);
          setFileHeaders(headers);
          setRawRows(data);
          
          // Auto mapeamento baseado em nomes parecidos
          const autoMap: Record<string, string> = {};
          SYSTEM_FIELDS.forEach(sf => {
            const match = headers.find(h => h.toLowerCase().includes(sf.key.toLowerCase()));
            if (match) autoMap[sf.key] = match;
          });
          setMapping(autoMap);
          setStep("mapping");
        }
      } catch (err) {
        console.error("Erro ao ler arquivo:", err);
        alert("Erro ao ler este arquivo. Certifique-se de que é um CSV ou Excel válido.");
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const proceedToPreview = () => {
    const data: ParsedRow[] = rawRows.map(row => {
      const parsed: ParsedRow = { _original: row, status: "ativo" };
      SYSTEM_FIELDS.forEach(sf => {
        const colName = mapping[sf.key];
        if (colName && row[colName] !== undefined) {
          (parsed[sf.key as keyof ParsedRow] as any) = String(row[colName]).trim();
        }
      });
      return parsed;
    });
    setParsedData(data);
    setStep("preview");
  };

  const removeRow = (index: number) => {
    setParsedData(prev => prev.filter((_, i) => i !== index));
  };

  const validateItem = (item: ParsedRow) => {
    const errors: string[] = [];
    if (!item.nome) errors.push("Nome ausente");
    if (!item.apartamento) errors.push("Apartamento ausente");
    if (!item.bloco) errors.push("Bloco ausente");
    if (!item.telefone) errors.push("Telefone ausente");
    return errors;
  };

  const doImport = () => {
    importMutation.mutate(parsedData);
  };

  const reset = () => {
    setStep("upload");
    setRawRows([]);
    setFileHeaders([]);
    setParsedData([]);
    setResults(null);
    setMapping({});
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const renderUpload = () => (
    <div className="flex flex-col items-center justify-center p-12 mt-8 border-2 border-dashed border-primary/40 rounded-2xl bg-primary/5 hover:bg-primary/10 transition-colors">
      <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4">
        <UploadCloud className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-xl font-display font-semibold text-white mb-2">Importar Arquivo</h3>
      <p className="text-muted-foreground text-sm max-w-sm text-center mb-6">
        Selecione uma planilha (Excel, CSV) contendo os dados dos moradores a serem cadastrados no sistema.
      </p>
      
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileUpload} 
        accept=".csv, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel" 
        className="hidden" 
      />
      
      <button 
        onClick={() => fileInputRef.current?.click()}
        className="bg-primary text-white font-semibold flex items-center gap-2 px-6 py-3 rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-primary/50"
      >
        Selecionar Arquivo
      </button>
    </div>
  );

  const renderMapping = () => (
    <div className="space-y-6 mt-6">
      <div className="bg-card border border-border rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Revisar Mapeamento de Colunas</h3>
        <p className="text-sm text-muted-foreground mb-6">Diga ao sistema qual coluna do seu arquivo corresponde a qual informação do morador.</p>
        
        <div className="space-y-4">
          {SYSTEM_FIELDS.map(sf => (
            <div key={sf.key} className="flex flex-col md:flex-row md:items-center gap-4 py-3 border-b border-border/50 last:border-0">
              <div className="w-48 font-medium text-sm text-white flex items-center">
                {sf.label} 
                {sf.required && <span className="text-destructive ml-1">*</span>}
              </div>
              <div className="flex-1">
                <select 
                  className="w-full bg-background border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary"
                  value={mapping[sf.key] || ""}
                  onChange={e => setMapping(prev => ({ ...prev, [sf.key]: e.target.value }))}
                >
                  <option value="">-- Não importar --</option>
                  {fileHeaders.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-between">
        <button onClick={reset} className="text-muted-foreground hover:text-white px-4 py-2">Cancelar</button>
        <button 
          onClick={proceedToPreview}
          className="bg-primary text-white font-semibold flex items-center gap-2 px-6 py-2 rounded-xl hover:bg-primary/90 transition-colors"
        >
          Visualizar Tabela <ArrowRight className="w-4 h-4"/>
        </button>
      </div>
    </div>
  );

  const renderPreview = () => {
    let hasErrors = false;
    
    return (
      <div className="space-y-6 mt-6">
        <div className="bg-card border border-border rounded-xl overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-border flex justify-between items-center bg-secondary/30 shrink-0">
            <div>
              <h3 className="text-base font-semibold text-white">Preview dos Dados</h3>
              <p className="text-xs text-muted-foreground">{parsedData.length} registros encontrados no arquivo</p>
            </div>
            {/* Informações de validação global podem ir aqui */}
          </div>
          
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="bg-background/80 backdrop-blur-md sticky top-0 border-b border-border z-10 text-muted-foreground text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3 font-medium">Situação</th>
                  {SYSTEM_FIELDS.map(f => <th key={f.key} className="px-4 py-3 font-medium">{f.label}</th>)}
                  <th className="px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {parsedData.map((row, idx) => {
                  const errs = validateItem(row);
                  const isError = errs.length > 0;
                  if (isError) hasErrors = true;
                  
                  return (
                    <tr key={idx} className={cn("hover:bg-secondary/10 transition-colors", isError && "bg-destructive/5")}>
                      <td className="px-4 py-3">
                        {isError ? (
                          <div className="flex items-center gap-1.5 text-destructive text-xs font-semibold" title={errs.join(", ")}>
                            <AlertCircle className="w-3.5 h-3.5" /> Erros
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Ok
                          </div>
                        )}
                      </td>
                      {SYSTEM_FIELDS.map(f => (
                        <td key={f.key} className="px-4 py-3 text-white">
                          {(row as any)[f.key] || <span className="text-muted-foreground/50 italic">vazio</span>}
                        </td>
                      ))}
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => removeRow(idx)} className="text-muted-foreground hover:text-destructive transition-colors p-1" title="Remover linha">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button onClick={() => setStep("mapping")} className="text-muted-foreground hover:text-white px-4 py-2">Voltar</button>
          
          {hasErrors && <p className="text-sm text-destructive flex items-center gap-2"><AlertCircle className="w-4 h-4"/> Remova linhas com erro para poder importar.</p>}
          
          <button 
            disabled={hasErrors || parsedData.length === 0 || importMutation.isPending}
            onClick={doImport}
            className="bg-primary text-white font-semibold flex items-center gap-2 px-6 py-2 rounded-xl hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {importMutation.isPending ? <RefreshCcw className="w-4 h-4 animate-spin"/> : <Save className="w-4 h-4" />}
            Confirmar Importação
          </button>
        </div>
      </div>
    );
  };

  const renderResult = () => (
    <div className="flex flex-col items-center justify-center p-12 mt-8 border border-border rounded-2xl bg-card">
      <div className="w-20 h-20 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mb-6">
        <CheckCircle2 className="w-10 h-10 text-emerald-500" />
      </div>
      <h3 className="text-2xl font-display font-semibold text-white mb-2">Importação Concluída</h3>
      <p className="text-muted-foreground text-center mb-8 max-w-md">
        Os moradores foram processados com sucesso pelo sistema. Dados duplicados de telefone foram ignorados de forma segura.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl mb-8">
        <div className="bg-background rounded-xl p-4 border border-emerald-500/20 text-center">
          <div className="text-3xl font-bold text-emerald-500 mb-1">{results?.inserted || 0}</div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Inseridos</div>
        </div>
        <div className="bg-background rounded-xl p-4 border border-yellow-500/20 text-center">
          <div className="text-3xl font-bold text-yellow-500 mb-1">{results?.skipped || 0}</div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Ignorados (Duplicatas)</div>
        </div>
        <div className="bg-background rounded-xl p-4 border border-destructive/20 text-center">
          <div className="text-3xl font-bold text-destructive mb-1">{results?.errors?.length || 0}</div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Com Erro</div>
        </div>
      </div>

      <div className="flex gap-4">
        <button onClick={reset} className="bg-secondary text-muted-foreground hover:text-white px-6 py-2.5 font-medium rounded-xl transition-colors">
          Nova Importação
        </button>
      </div>
    </div>
  );

  return (
    <div className="p-6 md:p-8 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-display text-white flex items-center gap-3">
          <Layers className="w-7 h-7 text-primary" /> Importar Dados
        </h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Cadastre múltiplos moradores rapidamente enviando arquivos de planilha.
        </p>
      </div>

      {step === "upload" && renderUpload()}
      {step === "mapping" && renderMapping()}
      {step === "preview" && renderPreview()}
      {step === "result" && renderResult()}
    </div>
  );
}
