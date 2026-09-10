import React, { useState } from 'react';
import { ClientProfile } from '../types';
import { COLOR_PRESETS, AVATAR_OPTIONS, BARBERS } from '../data/mockData';
import { ClientAvatar } from './ClientAvatar';
import { getRgba } from '../utils/theme';
import { Check, Sparkles, User, Phone, Mail, Scissors, BookmarkCheck } from 'lucide-react';

interface ProfileEditorProps {
  profile: ClientProfile;
  onSaveProfile: (updated: ClientProfile) => void;
  onGoToBooking?: () => void;
}

export const ProfileEditor: React.FC<ProfileEditorProps> = ({
  profile,
  onSaveProfile,
  onGoToBooking,
}) => {
  const [name, setName] = useState(profile.name);
  const [phone, setPhone] = useState(profile.phone);
  const [email, setEmail] = useState(profile.email);
  const [preferredBarberId, setPreferredBarberId] = useState(profile.preferredBarberId || '');
  const [stylePreferences, setStylePreferences] = useState(profile.stylePreferences);
  const [selectedColor, setSelectedColor] = useState(profile.themeColor);
  const [selectedPresetId, setSelectedPresetId] = useState(profile.themePresetId);
  const [selectedAvatar, setSelectedAvatar] = useState(profile.avatarIcon);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleColorPresetClick = (presetId: string, hex: string) => {
    setSelectedPresetId(presetId);
    setSelectedColor(hex);
  };

  const handleCustomColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    setSelectedColor(hex);
    setSelectedPresetId('custom');
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ClientProfile = {
      ...profile,
      name: name.trim() || 'Cliente VIP',
      phone: phone.trim() || '(11) 99999-9999',
      email: email.trim(),
      preferredBarberId: preferredBarberId || undefined,
      stylePreferences,
      themeColor: selectedColor,
      themePresetId: selectedPresetId,
      avatarIcon: selectedAvatar,
    };
    onSaveProfile(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
    }, 3000);
  };

  const currentBarber = BARBERS.find((b) => b.id === preferredBarberId);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-neutral-800/80 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-2"
            style={{
              backgroundColor: getRgba(selectedColor, 0.15),
              color: selectedColor,
              borderColor: getRgba(selectedColor, 0.3),
              borderWidth: '1px',
            }}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Personalização do Cliente
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Meu Perfil & Cor do App
          </h2>
          <p className="text-sm text-neutral-400 mt-1 max-w-xl">
            Escolha sua cor exclusiva, ícone e preferências de corte. Toda a sua interface e os seus agendamentos na barbearia serão destacados com o seu estilo.
          </p>
        </div>

        {savedSuccess && (
          <div className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-sm font-medium animate-bounce">
            <Check className="w-4 h-4 text-emerald-400" />
            Perfil salvo com sucesso!
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Form */}
        <form onSubmit={handleSave} className="lg:col-span-7 space-y-7">
          {/* Section 1: Color Customization */}
          <div className="bg-neutral-900/70 border border-neutral-800/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: selectedColor }}
                  />
                  Sua Cor Personalizada
                </h3>
                <p className="text-xs text-neutral-400">
                  A cor escolhida será aplicada em botões, destaques e na agenda do barbeiro.
                </p>
              </div>

              {/* Custom Hex Picker Input */}
              <div className="flex items-center gap-2">
                <label className="text-xs font-mono text-neutral-300 uppercase bg-neutral-800 px-2.5 py-1 rounded-lg border border-neutral-700 cursor-pointer flex items-center gap-2 hover:border-neutral-500 transition-colors">
                  <span>{selectedColor}</span>
                  <input
                    type="color"
                    value={selectedColor}
                    onChange={handleCustomColorChange}
                    className="w-5 h-5 rounded cursor-pointer opacity-0 absolute"
                    title="Seletor de cor livre"
                  />
                  <div
                    className="w-4 h-4 rounded-full border border-white/40"
                    style={{ backgroundColor: selectedColor }}
                  />
                </label>
              </div>
            </div>

            {/* Presets Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
              {COLOR_PRESETS.map((preset) => {
                const isSelected = selectedColor.toLowerCase() === preset.hex.toLowerCase();
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handleColorPresetClick(preset.id, preset.hex)}
                    className={`group relative flex items-center gap-2.5 p-2.5 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-white/50 bg-neutral-800 shadow-md ring-2'
                        : 'border-neutral-800 bg-neutral-950/60 hover:border-neutral-700 hover:bg-neutral-800/60'
                    }`}
                    style={isSelected ? ({ '--tw-ring-color': preset.hex } as React.CSSProperties) : {}}
                  >
                    <span
                      className="w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center transition-transform group-hover:scale-110 shadow-inner"
                      style={{ backgroundColor: preset.hex }}
                    >
                      {isSelected && <Check className="w-3 h-3 text-neutral-950 stroke-[3]" />}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-neutral-200 truncate group-hover:text-white">
                        {preset.name}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 2: Avatar Icon */}
          <div className="bg-neutral-900/70 border border-neutral-800/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl backdrop-blur-sm">
            <div>
              <h3 className="text-base font-semibold text-white flex items-center gap-2">
                <Scissors className="w-4 h-4" style={{ color: selectedColor }} />
                Ícone do Perfil
              </h3>
              <p className="text-xs text-neutral-400">
                Selecione o emblema que representa seu estilo ao agendar horários.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
              {AVATAR_OPTIONS.map((item) => {
                const isSelected = selectedAvatar === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedAvatar(item.id)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'border-white/40 bg-neutral-800 ring-2'
                        : 'border-neutral-800 bg-neutral-950/50 hover:border-neutral-700 hover:bg-neutral-800/50'
                    }`}
                    style={isSelected ? ({ '--tw-ring-color': selectedColor } as React.CSSProperties) : {}}
                  >
                    <ClientAvatar
                      iconId={item.id}
                      themeColor={selectedColor}
                      size="md"
                      showGlow={isSelected}
                    />
                    <span className="text-[11px] font-medium text-neutral-300 mt-2 text-center line-clamp-1">
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 3: Client Details */}
          <div className="bg-neutral-900/70 border border-neutral-800/90 rounded-2xl p-5 sm:p-6 space-y-4 shadow-xl backdrop-blur-sm">
            <h3 className="text-base font-semibold text-white flex items-center gap-2">
              <User className="w-4 h-4" style={{ color: selectedColor }} />
              Dados do Cliente
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-neutral-500" />
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Rodrigo Silva"
                  className="w-full bg-neutral-950/80 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/50 focus:ring-1 transition-all"
                  style={{ '--tw-ring-color': selectedColor } as React.CSSProperties}
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-neutral-500" />
                  WhatsApp / Celular
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Ex: (11) 98765-4321"
                  className="w-full bg-neutral-950/80 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/50 focus:ring-1 transition-all"
                  style={{ '--tw-ring-color': selectedColor } as React.CSSProperties}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-neutral-500" />
                  E-mail (opcional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Ex: cliente@email.com"
                  className="w-full bg-neutral-950/80 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/50 focus:ring-1 transition-all"
                  style={{ '--tw-ring-color': selectedColor } as React.CSSProperties}
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <Scissors className="w-3.5 h-3.5 text-neutral-500" />
                  Barbeiro Favorito (Opcional)
                </label>
                <select
                  value={preferredBarberId}
                  onChange={(e) => setPreferredBarberId(e.target.value)}
                  className="w-full bg-neutral-950/80 border border-neutral-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-white/50 focus:ring-1 transition-all"
                  style={{ '--tw-ring-color': selectedColor } as React.CSSProperties}
                >
                  <option value="">Sem preferência fixa (Qualquer Barbeiro)</option>
                  {BARBERS.map((barber) => (
                    <option key={barber.id} value={barber.id}>
                      {barber.name} ({barber.nickname}) — {barber.specialty}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5">
                  <BookmarkCheck className="w-3.5 h-3.5 text-neutral-500" />
                  Suas Preferências de Corte & Barba
                </label>
                <textarea
                  rows={2}
                  value={stylePreferences}
                  onChange={(e) => setStylePreferences(e.target.value)}
                  placeholder="Ex: Degradê navalhado médio nas laterais, tesoura no topo e barba alinhada com toalha quente."
                  className="w-full bg-neutral-950/80 border border-neutral-700 rounded-xl p-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-white/50 focus:ring-1 transition-all resize-none"
                  style={{ '--tw-ring-color': selectedColor } as React.CSSProperties}
                />
                <p className="text-[11px] text-neutral-400">
                  Essas anotações serão automaticamente lembradas pelos barbeiros quando você agendar!
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <button
              type="submit"
              className="w-full sm:w-auto flex-1 font-semibold text-neutral-950 px-6 py-3.5 rounded-xl shadow-lg hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer"
              style={{
                backgroundColor: selectedColor,
                boxShadow: `0 8px 24px ${getRgba(selectedColor, 0.35)}`,
              }}
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              Salvar Alterações de Perfil & Cor
            </button>

            {onGoToBooking && (
              <button
                type="button"
                onClick={onGoToBooking}
                className="w-full sm:w-auto px-5 py-3.5 rounded-xl border border-neutral-700 hover:border-neutral-500 bg-neutral-900/60 text-sm font-medium text-white hover:bg-neutral-800 transition-colors flex items-center justify-center gap-2"
              >
                Ir para Agendamento
              </button>
            )}
          </div>
        </form>

        {/* Right Column: Live VIP Client Card Preview */}
        <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-6">
          <div className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5" style={{ color: selectedColor }} />
            Prévia do seu Cartão VIP
          </div>

          {/* Luxury Barber Member Card */}
          <div
            className="relative overflow-hidden rounded-3xl p-6 border transition-all duration-500 shadow-2xl backdrop-blur-md"
            style={{
              borderColor: getRgba(selectedColor, 0.4),
              background: `linear-gradient(145deg, #171717 0%, #0d0d0d 100%)`,
              boxShadow: `0 16px 40px -10px ${getRgba(selectedColor, 0.25)}`,
            }}
          >
            {/* Top decorative accent light */}
            <div
              className="absolute -top-16 -right-16 w-44 h-44 rounded-full blur-3xl pointer-events-none opacity-40 transition-colors duration-500"
              style={{ backgroundColor: selectedColor }}
            />

            {/* Header of card */}
            <div className="relative z-10 flex items-center justify-between pb-6 border-b border-neutral-800/80">
              <div className="flex items-center gap-3">
                <ClientAvatar
                  iconId={selectedAvatar}
                  themeColor={selectedColor}
                  size="lg"
                  showGlow
                />
                <div>
                  <span
                    className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: getRgba(selectedColor, 0.2),
                      color: selectedColor,
                    }}
                  >
                    Membro VIP
                  </span>
                  <h4 className="text-lg font-bold text-white tracking-tight mt-0.5">
                    {name || 'Seu Nome'}
                  </h4>
                  <p className="text-xs text-neutral-400 font-mono">
                    {phone || '(XX) XXXXX-XXXX'}
                  </p>
                </div>
              </div>

              {/* Theme Badge */}
              <div className="text-right">
                <div
                  className="w-4 h-4 rounded-full ml-auto shadow-md"
                  style={{ backgroundColor: selectedColor }}
                />
                <span className="text-[10px] font-mono text-neutral-400 uppercase mt-1 block">
                  {selectedColor}
                </span>
              </div>
            </div>

            {/* Body of card */}
            <div className="relative z-10 py-5 space-y-4 text-xs">
              <div className="bg-neutral-900/80 rounded-xl p-3.5 border border-neutral-800">
                <div className="text-[11px] font-medium text-neutral-400 mb-1 flex items-center gap-1.5">
                  <Scissors className="w-3 h-3" style={{ color: selectedColor }} />
                  Preferência Registrada:
                </div>
                <p className="text-neutral-200 italic leading-relaxed">
                  "{stylePreferences || 'Nenhuma preferência personalizada ainda.'}"
                </p>
              </div>

              {currentBarber && (
                <div className="flex items-center justify-between bg-neutral-900/60 rounded-xl p-3 border border-neutral-800/80">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={currentBarber.avatarUrl}
                      alt={currentBarber.name}
                      className="w-8 h-8 rounded-full object-cover border border-neutral-700"
                    />
                    <div>
                      <div className="text-[10px] text-neutral-400">Barbeiro Preferido</div>
                      <div className="font-semibold text-white">{currentBarber.name}</div>
                    </div>
                  </div>
                  <span
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-md"
                    style={{
                      color: selectedColor,
                      backgroundColor: getRgba(selectedColor, 0.15),
                    }}
                  >
                    ★ {currentBarber.rating}
                  </span>
                </div>
              )}
            </div>

            {/* Card Footer */}
            <div className="relative z-10 pt-4 border-t border-neutral-800/80 flex items-center justify-between text-[11px] text-neutral-400 font-mono">
              <span>BARBEARIA CLUB PASS</span>
              <span
                className="font-bold tracking-wider"
                style={{ color: selectedColor }}
              >
                STATUS: ATIVO
              </span>
            </div>
          </div>

          {/* Quick Explanation */}
          <div className="rounded-2xl bg-neutral-900/40 border border-neutral-800/60 p-4 text-xs text-neutral-400 space-y-2">
            <div className="font-medium text-neutral-300 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: selectedColor }} />
              Onde sua cor aparece?
            </div>
            <ul className="list-disc list-inside space-y-1 text-neutral-400">
              <li>Nos botões de ação e abas do aplicativo</li>
              <li>Na etiqueta dos seus agendamentos no mural do barbeiro</li>
              <li>Nos lembretes e comprovantes gerados</li>
              <li>No seu crachá de identificação de cliente</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
