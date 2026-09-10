import React, { useState, useEffect } from 'react';
import {
  getActiveSupabaseConfig,
  saveSupabaseConfig,
  clearSupabaseConfig,
  isSupabaseConfigured,
  testSupabaseConnection,
} from '../lib/supabase';
import { SUPABASE_SETUP_SQL } from '../services/dbService';
import {
  Database,
  Check,
  Copy,
  ExternalLink,
  X,
  Key,
  Globe,
  Loader2,
  Trash2,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
} from 'lucide-react';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  themeColor: string;
  onCredentialsUpdated: () => void;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  themeColor,
  onCredentialsUpdated,
}) => {
  const [url, setUrl] = useState('');
  const [anonKey, setAnonKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);
  const [activeTab, setActiveTab] = useState<'credentials' | 'sql'>('credentials');

  useEffect(() => {
    if (isOpen) {
      const config = getActiveSupabaseConfig();
      setUrl(config.url);
      setAnonKey(config.anonKey);
      setTestResult(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SETUP_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSave = async () => {
    setIsTesting(true);
    setTestResult(null);

    const cleanUrl = url.trim();
    const cleanKey = anonKey.trim();

    saveSupabaseConfig({
      url: cleanUrl,
      anonKey: cleanKey,
    });

    const result = await testSupabaseConnection({
      url: cleanUrl,
      anonKey: cleanKey,
    });

    setIsTesting(false);
    setTestResult(result);
    onCredentialsUpdated();
  };

  const handleClear = () => {
    clearSupabaseConfig();
    setUrl('');
    setAnonKey('');
    setTestResult({
      success: true,
      message: 'Credenciais removidas. O aplicativo está operando em modo local.',
    });
    onCredentialsUpdated();
  };

  const configured = isSupabaseConfigured();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-neutral-900 border border-neutral-800 rounded-3xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-xl text-neutral-400 hover:text-white bg-neutral-800/80 hover:bg-neutral-800 cursor-pointer transition-colors"
          title="Fechar"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3">
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center text-emerald-400 border border-emerald-500/30"
            style={{ backgroundColor: 'rgba(16, 185, 129, 0.15)' }}
          >
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xl font-bold text-white">
                Conectar Banco de Dados Supabase
              </h3>
              {configured ? (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Conectado
                </span>
              ) : (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  Modo Local Ativo
                </span>
              )}
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">
              Insira as chaves do seu projeto ou execute o script SQL para criar as tabelas.
            </p>
          </div>
        </div>

        {/* Tab switch */}
        <div className="flex border-b border-neutral-800">
          <button
            onClick={() => setActiveTab('credentials')}
            className={`pb-2.5 px-4 text-xs font-semibold cursor-pointer border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'credentials'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            1. Inserir Chaves do Projeto
          </button>
          <button
            onClick={() => setActiveTab('sql')}
            className={`pb-2.5 px-4 text-xs font-semibold cursor-pointer border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'sql'
                ? 'border-emerald-500 text-white'
                : 'border-transparent text-neutral-400 hover:text-neutral-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            2. Script SQL das Tabelas
          </button>
        </div>

        {/* Tab 1: Credentials Input */}
        {activeTab === 'credentials' && (
          <div className="space-y-4">
            <div className="bg-neutral-950/70 border border-neutral-800/80 rounded-2xl p-4 text-xs text-neutral-300 space-y-1">
              <p className="font-semibold text-white flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-emerald-400" />
                Onde encontrar no Supabase?
              </p>
              <p className="text-neutral-400 leading-relaxed">
                No painel do seu projeto no{' '}
                <a
                  href="https://supabase.com/dashboard"
                  target="_blank"
                  rel="noreferrer"
                  className="text-emerald-400 underline inline-flex items-center gap-0.5"
                >
                  supabase.com <ExternalLink className="w-3 h-3" />
                </a>
                , acesse <strong>Project Settings &gt; API</strong> e copie a <strong>Project URL</strong> e a <strong>anon public key</strong>.
              </p>
            </div>

            {/* Input URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-neutral-400" />
                Project URL (VITE_SUPABASE_URL)
              </label>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://abcdefghijklmn.supabase.co"
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono"
              />
            </div>

            {/* Input Anon Key */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-neutral-400" />
                Anon Public Key (VITE_SUPABASE_ANON_KEY)
              </label>
              <textarea
                value={anonKey}
                onChange={(e) => setAnonKey(e.target.value)}
                placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                rows={3}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-600 focus:outline-none focus:border-emerald-500 transition-colors font-mono resize-none"
              />
              <p className="text-[11px] text-neutral-500">
                Use a chave <strong>anon (public)</strong>. Nunca use a chave service_role no navegador.
              </p>
            </div>

            {/* Test result message */}
            {testResult && (
              <div
                className={`p-3.5 rounded-xl text-xs flex items-start gap-2.5 border ${
                  testResult.success
                    ? 'bg-emerald-950/40 border-emerald-600/40 text-emerald-200'
                    : 'bg-rose-950/40 border-rose-600/40 text-rose-200'
                }`}
              >
                {testResult.success ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <p className="font-semibold">
                    {testResult.success ? 'Conexão validada!' : 'Aviso na conexão'}
                  </p>
                  <p className="mt-0.5 leading-relaxed">{testResult.message}</p>
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              {configured && (
                <button
                  onClick={handleClear}
                  type="button"
                  className="px-3.5 py-2 rounded-xl text-neutral-400 hover:text-rose-400 hover:bg-neutral-800 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Desconectar / Limpar
                </button>
              )}
              <div className="flex items-center gap-2 ml-auto">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-medium transition-colors cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={isTesting || !url.trim() || !anonKey.trim()}
                  className="px-5 py-2 rounded-xl text-neutral-950 text-xs font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-lg cursor-pointer hover:brightness-110"
                  style={{ backgroundColor: themeColor }}
                >
                  {isTesting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Testando Conexão...
                    </>
                  ) : (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      Salvar e Conectar
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: SQL Editor script */}
        {activeTab === 'sql' && (
          <div className="space-y-4">
            <div className="bg-neutral-950/70 border border-neutral-800 rounded-2xl p-4 text-xs text-neutral-300 space-y-2">
              <div className="flex items-center gap-2 text-white font-semibold">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Como rodar o script no Supabase:
              </div>
              <ol className="list-decimal list-inside space-y-1.5 text-neutral-400">
                <li>
                  Acesse seu painel no Supabase e clique em <strong>SQL Editor</strong> no menu lateral.
                </li>
                <li>Clique em <strong>+ New Query</strong>.</li>
                <li>Cole o código abaixo e clique no botão verde <strong>Run</strong>.</li>
              </ol>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-neutral-300">
                  Estrutura de tabelas (SQL):
                </span>
                <button
                  onClick={handleCopySql}
                  className="px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-200 hover:text-white text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">SQL Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar Script SQL</span>
                    </>
                  )}
                </button>
              </div>

              <pre className="bg-neutral-950 border border-neutral-800 p-3.5 rounded-xl text-[11px] font-mono text-neutral-300 overflow-x-auto max-h-56 scrollbar-thin leading-relaxed">
                {SUPABASE_SETUP_SQL}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
