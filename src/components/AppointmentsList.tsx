import React, { useState } from 'react';
import { Appointment, ClientProfile } from '../types';
import { formatCurrency, formatDateBR, formatDateFullBR, getRgba } from '../utils/theme';
import { ClientAvatar } from './ClientAvatar';
import {
  Calendar,
  Clock,
  Scissors,
  Trash2,
  Share2,
  CheckCircle2,
  AlertCircle,
  Plus,
  MessageCircle,
  Sparkles,
} from 'lucide-react';

interface AppointmentsListProps {
  clientProfile: ClientProfile;
  appointments: Appointment[];
  onCancelAppointment: (id: string) => void;
  onNewBooking: () => void;
  onCustomizeProfile: () => void;
}

export const AppointmentsList: React.FC<AppointmentsListProps> = ({
  clientProfile,
  appointments,
  onCancelAppointment,
  onNewBooking,
  onCustomizeProfile,
}) => {
  const [filter, setFilter] = useState<'active' | 'history'>('active');
  const [confirmCancelId, setConfirmCancelId] = useState<string | null>(null);

  const themeColor = clientProfile.themeColor;

  // Filter appointments for this client
  const clientAppointments = appointments.filter(
    (app) => app.clientId === clientProfile.id || app.clientPhone === clientProfile.phone
  );

  const activeAppointments = clientAppointments.filter((app) => app.status === 'confirmed');
  const pastAppointments = clientAppointments.filter((app) => app.status !== 'confirmed');

  const displayedList = filter === 'active' ? activeAppointments : pastAppointments;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 animate-fadeIn">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-neutral-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-2"
            style={{
              backgroundColor: getRgba(themeColor, 0.15),
              color: themeColor,
              borderColor: getRgba(themeColor, 0.3),
              borderWidth: '1px',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Minha Agenda de Cortes
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Meus Agendamentos
          </h2>
          <p className="text-sm text-neutral-400 mt-1">
            Acompanhe suas visitas agendadas, gerencie horários e receba avisos no WhatsApp.
          </p>
        </div>

        <button
          onClick={onNewBooking}
          className="px-5 py-3 rounded-xl font-bold text-neutral-950 flex items-center justify-center gap-2 shadow-lg transition-all hover:brightness-110 active:scale-[0.99] cursor-pointer"
          style={{
            backgroundColor: themeColor,
            boxShadow: `0 6px 20px ${getRgba(themeColor, 0.35)}`,
          }}
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          Novo Agendamento
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-800 pb-2">
        <button
          onClick={() => setFilter('active')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            filter === 'active'
              ? 'text-white bg-neutral-900 border border-neutral-700'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
          style={filter === 'active' ? { borderColor: themeColor } : {}}
        >
          <span>Próximos Agendamentos</span>
          <span
            className="px-2 py-0.5 rounded-full text-[10px]"
            style={{
              backgroundColor: filter === 'active' ? getRgba(themeColor, 0.2) : '#262626',
              color: filter === 'active' ? themeColor : '#a3a3a3',
            }}
          >
            {activeAppointments.length}
          </span>
        </button>

        <button
          onClick={() => setFilter('history')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
            filter === 'history'
              ? 'text-white bg-neutral-900 border border-neutral-700'
              : 'text-neutral-400 hover:text-neutral-200'
          }`}
          style={filter === 'history' ? { borderColor: themeColor } : {}}
        >
          <span>Histórico & Cancelados</span>
          <span className="px-2 py-0.5 rounded-full text-[10px] bg-neutral-800 text-neutral-400">
            {pastAppointments.length}
          </span>
        </button>
      </div>

      {/* Empty State */}
      {displayedList.length === 0 && (
        <div className="bg-neutral-900/40 border border-neutral-800 rounded-3xl p-10 text-center space-y-4">
          <div
            className="w-16 h-16 rounded-2xl mx-auto flex items-center justify-center"
            style={{
              backgroundColor: getRgba(themeColor, 0.1),
              color: themeColor,
            }}
          >
            <Calendar className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {filter === 'active'
                ? 'Nenhum agendamento futuro encontrado'
                : 'Nenhum corte anterior registrado'}
            </h3>
            <p className="text-xs text-neutral-400 mt-1 max-w-sm mx-auto">
              {filter === 'active'
                ? 'Você ainda não reservou um corte para os próximos dias. Reserve agora mesmo com seu barbeiro preferido!'
                : 'Seus cortes finalizados ou cancelados aparecerão arquivados aqui.'}
            </p>
          </div>
          {filter === 'active' && (
            <button
              onClick={onNewBooking}
              className="px-5 py-2.5 rounded-xl font-bold text-neutral-950 text-xs shadow-md hover:brightness-110 transition-all cursor-pointer"
              style={{ backgroundColor: themeColor }}
            >
              Agendar Meu Primeiro Horário
            </button>
          )}
        </div>
      )}

      {/* Appointments List */}
      <div className="space-y-4">
        {displayedList.map((app) => {
          const isCancelled = app.status === 'cancelled';
          const isConfirmingCancel = confirmCancelId === app.id;

          return (
            <div
              key={app.id}
              className={`relative overflow-hidden rounded-2xl border transition-all ${
                isCancelled
                  ? 'bg-neutral-900/30 border-neutral-800/60 opacity-60'
                  : 'bg-neutral-900/70 border-neutral-800 hover:border-neutral-700 shadow-lg'
              }`}
            >
              {/* Left personalized color accent bar */}
              <div
                className="absolute top-0 bottom-0 left-0 w-1.5"
                style={{ backgroundColor: app.clientThemeColor || themeColor }}
              />

              <div className="p-5 sm:p-6 pl-6 sm:pl-7 flex flex-col md:flex-row md:items-center justify-between gap-5">
                {/* Info Block */}
                <div className="space-y-2.5">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                      style={{
                        backgroundColor: isCancelled
                          ? 'rgba(239, 68, 68, 0.15)'
                          : getRgba(themeColor, 0.15),
                        color: isCancelled ? '#ef4444' : themeColor,
                        border: `1px solid ${isCancelled ? '#ef444433' : getRgba(themeColor, 0.3)}`,
                      }}
                    >
                      {isCancelled ? 'Cancelado' : 'Confirmado'}
                    </span>

                    <span className="text-xs text-neutral-400 font-mono">
                      #{app.id.slice(-6).toUpperCase()}
                    </span>

                    <span className="text-xs text-neutral-500">•</span>

                    <span className="text-xs text-neutral-400">
                      {app.serviceDuration} min de sessão
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white tracking-tight">
                    {app.serviceName}
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-300">
                    <div className="flex items-center gap-1.5 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                      <span>{formatDateFullBR(app.date)}</span>
                    </div>

                    <div className="flex items-center gap-1.5 font-bold text-white">
                      <Clock className="w-3.5 h-3.5" style={{ color: themeColor }} />
                      <span>{app.time}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <img
                        src={app.barberAvatar}
                        alt={app.barberName}
                        className="w-5 h-5 rounded-full object-cover border border-neutral-700"
                      />
                      <span>Barbeiro: <strong>{app.barberName}</strong></span>
                    </div>
                  </div>

                  {app.notes && (
                    <div className="text-xs text-neutral-400 italic bg-neutral-950/60 p-2.5 rounded-xl border border-neutral-800/80">
                      "Observação: {app.notes}"
                    </div>
                  )}
                </div>

                {/* Right Actions & Price */}
                <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end justify-between gap-3 border-t md:border-t-0 border-neutral-800 pt-3 md:pt-0">
                  <div className="text-right">
                    <div className="text-xl font-extrabold text-white">
                      {formatCurrency(app.servicePrice)}
                    </div>
                    <div className="text-[11px] text-neutral-400">
                      Pagamento no local
                    </div>
                  </div>

                  {!isCancelled && (
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* WhatsApp share */}
                      <a
                        href={`https://wa.me/?text=${encodeURIComponent(
                          `Olá Barbearia Club! Gostaria de confirmar meu horário agendado de ${app.serviceName} para o dia ${app.date} às ${app.time} com ${app.barberName}. Meu nome é ${clientProfile.name}.`
                        )}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-emerald-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
                        title="Enviar confirmação no WhatsApp"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span className="hidden sm:inline">WhatsApp</span>
                      </a>

                      {/* Cancel Dialog / Button */}
                      {isConfirmingCancel ? (
                        <div className="flex items-center gap-1.5 bg-red-950/40 border border-red-800/60 p-1.5 rounded-xl">
                          <span className="text-[11px] text-red-300 px-1">Desmarcar?</span>
                          <button
                            onClick={() => {
                              onCancelAppointment(app.id);
                              setConfirmCancelId(null);
                            }}
                            className="px-2 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer"
                          >
                            Sim
                          </button>
                          <button
                            onClick={() => setConfirmCancelId(null)}
                            className="px-2 py-1 bg-neutral-800 text-neutral-300 hover:text-white rounded-lg text-xs transition-colors cursor-pointer"
                          >
                            Não
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setConfirmCancelId(app.id)}
                          className="p-2.5 rounded-xl bg-neutral-800/80 hover:bg-red-900/30 hover:border-red-800/50 border border-neutral-700 text-neutral-400 hover:text-red-400 text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                          title="Cancelar agendamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Cancelar</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
