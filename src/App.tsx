/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { ActiveTab, Appointment, ClientProfile } from './types';
import {
  INITIAL_CLIENT_PROFILE,
  INITIAL_APPOINTMENTS,
  COLOR_PRESETS,
} from './data/mockData';
import { Navbar } from './components/Navbar';
import { ShopBanner } from './components/ShopBanner';
import { BookingWizard } from './components/BookingWizard';
import { AppointmentsList } from './components/AppointmentsList';
import { ProfileEditor } from './components/ProfileEditor';
import { ShopAgendaView } from './components/ShopAgendaView';
import { getRgba } from './utils/theme';
import { Palette } from 'lucide-react';
import {
  loadClientProfile,
  saveClientProfile as dbSaveClientProfile,
  loadAppointments,
  addAppointment as dbAddAppointment,
  updateAppointmentStatus as dbUpdateAppointmentStatus,
} from './services/dbService';
import { isSupabaseConfigured } from './lib/supabase';

export default function App() {
  const [clientProfile, setClientProfile] = useState<ClientProfile>(INITIAL_CLIENT_PROFILE);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [activeTab, setActiveTab] = useState<ActiveTab>('book');
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  // Load data from Supabase (or fallback)
  const refreshData = useCallback(async () => {
    try {
      const [profileData, appointmentsData] = await Promise.all([
        loadClientProfile(),
        loadAppointments(),
      ]);
      setClientProfile(profileData);
      setAppointments(appointmentsData);
    } catch (err) {
      console.error('Erro ao carregar dados:', err);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const showToast = (message: string) => {
    setNotificationToast(message);
    setTimeout(() => {
      setNotificationToast(null);
    }, 4000);
  };

  const handleSaveProfile = async (updatedProfile: ClientProfile) => {
    setClientProfile(updatedProfile);

    // Save to Supabase and local storage
    await dbSaveClientProfile(updatedProfile);

    // Sync theme & name with user's existing confirmed appointments
    setAppointments((prev) =>
      prev.map((app) => {
        if (app.clientId === updatedProfile.id || app.clientPhone === updatedProfile.phone) {
          return {
            ...app,
            clientName: updatedProfile.name,
            clientPhone: updatedProfile.phone,
            clientThemeColor: updatedProfile.themeColor,
            clientAvatarIcon: updatedProfile.avatarIcon,
          };
        }
        return app;
      })
    );

    const storageType = isSupabaseConfigured() ? 'no Supabase' : 'localmente';
    showToast(`Perfil atualizado com sucesso (${storageType})!`);
  };

  const handleConfirmBooking = async (newAppointment: Appointment) => {
    setAppointments((prev) => [newAppointment, ...prev]);
    await dbAddAppointment(newAppointment);

    const storageType = isSupabaseConfigured() ? 'no Supabase' : 'localmente';
    showToast(`Horário reservado com sucesso (${storageType})!`);
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    setAppointments((prev) =>
      prev.map((app) =>
        app.id === appointmentId ? { ...app, status: 'cancelled' } : app
      )
    );
    await dbUpdateAppointmentStatus(appointmentId, 'cancelled');
    showToast('Agendamento cancelado.');
  };

  // Switch demo client helper
  const handleSwitchDemoClient = (presetIndex: number) => {
    const preset = COLOR_PRESETS[presetIndex];
    if (!preset) return;

    const demos = [
      {
        id: 'client-rodrigo',
        name: 'Rodrigo Silva',
        phone: '(11) 98765-4321',
        email: 'rodrigo.silva@exemplo.com',
        preferredBarberId: 'barber-1',
        stylePreferences: 'Fade médio navalhado nas laterais, topo texturizado e barba alinhada.',
        themeColor: COLOR_PRESETS[0].hex,
        themePresetId: COLOR_PRESETS[0].id,
        avatarIcon: 'mustache',
        avatarBgColor: '#262626',
        notifications: true,
      },
      {
        id: 'client-gabriel',
        name: 'Gabriel Medeiros',
        phone: '(11) 97123-8899',
        email: 'gabriel.medeiros@exemplo.com',
        preferredBarberId: 'barber-2',
        stylePreferences: 'Low fade moderno, risquinho na sobrancelha e barba por fazer.',
        themeColor: COLOR_PRESETS[1].hex,
        themePresetId: COLOR_PRESETS[1].id,
        avatarIcon: 'flame',
        avatarBgColor: '#1e293b',
        notifications: true,
      },
      {
        id: 'client-marcos',
        name: 'Marcos Vinicius',
        phone: '(11) 99441-2233',
        email: 'marcos.vinicius@exemplo.com',
        preferredBarberId: 'barber-3',
        stylePreferences: 'Corte clássico na tesoura, barba longa lenhador com óleo hidratante.',
        themeColor: COLOR_PRESETS[2].hex,
        themePresetId: COLOR_PRESETS[2].id,
        avatarIcon: 'crown',
        avatarBgColor: '#064e3b',
        notifications: true,
      },
    ];

    const chosen = demos[presetIndex % demos.length];
    setClientProfile(chosen);
    showToast(`Alternado para perfil de teste: ${chosen.name} (${chosen.themeColor})`);
  };

  const activeAppointmentsCount = appointments.filter(
    (a) =>
      (a.clientId === clientProfile.id || a.clientPhone === clientProfile.phone) &&
      a.status === 'confirmed'
  ).length;

  const themeColor = clientProfile.themeColor;

  return (
    <div
      className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col font-sans transition-colors duration-300"
      style={{
        // Define root css variables for dynamic client theme styling
        ['--client-primary' as string]: themeColor,
        ['--client-primary-rgb' as string]: getRgba(themeColor, 1),
      }}
    >
      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div
            className="px-4 py-3 rounded-2xl bg-neutral-900 border text-sm font-semibold text-white shadow-2xl flex items-center gap-2"
            style={{
              borderColor: themeColor,
              boxShadow: `0 8px 30px ${getRgba(themeColor, 0.3)}`,
            }}
          >
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: themeColor }}
            />
            {notificationToast}
          </div>
        </div>
      )}

      {/* Top Barbershop Info Banner */}
      <ShopBanner themeColor={themeColor} />

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        clientProfile={clientProfile}
        activeAppointmentsCount={activeAppointmentsCount}
      />

      {/* Demo Switcher Quick Bar */}
      <div className="bg-neutral-900/40 border-b border-neutral-800/60 py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between text-xs text-neutral-400 gap-2">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-neutral-300 font-medium">
              <Palette className="w-3.5 h-3.5" style={{ color: themeColor }} />
              Cor ativa:
            </span>
            <div className="flex items-center gap-1.5">
              <span
                className="w-3 h-3 rounded-full shadow-sm"
                style={{ backgroundColor: themeColor }}
              />
              <span className="font-mono text-white uppercase text-[11px]">
                {themeColor}
              </span>
              <button
                onClick={() => setActiveTab('profile')}
                className="text-[11px] underline ml-1 hover:text-white cursor-pointer"
                style={{ color: themeColor }}
              >
                Mudar
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px]">
            <span className="text-neutral-500">Testar perfis:</span>
            <button
              onClick={() => handleSwitchDemoClient(0)}
              className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-amber-300 border border-amber-500/30 cursor-pointer"
            >
              Rodrigo (Ouro)
            </button>
            <button
              onClick={() => handleSwitchDemoClient(1)}
              className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-blue-300 border border-blue-500/30 cursor-pointer"
            >
              Gabriel (Azul)
            </button>
            <button
              onClick={() => handleSwitchDemoClient(2)}
              className="px-2 py-0.5 rounded bg-neutral-800 hover:bg-neutral-700 text-emerald-300 border border-emerald-500/30 cursor-pointer"
            >
              Marcos (Verde)
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
        {activeTab === 'book' && (
          <BookingWizard
            clientProfile={clientProfile}
            existingAppointments={appointments}
            onConfirmBooking={handleConfirmBooking}
            onViewAppointments={() => setActiveTab('my-appointments')}
            onCustomizeProfile={() => setActiveTab('profile')}
          />
        )}

        {activeTab === 'my-appointments' && (
          <AppointmentsList
            clientProfile={clientProfile}
            appointments={appointments}
            onCancelAppointment={handleCancelAppointment}
            onNewBooking={() => setActiveTab('book')}
            onCustomizeProfile={() => setActiveTab('profile')}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileEditor
            profile={clientProfile}
            onSaveProfile={handleSaveProfile}
            onGoToBooking={() => setActiveTab('book')}
          />
        )}

        {activeTab === 'shop-agenda' && (
          <ShopAgendaView
            appointments={appointments}
            currentClientProfile={clientProfile}
            onBookClick={() => setActiveTab('book')}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-800/80 bg-neutral-950 py-8 text-xs text-neutral-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div
              className="w-5 h-5 rounded-lg flex items-center justify-center text-neutral-950 text-[10px] font-bold"
              style={{ backgroundColor: themeColor }}
            >
              ✂
            </div>
            <span className="font-semibold text-neutral-300">
              Barbearia Club • Tradição & Navalha
            </span>
          </div>

          <div className="flex items-center gap-4 text-neutral-400">
            <span>Perfil: <strong>{clientProfile.name}</strong></span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              Cor:
              <span
                className="w-2.5 h-2.5 rounded-full inline-block"
                style={{ backgroundColor: themeColor }}
              />
              <span className="font-mono text-neutral-300 uppercase">{themeColor}</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
