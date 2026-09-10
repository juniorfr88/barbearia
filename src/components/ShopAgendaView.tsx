import React, { useState } from 'react';
import { Appointment, ClientProfile } from '../types';
import { BARBERS } from '../data/mockData';
import { formatCurrency, formatDateBR, formatDateFullBR, getRgba } from '../utils/theme';
import { ClientAvatar } from './ClientAvatar';
import { Calendar, Clock, User, Scissors, Filter, Sparkles } from 'lucide-react';

interface ShopAgendaViewProps {
  appointments: Appointment[];
  currentClientProfile: ClientProfile;
  onBookClick: () => void;
}

export const ShopAgendaView: React.FC<ShopAgendaViewProps> = ({
  appointments,
  currentClientProfile,
  onBookClick,
}) => {
  const [selectedBarberId, setSelectedBarberId] = useState<string>('all');
  
  // Unique dates from appointments
  const datesWithAppointments: string[] = Array.from(new Set<string>(appointments.map((a) => a.date))).sort();
  const [selectedDate, setSelectedDate] = useState<string>(
    datesWithAppointments[0] || new Date().toISOString().split('T')[0]
  );

  const filteredAppointments = appointments
    .filter((app) => {
      const matchBarber = selectedBarberId === 'all' || app.barberId === selectedBarberId;
      const matchDate = app.date === selectedDate;
      return matchBarber && matchDate && app.status !== 'cancelled';
    })
    .sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 animate-fadeIn">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-2 bg-neutral-900 border border-neutral-800 text-neutral-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Visão da Barbearia & Clientes VIP
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Quadro de Agendamentos da Barbearia
          </h2>
          <p className="text-sm text-neutral-400 mt-1 max-w-xl">
            Veja como cada cliente aparece na bancada dos barbeiros com sua respectiva cor e emblema personalizado de perfil.
          </p>
        </div>

        <button
          onClick={onBookClick}
          className="px-5 py-3 rounded-xl font-bold text-neutral-950 flex items-center justify-center gap-2 shadow-lg transition-all hover:brightness-110 active:scale-[0.99] cursor-pointer"
          style={{
            backgroundColor: currentClientProfile.themeColor,
            boxShadow: `0 6px 20px ${getRgba(currentClientProfile.themeColor, 0.35)}`,
          }}
        >
          <Scissors className="w-4 h-4 stroke-[2.5]" />
          Agendar Meu Horário
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-neutral-900/70 border border-neutral-800/90 rounded-2xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        {/* Date Selector */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          <Calendar className="w-4 h-4 text-neutral-400 flex-shrink-0" />
          <span className="text-xs text-neutral-400 mr-1 flex-shrink-0">Data:</span>
          {datesWithAppointments.map((dateStr) => {
            const isSelected = selectedDate === dateStr;
            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected
                    ? 'bg-white text-neutral-950 shadow-md'
                    : 'bg-neutral-950 border border-neutral-800 text-neutral-300 hover:border-neutral-700'
                }`}
              >
                {formatDateBR(dateStr)}
              </button>
            );
          })}
        </div>

        {/* Barber filter */}
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-neutral-400 flex-shrink-0" />
          <select
            value={selectedBarberId}
            onChange={(e) => setSelectedBarberId(e.target.value)}
            className="bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-xs text-white focus:outline-none focus:border-neutral-600"
          >
            <option value="all">Todos os Barbeiros</option>
            {BARBERS.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.nickname})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Timeline Schedule */}
      <div className="space-y-3">
        <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center justify-between">
          <span>Horários do Dia: {formatDateFullBR(selectedDate)}</span>
          <span>{filteredAppointments.length} agendamento(s)</span>
        </div>

        {filteredAppointments.length === 0 ? (
          <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-8 text-center text-sm text-neutral-400">
            Nenhum agendamento ativo para os filtros selecionados nesta data.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            {filteredAppointments.map((app) => {
              const isCurrentUser =
                app.clientId === currentClientProfile.id ||
                app.clientPhone === currentClientProfile.phone;

              return (
                <div
                  key={app.id}
                  className={`relative overflow-hidden rounded-2xl border p-4 sm:p-5 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isCurrentUser
                      ? 'bg-neutral-900/90 border-white/30 shadow-xl ring-1'
                      : 'bg-neutral-900/50 border-neutral-800/80 hover:border-neutral-700'
                  }`}
                  style={
                    isCurrentUser
                      ? ({ '--tw-ring-color': app.clientThemeColor } as React.CSSProperties)
                      : {}
                  }
                >
                  {/* Left accent bar matching client's custom color */}
                  <div
                    className="absolute left-0 top-0 bottom-0 w-2"
                    style={{ backgroundColor: app.clientThemeColor || '#f59e0b' }}
                  />

                  <div className="flex items-center gap-4 pl-2">
                    {/* Time badge */}
                    <div className="flex flex-col items-center justify-center bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 min-w-[64px]">
                      <Clock className="w-3.5 h-3.5 text-neutral-400 mb-0.5" />
                      <span className="text-sm font-extrabold text-white">
                        {app.time}
                      </span>
                    </div>

                    {/* Client Avatar with their personalized color */}
                    <ClientAvatar
                      iconId={app.clientAvatarIcon || 'user'}
                      themeColor={app.clientThemeColor || '#f59e0b'}
                      size="md"
                      showGlow={isCurrentUser}
                    />

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-white text-base">
                          {app.clientName}
                        </h4>
                        {isCurrentUser && (
                          <span
                            className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full"
                            style={{
                              backgroundColor: getRgba(app.clientThemeColor, 0.2),
                              color: app.clientThemeColor,
                            }}
                          >
                            Você
                          </span>
                        )}
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: app.clientThemeColor }}
                          title={`Cor personalizada do cliente: ${app.clientThemeColor}`}
                        />
                      </div>

                      <div className="text-xs text-neutral-400 mt-0.5 flex flex-wrap items-center gap-2">
                        <span>{app.serviceName}</span>
                        <span>•</span>
                        <span>{app.serviceDuration} min</span>
                        {app.notes && (
                          <>
                            <span>•</span>
                            <span className="text-neutral-300 italic">
                              "{app.notes}"
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Right side: Barber tag & price */}
                  <div className="flex items-center justify-between sm:justify-end gap-5 pl-2 sm:pl-0 border-t sm:border-t-0 border-neutral-800/60 pt-2 sm:pt-0">
                    <div className="flex items-center gap-2">
                      <img
                        src={app.barberAvatar}
                        alt={app.barberName}
                        className="w-7 h-7 rounded-full object-cover border border-neutral-700"
                      />
                      <div className="text-right">
                        <div className="text-[10px] text-neutral-400">Bancada</div>
                        <div className="text-xs font-semibold text-white">
                          {app.barberName}
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-sm font-extrabold text-white">
                        {formatCurrency(app.servicePrice)}
                      </div>
                      <span
                        className="text-[10px] font-mono uppercase"
                        style={{ color: app.clientThemeColor }}
                      >
                        Cor: {app.clientThemeColor}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
