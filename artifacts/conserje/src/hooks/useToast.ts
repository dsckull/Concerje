import { useCallback } from "react";
import { useToast as useUIToast } from "./use-toast";

export function useToast() {
  const { toast } = useUIToast();

  const showSuccess = useCallback((message: string, description?: string) => {
    toast({
      title: "✅ Sucesso",
      description: message,
      variant: "default",
    });
  }, [toast]);

  const showError = useCallback((message: string, description?: string) => {
    toast({
      title: "❌ Erro",
      description: message,
      variant: "destructive",
    });
  }, [toast]);

  const showInfo = useCallback((message: string, description?: string) => {
    toast({
      title: "ℹ️ Informação",
      description: message,
      variant: "default",
    });
  }, [toast]);

  return { showSuccess, showError, showInfo };
}
