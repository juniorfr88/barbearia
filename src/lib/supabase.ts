import { createClient, SupabaseClient } from '@supabase/supabase-js';

const STORAGE_KEY_SUPABASE = 'barbearia_supabase_credentials_v1';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

/**
 * Retorna as credenciais ativas: primeiro do localStorage (se o usuário preencheu na tela),
 * ou das variáveis de ambiente VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY.
 */
export function getActiveSupabaseConfig(): SupabaseConfig {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_SUPABASE);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed.url && parsed.anonKey) {
        return {
          url: parsed.url.trim(),
          anonKey: parsed.anonKey.trim(),
        };
      }
    }
  } catch {
    // ignore
  }

  const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};
  const envUrl = (metaEnv.VITE_SUPABASE_URL || '').trim();
  const envKey = (metaEnv.VITE_SUPABASE_ANON_KEY || '').trim();

  return {
    url: envUrl,
    anonKey: envKey,
  };
}

export function saveSupabaseConfig(config: SupabaseConfig) {
  try {
    localStorage.setItem(STORAGE_KEY_SUPABASE, JSON.stringify({
      url: config.url.trim(),
      anonKey: config.anonKey.trim(),
    }));
    // Reset cached instance
    supabaseInstance = null;
  } catch (err) {
    console.error('Erro ao salvar credenciais do Supabase no storage:', err);
  }
}

export function clearSupabaseConfig() {
  try {
    localStorage.removeItem(STORAGE_KEY_SUPABASE);
    supabaseInstance = null;
  } catch (err) {
    console.error('Erro ao remover credenciais do Supabase:', err);
  }
}

export function isSupabaseConfigured(): boolean {
  const { url, anonKey } = getActiveSupabaseConfig();
  return Boolean(
    url &&
    anonKey &&
    url.startsWith('https://') &&
    (url.includes('.supabase.co') || url.includes('.supabase.in') || url.includes('localhost') || url.includes('127.0.0.1'))
  );
}

let supabaseInstance: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient | null {
  const { url, anonKey } = getActiveSupabaseConfig();
  if (!url || !anonKey) {
    return null;
  }

  if (!supabaseInstance) {
    try {
      supabaseInstance = createClient(url, anonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
        },
      });
    } catch (err) {
      console.error('Erro ao inicializar cliente Supabase:', err);
      return null;
    }
  }

  return supabaseInstance;
}

/**
 * Testa a conexão com o Supabase tentando fazer uma query simples
 */
export async function testSupabaseConnection(config?: SupabaseConfig): Promise<{ success: boolean; message: string }> {
  try {
    let client: SupabaseClient | null;
    if (config) {
      client = createClient(config.url.trim(), config.anonKey.trim());
    } else {
      client = getSupabase();
    }

    if (!client) {
      return { success: false, message: 'URL ou Chave anônima não informadas.' };
    }

    // Attempt a lightweight probe (e.g. check client_profiles or a generic query)
    const { error } = await client.from('client_profiles').select('id').limit(1);

    if (error) {
      // If table doesn't exist yet (PGRST204 or 42P01), connection worked but table needs creation
      if (error.code === '42P01' || error.message.includes('relation "client_profiles" does not exist') || error.message.includes('does not exist')) {
        return {
          success: true,
          message: 'Conectado ao Supabase com sucesso! Atenção: as tabelas ainda precisam ser criadas no SQL Editor.',
        };
      }
      return {
        success: false,
        message: `Erro do Supabase: ${error.message} (${error.code || 'sem código'})`,
      };
    }

    return {
      success: true,
      message: 'Conexão estabelecida e tabelas encontradas!',
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    return {
      success: false,
      message: `Falha na conexão: ${errorMsg}`,
    };
  }
}
