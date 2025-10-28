"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CheckCircle, XCircle, AlertTriangle, RefreshCw } from "lucide-react";

export default function AMCIntegrationPage() {
  const [config, setConfig] = useState({
    amcWebhookUrl: "",
    amcApiUrl: "",
    amcApiToken: "",
    amcWebhookToken: "",
  });
  const [status, setStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    // Carregar configurações salvas
    const savedConfig = localStorage.getItem("amc-config");
    if (savedConfig) {
      setConfig(JSON.parse(savedConfig));
    }
  }, []);

  const saveConfig = () => {
    localStorage.setItem("amc-config", JSON.stringify(config));
    alert("Configurações salvas!");
  };

  const checkStatus = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/integration/amc/stock-update");
      const data = await res.json();
      setStatus(data);
    } catch (error) {
      console.error("Erro ao verificar status:", error);
    } finally {
      setLoading(false);
    }
  };

  const syncAllProducts = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/integration/amc/sync-all", {
        method: "POST",
      });
      const data = await res.json();
      alert(`Sincronização concluída: ${data.message}`);
    } catch (error) {
      console.error("Erro na sincronização:", error);
      alert("Erro na sincronização");
    } finally {
      setSyncing(false);
    }
  };

  const testConnection = async () => {
    try {
      const res = await fetch("/api/integration/amc/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      alert(data.message);
    } catch (error) {
      console.error("Erro no teste:", error);
      alert("Erro no teste de conexão");
    }
  };

  return (
    <div className="py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Integração AMCSistema
        </h1>
        <p className="text-gray-600">
          Configure a sincronização de estoque com o sistema AMC
        </p>
      </div>

      {/* Status */}
      {status && (
        <div className="bg-white rounded-2xl border p-4">
          <h3 className="font-semibold text-gray-900 mb-3">
            Status da Integração
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {status.totalProducts}
              </div>
              <div className="text-sm text-gray-500">Total Produtos</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">
                {status.lowStockProducts}
              </div>
              <div className="text-sm text-gray-500">Estoque Baixo</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {status.outOfStockProducts}
              </div>
              <div className="text-sm text-gray-500">Sem Estoque</div>
            </div>
            <div className="text-center">
              <div className="text-sm font-medium text-green-600 capitalize">
                {status.status}
              </div>
              <div className="text-sm text-gray-500">Status</div>
            </div>
          </div>
        </div>
      )}

      {/* Configurações */}
      <div className="bg-white rounded-2xl border p-6">
        <h3 className="font-semibold text-gray-900 mb-4">
          Configurações da API
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL do Webhook AMC
            </label>
            <Input
              value={config.amcWebhookUrl}
              onChange={(e) =>
                setConfig({ ...config, amcWebhookUrl: e.target.value })
              }
              placeholder="https://api.amc.com/webhook/venda-realizada"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL da API AMC
            </label>
            <Input
              value={config.amcApiUrl}
              onChange={(e) =>
                setConfig({ ...config, amcApiUrl: e.target.value })
              }
              placeholder="https://api.amc.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token da API AMC
            </label>
            <Input
              type="password"
              value={config.amcApiToken}
              onChange={(e) =>
                setConfig({ ...config, amcApiToken: e.target.value })
              }
              placeholder="Bearer token ou API key"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Token do Webhook AMC
            </label>
            <Input
              type="password"
              value={config.amcWebhookToken}
              onChange={(e) =>
                setConfig({ ...config, amcWebhookToken: e.target.value })
              }
              placeholder="Token para validar webhooks"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <Button
            onClick={saveConfig}
            className="bg-[#F8B075] hover:bg-[#e69a66]"
          >
            Salvar Configurações
          </Button>
          <Button onClick={testConnection} variant="outline">
            Testar Conexão
          </Button>
        </div>
      </div>

      {/* Ações */}
      <div className="bg-white rounded-2xl border p-6">
        <h3 className="font-semibold text-gray-900 mb-4">Ações</h3>

        <div className="flex flex-wrap gap-3">
          <Button
            onClick={checkStatus}
            disabled={loading}
            variant="outline"
            className="flex items-center gap-2"
          >
            {loading ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <CheckCircle size={16} />
            )}
            Verificar Status
          </Button>

          <Button
            onClick={syncAllProducts}
            disabled={syncing}
            variant="outline"
            className="flex items-center gap-2"
          >
            {syncing ? (
              <RefreshCw size={16} className="animate-spin" />
            ) : (
              <RefreshCw size={16} />
            )}
            Sincronizar Todos os Produtos
          </Button>
        </div>
      </div>

      {/* Informações */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-blue-600 mt-0.5" />
          <div>
            <h3 className="font-semibold text-blue-900">
              Informações Importantes
            </h3>
            <ul className="text-sm text-blue-700 mt-2 space-y-1">
              <li>• Configure as URLs e tokens fornecidos pela AMCSistema</li>
              <li>
                • O webhook receberá atualizações de estoque automaticamente
              </li>
              <li>• As vendas serão enviadas automaticamente para a AMC</li>
              <li>• Teste a conexão antes de ativar a sincronização</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
