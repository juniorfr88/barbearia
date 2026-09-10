import React, { useState, useMemo } from 'react';
import { ClientProfile, Appointment, BarberService, BarberProfessional, ServiceCategory } from '../types';
import { BARBER_SERVICES, BARBERS } from '../data/mockData';
import { formatCurrency, formatDateBR, formatDateFullBR, getRgba } from '../utils/theme';
import { ClientAvatar } from './ClientAvatar';
import {
  Scissors,
  User,
  Calendar,
  Clock,
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Star,
  Info,
  Send,
  MessageCircle,
  Sparkles,
} from 'lucide-react';

interface BookingWizardProps {
  clientProfile: ClientProfile;
  existingAppointments: Appointment[];
  onConfirmBooking: (appointment: Appointment) => void;
  onViewAppointments: () => void;
  onCustomizeProfile: () => void;
}

export const BookingWizard: React.FC<BookingWizardProps> = ({
  clientProfile,
  existingAppointments,
  onConfirmBooking,
  onViewAppointments,
  onCustomizeProfile,
}) => {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);
  const [selectedService, setSelectedService] = useState<BarberService | null>(BARBER_SERVICES[2]); // Default combo
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | 'todos'>('todos');
  const [selectedBarber, setSelectedBarber] = useState<BarberProfessional | null>(
    BARBERS.find((b) => b.id === clientProfile.preferredBarberId) || BARBERS[0]
  );
  
  // Date options for next 14 days
  const availableDates = useMemo(() => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      // Skip Sundays (0) if the shop is closed
      const dayOfWeek = d.getDay();
      if (dayOfWeek !== 0) {
        const isoString = d.toISOString().split('T')[0];
        dates.push({
          dateStr: isoString,
          dayNumber: d.getDate(),
          weekday: new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(d),
          month: new Intl.DateTimeFormat('pt-BR', { month: 'short' }).format(d),
          fullDate: d,
          isToday: i === 0,
        });
      }
    }
    return dates;
  }, []);

  const [selectedDate, setSelectedDate] = useState<string>(
    availableDates[0]?.dateStr || new Date().toISOString().split('T')[0]
  );
  const [selectedTime, setSelectedTime] = useState<string>('14:30');
  const [customNote, setCustomNote] = useState<string>(clientProfile.stylePreferences || '');
  const [bookedAppointment, setBookedAppointment] = useState<Appointment | null>(null);

  // Time slots definition
  const timeSlots = [
    { period: 'Manhã', slots: ['09:00', '09:45', '10:30', '11:15', '12:00'] },
    { period: 'Tarde', slots: ['13:30', '14:15', '15:00', '15:45', '16:30', '17:15'] },
    { period: 'Noite', slots: ['18:00', '18:45', '19:30'] },
  ];

  // Check if a time slot is already booked for selected barber & date
  const isSlotBooked = (time: string) => {
    if (!selectedBarber) return false;
    return existingAppointments.some(
      (app) =>
        app.date === selectedDate &&
        app.time === time &&
        app.barberId === selectedBarber.id &&
        app.status !== 'cancelled'
    );
  };

  const filteredServices = useMemo(() => {
    if (selectedCategory === 'todos') return BARBER_SERVICES;
    return BARBER_SERVICES.filter((s) => s.category === selectedCategory);
  }, [selectedCategory]);

  const handleFinishBooking = () => {
    if (!selectedService || !selectedBarber) return;

    const newAppointment: Appointment = {
      id: `app-${Date.now()}`,
      clientId: clientProfile.id,
      clientName: clientProfile.name,
      clientPhone: clientProfile.phone,
      clientThemeColor: clientProfile.themeColor,
      clientAvatarIcon: clientProfile.avatarIcon,
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      servicePrice: selectedService.price,
      serviceDuration: selectedService.durationMinutes,
      barberId: selectedBarber.id,
      barberName: selectedBarber.name,
      barberAvatar: selectedBarber.avatarUrl,
      date: selectedDate,
      time: selectedTime,
      status: 'confirmed',
      notes: customNote,
      createdAt: new Date().toISOString(),
    };

    onConfirmBooking(newAppointment);
    setBookedAppointment(newAppointment);
    setStep(5); // Success step
  };

  const themeColor = clientProfile.themeColor;

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 animate-fadeIn">
      {/* Step Indicator Header (steps 1-4) */}
      {step < 5 && (
        <div className="bg-neutral-900/80 border border-neutral-800 rounded-2xl p-4 sm:p-5 shadow-lg backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ClientAvatar
                iconId={clientProfile.avatarIcon}
                themeColor={themeColor}
                size="sm"
              />
              <div>
                <div className="text-xs text-neutral-400">Agendando como:</div>
                <div className="text-sm font-bold text-white flex items-center gap-2">
                  {clientProfile.name}
                  <button
                    onClick={onCustomizeProfile}
                    className="text-[11px] font-normal hover:underline opacity-80 cursor-pointer"
                    style={{ color: themeColor }}
                  >
                    (Alterar perfil/cor)
                  </button>
                </div>
              </div>
            </div>

            {/* Stepper bubbles */}
            <div className="hidden sm:flex items-center gap-2">
              {[
                { num: 1, label: 'Serviço' },
                { num: 2, label: 'Barbeiro' },
                { num: 3, label: 'Data & Hora' },
                { num: 4, label: 'Confirmar' },
              ].map((s) => (
                <div key={s.num} className="flex items-center gap-2">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      step === s.num
                        ? 'text-neutral-950 shadow-md ring-2 ring-white/30'
                        : step > s.num
                        ? 'bg-neutral-800 text-white'
                        : 'bg-neutral-950 text-neutral-500 border border-neutral-800'
                    }`}
                    style={
                      step === s.num
                        ? { backgroundColor: themeColor }
                        : step > s.num
                        ? { borderColor: themeColor, color: themeColor }
                        : {}
                    }
                  >
                    {step > s.num ? '✓' : s.num}
                  </div>
                  <span
                    className={`text-xs ${
                      step === s.num ? 'text-white font-medium' : 'text-neutral-500'
                    }`}
                  >
                    {s.label}
                  </span>
                  {s.num < 4 && <div className="w-3 h-px bg-neutral-800 mx-1" />}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* STEP 1: CHOOSE SERVICE */}
      {step === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                1. Selecione o Serviço Desejado
              </h2>
              <p className="text-sm text-neutral-400 mt-1">
                Escolha o procedimento de corte, barba ou combo que deseja realizar.
              </p>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
              {(
                [
                  { id: 'todos', label: 'Todos' },
                  { id: 'cabelo', label: 'Cabelo' },
                  { id: 'barba', label: 'Barba' },
                  { id: 'combo', label: 'Combos' },
                  { id: 'tratamento', label: 'Tratamentos' },
                ] as const
              ).map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat.id
                      ? 'text-neutral-950 font-bold shadow-md'
                      : 'bg-neutral-900 border border-neutral-800 text-neutral-300 hover:border-neutral-700'
                  }`}
                  style={
                    selectedCategory === cat.id
                      ? { backgroundColor: themeColor }
                      : {}
                  }
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Services List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredServices.map((service) => {
              const isSelected = selectedService?.id === service.id;
              return (
                <div
                  key={service.id}
                  onClick={() => setSelectedService(service)}
                  className={`relative p-5 rounded-2xl border transition-all cursor-pointer group flex flex-col justify-between ${
                    isSelected
                      ? 'bg-neutral-900/90 border-white/40 ring-2 shadow-xl'
                      : 'bg-neutral-900/50 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900/70'
                  }`}
                  style={isSelected ? ({ '--tw-ring-color': themeColor } as React.CSSProperties) : {}}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor: isSelected ? themeColor : '#737373',
                          }}
                        />
                        <h3 className="font-bold text-base text-white group-hover:text-white transition-colors">
                          {service.name}
                        </h3>
                      </div>
                      {service.badge && (
                        <span
                          className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0"
                          style={{
                            backgroundColor: getRgba(themeColor, 0.2),
                            color: themeColor,
                            border: `1px solid ${getRgba(themeColor, 0.3)}`,
                          }}
                        >
                          {service.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-neutral-400 leading-relaxed mb-4">
                      {service.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-neutral-800/80">
                    <div className="flex items-center gap-1.5 text-xs text-neutral-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{service.durationMinutes} min</span>
                    </div>

                    <div className="text-right">
                      <div className="text-lg font-extrabold text-white">
                        {formatCurrency(service.price)}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step 1 Footer */}
          <div className="flex justify-end pt-4">
            <button
              disabled={!selectedService}
              onClick={() => setStep(2)}
              className="px-6 py-3.5 rounded-xl font-bold text-neutral-950 flex items-center gap-2 shadow-lg transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              style={{
                backgroundColor: themeColor,
                boxShadow: `0 6px 20px ${getRgba(themeColor, 0.35)}`,
              }}
            >
              Avançar: Escolher Barbeiro
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: CHOOSE BARBER */}
      {step === 2 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              2. Escolha o Seu Profissional
            </h2>
            <p className="text-sm text-neutral-400 mt-1">
              Todos os nossos barbeiros são altamente capacitados com técnicas de precisão e visagismo.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {BARBERS.map((barber) => {
              const isSelected = selectedBarber?.id === barber.id;
              const isPreferred = clientProfile.preferredBarberId === barber.id;

              return (
                <div
                  key={barber.id}
                  onClick={() => setSelectedBarber(barber)}
                  className={`relative p-5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group ${
                    isSelected
                      ? 'bg-neutral-900/90 border-white/40 ring-2 shadow-xl'
                      : 'bg-neutral-900/50 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900/70'
                  }`}
                  style={isSelected ? ({ '--tw-ring-color': themeColor } as React.CSSProperties) : {}}
                >
                  <div>
                    {isPreferred && (
                      <div
                        className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full mb-3"
                        style={{
                          backgroundColor: getRgba(themeColor, 0.2),
                          color: themeColor,
                        }}
                      >
                        <Sparkles className="w-3 h-3" />
                        Seu Favorito
                      </div>
                    )}

                    <div className="flex items-center gap-3.5 mb-4">
                      <img
                        src={barber.avatarUrl}
                        alt={barber.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-neutral-700 shadow-md group-hover:scale-105 transition-transform"
                      />
                      <div>
                        <h3 className="font-bold text-white text-base leading-tight">
                          {barber.name}
                        </h3>
                        <p className="text-xs font-medium text-neutral-400 mt-0.5">
                          "{barber.nickname}"
                        </p>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                          <span className="text-xs font-bold text-white">
                            {barber.rating}
                          </span>
                          <span className="text-[11px] text-neutral-500">
                            ({barber.reviewsCount})
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 mb-4">
                      <div className="text-xs font-semibold text-neutral-300">
                        {barber.specialty}
                      </div>
                      <p className="text-[11px] text-neutral-400 leading-relaxed">
                        {barber.bio}
                      </p>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-neutral-800/80 flex items-center justify-between text-xs">
                    <span className="text-neutral-400">
                      {barber.experienceYears} anos de experiência
                    </span>
                    <span
                      className="font-semibold"
                      style={{ color: isSelected ? themeColor : '#a3a3a3' }}
                    >
                      {isSelected ? 'Selecionado ✓' : 'Escolher'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Step 2 Footer Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-800/60">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-3 rounded-xl border border-neutral-700 bg-neutral-900/60 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar aos Serviços
            </button>

            <button
              disabled={!selectedBarber}
              onClick={() => setStep(3)}
              className="px-6 py-3.5 rounded-xl font-bold text-neutral-950 flex items-center gap-2 shadow-lg transition-all hover:brightness-110 active:scale-[0.99] cursor-pointer"
              style={{
                backgroundColor: themeColor,
                boxShadow: `0 6px 20px ${getRgba(themeColor, 0.35)}`,
              }}
            >
              Avançar: Data & Horário
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: CHOOSE DATE & TIME */}
      {step === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              3. Escolha o Dia e Horário
            </h2>
            <p className="text-sm text-neutral-400 mt-1">
              Atendimento com {selectedBarber?.name} para {selectedService?.name}.
            </p>
          </div>

          {/* Horizontal Date Selector */}
          <div className="space-y-3">
            <label className="text-xs font-semibold text-neutral-300 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4" style={{ color: themeColor }} />
              Próximos Dias Disponíveis (Seg a Sáb)
            </label>

            <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-thin">
              {availableDates.map((item) => {
                const isSelected = selectedDate === item.dateStr;
                return (
                  <button
                    key={item.dateStr}
                    type="button"
                    onClick={() => setSelectedDate(item.dateStr)}
                    className={`flex-shrink-0 flex flex-col items-center justify-center min-w-[76px] py-3 px-2 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-white/50 bg-neutral-800 ring-2 shadow-lg'
                        : 'border-neutral-800 bg-neutral-900/60 hover:border-neutral-700 hover:bg-neutral-800/60'
                    }`}
                    style={isSelected ? ({ '--tw-ring-color': themeColor } as React.CSSProperties) : {}}
                  >
                    <span
                      className="text-[11px] font-medium uppercase"
                      style={{ color: isSelected ? themeColor : '#9ca3af' }}
                    >
                      {item.isToday ? 'Hoje' : item.weekday}
                    </span>
                    <span className="text-xl font-bold text-white my-0.5">
                      {item.dayNumber}
                    </span>
                    <span className="text-[10px] text-neutral-500 uppercase">
                      {item.month}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Slots Grid */}
          <div className="bg-neutral-900/70 border border-neutral-800/90 rounded-2xl p-5 sm:p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="text-sm font-semibold text-white flex items-center gap-2">
                <Clock className="w-4 h-4" style={{ color: themeColor }} />
                Horários para {formatDateFullBR(selectedDate)}
              </div>
              <div className="flex items-center gap-4 text-xs text-neutral-400">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-neutral-700" />
                  <span>Livre</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: themeColor }}
                  />
                  <span>Selecionado</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-900/60" />
                  <span>Ocupado</span>
                </div>
              </div>
            </div>

            <div className="space-y-5">
              {timeSlots.map((group) => (
                <div key={group.period} className="space-y-2.5">
                  <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                    {group.period}
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2.5">
                    {group.slots.map((slot) => {
                      const booked = isSlotBooked(slot);
                      const isSelected = selectedTime === slot;

                      return (
                        <button
                          key={slot}
                          disabled={booked}
                          onClick={() => setSelectedTime(slot)}
                          className={`py-2.5 px-2 rounded-xl text-xs font-semibold text-center transition-all cursor-pointer ${
                            booked
                              ? 'bg-neutral-950/60 border border-neutral-800/60 text-neutral-600 line-through cursor-not-allowed'
                              : isSelected
                              ? 'text-neutral-950 font-bold shadow-md ring-2 ring-white/40'
                              : 'bg-neutral-950 border border-neutral-800 text-neutral-200 hover:border-neutral-600 hover:bg-neutral-800/80'
                          }`}
                          style={
                            isSelected && !booked
                              ? { backgroundColor: themeColor }
                              : {}
                          }
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 3 Footer Navigation */}
          <div className="flex items-center justify-between pt-4 border-t border-neutral-800/60">
            <button
              onClick={() => setStep(2)}
              className="px-4 py-3 rounded-xl border border-neutral-700 bg-neutral-900/60 text-sm font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors flex items-center gap-2 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              Voltar ao Barbeiro
            </button>

            <button
              disabled={!selectedTime}
              onClick={() => setStep(4)}
              className="px-6 py-3.5 rounded-xl font-bold text-neutral-950 flex items-center gap-2 shadow-lg transition-all hover:brightness-110 active:scale-[0.99] cursor-pointer"
              style={{
                backgroundColor: themeColor,
                boxShadow: `0 6px 20px ${getRgba(themeColor, 0.35)}`,
              }}
            >
              Revisar & Confirmar
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & CONFIRM */}
      {step === 4 && selectedService && selectedBarber && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              4. Confirme os Detalhes do Agendamento
            </h2>
            <p className="text-sm text-neutral-400 mt-1">
              Revise o resumo do seu atendimento antes de confirmar a reserva.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* Booking Details Card */}
            <div className="md:col-span-7 bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-neutral-800 pb-4">
                <div className="text-sm font-semibold uppercase tracking-wider text-neutral-400">
                  Resumo do Agendamento
                </div>
                <span
                  className="text-xs font-bold px-2.5 py-1 rounded-full uppercase"
                  style={{
                    backgroundColor: getRgba(themeColor, 0.15),
                    color: themeColor,
                  }}
                >
                  Reserva Imediata
                </span>
              </div>

              {/* Service & Price */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-xs text-neutral-400">Serviço Escolhido:</span>
                    <h3 className="text-lg font-bold text-white mt-0.5">
                      {selectedService.name}
                    </h3>
                    <p className="text-xs text-neutral-400 mt-1">
                      {selectedService.description}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="text-xl font-extrabold text-white">
                      {formatCurrency(selectedService.price)}
                    </div>
                    <div className="text-xs text-neutral-400">
                      {selectedService.durationMinutes} minutos
                    </div>
                  </div>
                </div>
              </div>

              {/* Barber & Timing info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-3.5 flex items-center gap-3">
                  <img
                    src={selectedBarber.avatarUrl}
                    alt={selectedBarber.name}
                    className="w-12 h-12 rounded-xl object-cover border border-neutral-700"
                  />
                  <div>
                    <div className="text-[10px] uppercase text-neutral-400 font-medium">
                      Barbeiro
                    </div>
                    <div className="text-sm font-bold text-white">
                      {selectedBarber.name}
                    </div>
                    <div className="text-xs text-neutral-400">
                      {selectedBarber.role}
                    </div>
                  </div>
                </div>

                <div className="bg-neutral-950/80 border border-neutral-800 rounded-2xl p-3.5 flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      backgroundColor: getRgba(themeColor, 0.15),
                      color: themeColor,
                    }}
                  >
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-[10px] uppercase text-neutral-400 font-medium">
                      Data & Horário
                    </div>
                    <div className="text-sm font-bold text-white">
                      {formatDateBR(selectedDate)} às {selectedTime}
                    </div>
                    <div className="text-xs text-neutral-400">
                      {selectedService.durationMinutes} min de sessão
                    </div>
                  </div>
                </div>
              </div>

              {/* Client Notes / Style specs */}
              <div className="space-y-2 pt-2">
                <label className="text-xs font-semibold text-neutral-300 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5" style={{ color: themeColor }} />
                  Observações para o Barbeiro
                </label>
                <textarea
                  rows={2}
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  placeholder="Instruções de corte, toalha quente, etc."
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white/50"
                />
              </div>
            </div>

            {/* Client Profile Card */}
            <div className="md:col-span-5 space-y-4">
              <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-xl">
                <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400">
                  Identificação do Cliente
                </div>

                <div className="flex items-center gap-3.5">
                  <ClientAvatar
                    iconId={clientProfile.avatarIcon}
                    themeColor={themeColor}
                    size="lg"
                    showGlow
                  />
                  <div>
                    <div className="text-base font-bold text-white">
                      {clientProfile.name}
                    </div>
                    <div className="text-xs text-neutral-400 font-mono">
                      {clientProfile.phone}
                    </div>
                    <div className="text-xs text-neutral-400">
                      {clientProfile.email || 'Sem e-mail cadastrado'}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-800 text-xs space-y-2 text-neutral-400">
                  <div className="flex items-center justify-between">
                    <span>Cor do seu Perfil:</span>
                    <div className="flex items-center gap-1.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: themeColor }}
                      />
                      <span className="font-mono text-neutral-300 uppercase">
                        {themeColor}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pagamento:</span>
                    <span className="text-neutral-200 font-medium">
                      No local (Pix, Cartão ou Dinheiro)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onCustomizeProfile}
                  className="w-full text-center text-xs py-2 rounded-lg border border-neutral-800 hover:border-neutral-700 text-neutral-300 hover:text-white transition-colors cursor-pointer"
                >
                  Editar Dados ou Cor do Perfil
                </button>
              </div>

              {/* Confirm Button */}
              <button
                type="button"
                onClick={handleFinishBooking}
                className="w-full py-4 rounded-2xl font-bold text-neutral-950 text-base shadow-xl flex items-center justify-center gap-2 hover:brightness-110 active:scale-[0.99] transition-all cursor-pointer"
                style={{
                  backgroundColor: themeColor,
                  boxShadow: `0 8px 30px ${getRgba(themeColor, 0.4)}`,
                }}
              >
                <CheckCircle2 className="w-5 h-5 stroke-[2.5]" />
                Confirmar Agendamento
              </button>
            </div>
          </div>

          {/* Step 4 Navigation */}
          <div className="pt-2">
            <button
              onClick={() => setStep(3)}
              className="px-4 py-2.5 rounded-xl border border-neutral-700 bg-neutral-900/60 text-xs font-medium text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Voltar e Alterar Data/Hora
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: SUCCESS STATE */}
      {step === 5 && bookedAppointment && (
        <div className="max-w-2xl mx-auto text-center space-y-6 py-6 animate-fadeIn">
          {/* Animated Success Badge */}
          <div className="inline-flex p-4 rounded-3xl bg-neutral-900/90 border border-neutral-800 shadow-2xl relative">
            <div
              className="absolute inset-0 rounded-3xl blur-xl opacity-30 pointer-events-none"
              style={{ backgroundColor: themeColor }}
            />
            <div
              className="w-16 h-16 rounded-2xl flex items-center justify-center text-neutral-950 shadow-lg relative z-10"
              style={{ backgroundColor: themeColor }}
            >
              <CheckCircle2 className="w-9 h-9 stroke-[2.5]" />
            </div>
          </div>

          <div>
            <span
              className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full"
              style={{
                backgroundColor: getRgba(themeColor, 0.15),
                color: themeColor,
              }}
            >
              Agendamento Confirmado!
            </span>
            <h2 className="text-3xl font-extrabold text-white mt-2 tracking-tight">
              Tudo pronto, {clientProfile.name}!
            </h2>
            <p className="text-neutral-400 text-sm mt-1 max-w-md mx-auto">
              Seu horário foi reservado com sucesso e sua preferência personalizada foi gravada para o barbeiro.
            </p>
          </div>

          {/* Summary Box */}
          <div className="bg-neutral-900/80 border border-neutral-800 rounded-3xl p-6 text-left space-y-4 shadow-xl">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <span className="text-xs text-neutral-400">Comprovante de Horário</span>
              <span className="text-xs font-mono text-neutral-500">
                #{bookedAppointment.id.slice(-6).toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[11px] text-neutral-400">Serviço:</span>
                <div className="font-bold text-white">{bookedAppointment.serviceName}</div>
              </div>
              <div>
                <span className="text-[11px] text-neutral-400">Barbeiro:</span>
                <div className="font-bold text-white">{bookedAppointment.barberName}</div>
              </div>
              <div>
                <span className="text-[11px] text-neutral-400">Data:</span>
                <div className="font-bold text-white">
                  {formatDateBR(bookedAppointment.date)}
                </div>
              </div>
              <div>
                <span className="text-[11px] text-neutral-400">Horário:</span>
                <div className="font-bold text-white">{bookedAppointment.time}</div>
              </div>
              <div>
                <span className="text-[11px] text-neutral-400">Valor Estimado:</span>
                <div className="font-extrabold text-emerald-400">
                  {formatCurrency(bookedAppointment.servicePrice)}
                </div>
              </div>
              <div>
                <span className="text-[11px] text-neutral-400">Duração:</span>
                <div className="font-medium text-neutral-200">
                  {bookedAppointment.serviceDuration} min
                </div>
              </div>
            </div>

            {bookedAppointment.notes && (
              <div className="pt-2 border-t border-neutral-800/80 text-xs">
                <span className="text-[11px] text-neutral-400">Nota enviada:</span>
                <p className="text-neutral-300 italic mt-0.5">
                  "{bookedAppointment.notes}"
                </p>
              </div>
            )}
          </div>

          {/* Buttons: WhatsApp notification & View Appointments */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Olá Barbearia Club! Acabei de agendar um horário pelo app: \n📌 Serviço: ${bookedAppointment.serviceName}\n💈 Barbeiro: ${bookedAppointment.barberName}\n📅 Data: ${bookedAppointment.date} às ${bookedAppointment.time}\n👤 Cliente: ${clientProfile.name} (${clientProfile.phone})`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-bold text-neutral-950 bg-emerald-400 hover:bg-emerald-300 transition-colors flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <MessageCircle className="w-4 h-4 fill-neutral-950" />
              Notificar via WhatsApp
            </a>

            <button
              onClick={onViewAppointments}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl font-semibold border border-neutral-700 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              Ver Meus Agendamentos
            </button>

            <button
              onClick={() => {
                setStep(1);
                setBookedAppointment(null);
              }}
              className="w-full sm:w-auto px-4 py-3.5 rounded-xl text-neutral-400 hover:text-white text-xs transition-colors cursor-pointer"
            >
              Agendar Outro Horário
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
