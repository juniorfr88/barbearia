import { Appointment, ClientProfile } from '../types';
import { getSupabase } from '../lib/supabase';
import { INITIAL_APPOINTMENTS, INITIAL_CLIENT_PROFILE } from '../data/mockData';

const STORAGE_KEY_PROFILE = 'barbearia_client_profile_v1';
const STORAGE_KEY_APPOINTMENTS = 'barbearia_appointments_v1';

export const SUPABASE_SETUP_SQL = `-- Script para executar no SQL Editor do Supabase (https://supabase.com/dashboard):

-- 1. Tabela de Perfis de Clientes
CREATE TABLE IF NOT EXISTS client_profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT,
  preferred_barber_id TEXT,
  style_preferences TEXT,
  theme_color TEXT NOT NULL,
  theme_preset_id TEXT,
  avatar_icon TEXT NOT NULL,
  avatar_bg_color TEXT,
  notifications BOOLEAN DEFAULT TRUE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- 2. Tabela de Agendamentos
CREATE TABLE IF NOT EXISTS appointments (
  id TEXT PRIMARY KEY,
  client_id TEXT NOT NULL,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  client_theme_color TEXT NOT NULL,
  client_avatar_icon TEXT NOT NULL,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  service_price NUMERIC(10, 2) NOT NULL,
  service_duration INTEGER NOT NULL,
  barber_id TEXT NOT NULL,
  barber_name TEXT NOT NULL,
  barber_avatar TEXT,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Habilitar Row Level Security (RLS) com permissão de leitura e gravação
ALTER TABLE client_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Acesso publico client_profiles" ON client_profiles;
CREATE POLICY "Acesso publico client_profiles" ON client_profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Acesso publico appointments" ON appointments;
CREATE POLICY "Acesso publico appointments" ON appointments FOR ALL USING (true) WITH CHECK (true);
`;

/**
 * Carrega o perfil do cliente (Supabase se disponível, com fallback no localStorage)
 */
export async function loadClientProfile(): Promise<ClientProfile> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const savedLocal = localStorage.getItem(STORAGE_KEY_PROFILE);
      const localProfile: ClientProfile = savedLocal
        ? JSON.parse(savedLocal)
        : INITIAL_CLIENT_PROFILE;

      const { data, error } = await supabase
        .from('client_profiles')
        .select('*')
        .eq('id', localProfile.id)
        .maybeSingle();

      if (!error && data) {
        return {
          id: data.id,
          name: data.name,
          phone: data.phone,
          email: data.email || '',
          preferredBarberId: data.preferred_barber_id || undefined,
          stylePreferences: data.style_preferences || '',
          themeColor: data.theme_color,
          themePresetId: data.theme_preset_id || 'amber',
          avatarIcon: data.avatar_icon || 'mustache',
          avatarBgColor: data.avatar_bg_color || '#262626',
          notifications: data.notifications ?? true,
        };
      }
    } catch (err) {
      console.warn('Não foi possível ler do Supabase, usando armazenamento local:', err);
    }
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY_PROFILE);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }

  return INITIAL_CLIENT_PROFILE;
}

/**
 * Salva o perfil do cliente no Supabase e no localStorage
 */
export async function saveClientProfile(profile: ClientProfile): Promise<boolean> {
  try {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
  } catch (err) {
    console.error('Erro ao salvar perfil local:', err);
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('client_profiles').upsert(
        {
          id: profile.id,
          name: profile.name,
          phone: profile.phone,
          email: profile.email,
          preferred_barber_id: profile.preferredBarberId || null,
          style_preferences: profile.stylePreferences,
          theme_color: profile.themeColor,
          theme_preset_id: profile.themePresetId,
          avatar_icon: profile.avatarIcon,
          avatar_bg_color: profile.avatarBgColor,
          notifications: profile.notifications,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );

      if (error) {
        console.error('Erro ao gravar no Supabase:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Exceção ao gravar no Supabase:', err);
      return false;
    }
  }

  return true;
}

/**
 * Carrega todos os agendamentos
 */
export async function loadAppointments(): Promise<Appointment[]> {
  const supabase = getSupabase();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('date', { ascending: true })
        .order('time', { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((row) => ({
          id: row.id,
          clientId: row.client_id,
          clientName: row.client_name,
          clientPhone: row.client_phone,
          clientThemeColor: row.client_theme_color,
          clientAvatarIcon: row.client_avatar_icon,
          serviceId: row.service_id,
          serviceName: row.service_name,
          servicePrice: Number(row.service_price),
          serviceDuration: row.service_duration,
          barberId: row.barber_id,
          barberName: row.barber_name,
          barberAvatar: row.barber_avatar || '',
          date: row.date,
          time: row.time,
          status: row.status as 'confirmed' | 'completed' | 'cancelled',
          notes: row.notes || undefined,
          createdAt: row.created_at,
        }));
      }
    } catch (err) {
      console.warn('Erro ao carregar agendamentos do Supabase:', err);
    }
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY_APPOINTMENTS);
    if (saved) return JSON.parse(saved);
  } catch {
    // ignore
  }

  return INITIAL_APPOINTMENTS;
}

/**
 * Insere um novo agendamento
 */
export async function addAppointment(newApp: Appointment): Promise<boolean> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_APPOINTMENTS);
    const list: Appointment[] = saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
    const updated = [newApp, ...list.filter((a) => a.id !== newApp.id)];
    localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(updated));
  } catch (err) {
    console.error('Erro ao salvar agendamento local:', err);
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase.from('appointments').insert({
        id: newApp.id,
        client_id: newApp.clientId,
        client_name: newApp.clientName,
        client_phone: newApp.clientPhone,
        client_theme_color: newApp.clientThemeColor,
        client_avatar_icon: newApp.clientAvatarIcon,
        service_id: newApp.serviceId,
        service_name: newApp.serviceName,
        service_price: newApp.servicePrice,
        service_duration: newApp.serviceDuration,
        barber_id: newApp.barberId,
        barber_name: newApp.barberName,
        barber_avatar: newApp.barberAvatar,
        date: newApp.date,
        time: newApp.time,
        status: newApp.status,
        notes: newApp.notes || null,
        created_at: newApp.createdAt,
      });

      if (error) {
        console.error('Erro ao inserir agendamento no Supabase:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Exceção ao inserir agendamento no Supabase:', err);
      return false;
    }
  }

  return true;
}

/**
 * Atualiza status de um agendamento
 */
export async function updateAppointmentStatus(
  id: string,
  status: 'confirmed' | 'completed' | 'cancelled'
): Promise<boolean> {
  try {
    const saved = localStorage.getItem(STORAGE_KEY_APPOINTMENTS);
    if (saved) {
      const list: Appointment[] = JSON.parse(saved);
      const updated = list.map((a) => (a.id === id ? { ...a, status } : a));
      localStorage.setItem(STORAGE_KEY_APPOINTMENTS, JSON.stringify(updated));
    }
  } catch (err) {
    console.error('Erro ao atualizar status local:', err);
  }

  const supabase = getSupabase();
  if (supabase) {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar status no Supabase:', error);
        return false;
      }
      return true;
    } catch (err) {
      console.error('Exceção ao atualizar status no Supabase:', err);
      return false;
    }
  }

  return true;
}
