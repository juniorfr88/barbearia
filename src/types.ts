export type ServiceCategory = 'cabelo' | 'barba' | 'combo' | 'tratamento';

export interface BarberService {
  id: string;
  name: string;
  category: ServiceCategory;
  description: string;
  price: number;
  durationMinutes: number;
  badge?: string;
}

export interface BarberProfessional {
  id: string;
  name: string;
  nickname: string;
  role: string;
  specialty: string;
  bio: string;
  rating: number;
  reviewsCount: number;
  avatarUrl: string;
  experienceYears: number;
  workingDays: number[]; // 0 = Domingo, 1 = Segunda, ..., 6 = Sábado
}

export interface ColorPreset {
  id: string;
  name: string;
  hex: string;
  accentClass: string;
  description: string;
}

export interface ClientProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
  preferredBarberId?: string;
  stylePreferences: string;
  themeColor: string; // Hex color code
  themePresetId: string;
  avatarIcon: string;
  avatarBgColor: string;
  birthday?: string;
  notifications: boolean;
}

export interface Appointment {
  id: string;
  clientId: string;
  clientName: string;
  clientPhone: string;
  clientThemeColor: string;
  clientAvatarIcon: string;
  serviceId: string;
  serviceName: string;
  servicePrice: number;
  serviceDuration: number;
  barberId: string;
  barberName: string;
  barberAvatar: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  status: 'confirmed' | 'completed' | 'cancelled';
  notes?: string;
  createdAt: string;
}

export type ActiveTab = 'book' | 'my-appointments' | 'profile' | 'shop-agenda';
