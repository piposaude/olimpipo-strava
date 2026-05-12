// Shared types and mock data for the Olimpipo feature.

export type Edition = {
  id: string;
  label: string;
  period: string;
  active: boolean;
  days_remaining: number;
  participants: number;
  my_rank: number;
  my_points: number;
  my_activities: number;
};

export type RankingEntry = {
  rank: number;
  name: string;
  dept: string;
  points: number;
  activities: number;
  me?: boolean;
};

export type ActivityKind =
  | 'run'
  | 'walk'
  | 'bike'
  | 'swim'
  | 'yoga'
  | 'gym'
  | 'mind'
  | 'water'
  | 'doctor';

export type Activity = {
  id: number;
  type: string;
  date: string;
  duration: string;
  metric: string;
  points: number;
  kind: ActivityKind;
  status: 'aprovada' | 'em análise';
};

export const OLIMPIPO_EDITIONS: Edition[] = [
  {
    id: 'mai-26',
    label: 'Maio/26',
    period: '01 — 31 maio 2026',
    active: true,
    days_remaining: 19,
    participants: 412,
    my_rank: 14,
    my_points: 580,
    my_activities: 12,
  },
  {
    id: 'abr-26',
    label: 'Abril/26',
    period: '01 — 30 abril 2026',
    active: false,
    days_remaining: 0,
    participants: 398,
    my_rank: 5,
    my_points: 920,
    my_activities: 21,
  },
  {
    id: 'mar-26',
    label: 'Março/26',
    period: '01 — 31 março 2026',
    active: false,
    days_remaining: 0,
    participants: 376,
    my_rank: 1,
    my_points: 1180,
    my_activities: 27,
  },
  {
    id: 'fev-26',
    label: 'Fevereiro/26',
    period: '01 — 28 fevereiro 2026',
    active: false,
    days_remaining: 0,
    participants: 351,
    my_rank: 22,
    my_points: 510,
    my_activities: 11,
  },
  {
    id: 'jan-26',
    label: 'Janeiro/26',
    period: '01 — 31 janeiro 2026',
    active: false,
    days_remaining: 0,
    participants: 312,
    my_rank: 3,
    my_points: 1020,
    my_activities: 24,
  },
  {
    id: 'dez-25',
    label: 'Dezembro/25',
    period: '01 — 31 dezembro 2025',
    active: false,
    days_remaining: 0,
    participants: 289,
    my_rank: 2,
    my_points: 1090,
    my_activities: 25,
  },
  {
    id: 'nov-25',
    label: 'Novembro/25',
    period: '01 — 30 novembro 2025',
    active: false,
    days_remaining: 0,
    participants: 268,
    my_rank: 34,
    my_points: 410,
    my_activities: 8,
  },
];

export const OLIMPIPO_RANKING: RankingEntry[] = [
  { rank: 1, name: 'Mariana Costa', dept: 'Produto', points: 1240, activities: 28 },
  { rank: 2, name: 'Rafael Lima', dept: 'Engenharia', points: 1180, activities: 26 },
  { rank: 3, name: 'Camila Souza', dept: 'Comercial', points: 1095, activities: 24 },
  { rank: 4, name: 'Bruno Almeida', dept: 'Engenharia', points: 980, activities: 22 },
  { rank: 5, name: 'Letícia Ferreira', dept: 'Design', points: 945, activities: 21 },
  { rank: 6, name: 'João Pereira', dept: 'Operações', points: 880, activities: 19 },
  { rank: 7, name: 'Isabela Martins', dept: 'Marketing', points: 845, activities: 18 },
  { rank: 8, name: 'Diego Ribeiro', dept: 'Engenharia', points: 790, activities: 17 },
  { rank: 9, name: 'Patrícia Nunes', dept: 'RH', points: 745, activities: 16 },
  { rank: 10, name: 'Felipe Cardoso', dept: 'Comercial', points: 720, activities: 15 },
  { rank: 11, name: 'Beatriz Rocha', dept: 'Produto', points: 680, activities: 14 },
  { rank: 12, name: 'Lucas Mendes', dept: 'Engenharia', points: 645, activities: 13 },
  { rank: 13, name: 'Aline Barbosa', dept: 'Design', points: 610, activities: 12 },
  { rank: 14, name: 'Ana Silva', dept: 'Produto', points: 580, activities: 12, me: true },
  { rank: 15, name: 'Marcelo Tavares', dept: 'Operações', points: 545, activities: 11 },
  { rank: 16, name: 'Renata Pinto', dept: 'Comercial', points: 520, activities: 10 },
  { rank: 17, name: 'Gustavo Henrique', dept: 'Engenharia', points: 495, activities: 10 },
  { rank: 18, name: 'Juliana Castro', dept: 'Marketing', points: 470, activities: 9 },
];

export const OLIMPIPO_ACTIVITIES: Activity[] = [
  { id: 1, type: 'Corrida', date: '19 mai · 06:42', duration: '38 min', metric: '5,2 km', points: 60, kind: 'run', status: 'aprovada' },
  { id: 2, type: 'Yoga', date: '18 mai · 07:30', duration: '45 min', metric: 'sessão', points: 40, kind: 'yoga', status: 'aprovada' },
  { id: 3, type: 'Hidratação', date: '18 mai', duration: 'dia', metric: '2,4 L', points: 20, kind: 'water', status: 'aprovada' },
  { id: 4, type: 'Musculação', date: '17 mai · 19:10', duration: '55 min', metric: 'treino', points: 50, kind: 'gym', status: 'aprovada' },
  { id: 5, type: 'Caminhada', date: '16 mai · 17:50', duration: '42 min', metric: '4,1 km', points: 45, kind: 'walk', status: 'aprovada' },
  { id: 6, type: 'Meditação', date: '15 mai · 22:05', duration: '12 min', metric: 'sessão', points: 25, kind: 'mind', status: 'aprovada' },
  { id: 7, type: 'Bicicleta', date: '14 mai · 08:00', duration: '1h 12min', metric: '18,4 km', points: 80, kind: 'bike', status: 'aprovada' },
  { id: 8, type: 'Corrida', date: '12 mai · 06:30', duration: '32 min', metric: '4,3 km', points: 50, kind: 'run', status: 'aprovada' },
  { id: 9, type: 'Hidratação', date: '11 mai', duration: 'dia', metric: '2,0 L', points: 20, kind: 'water', status: 'aprovada' },
  { id: 10, type: 'Consulta médica', date: '08 mai · 14:00', duration: '30 min', metric: 'check-up', points: 100, kind: 'doctor', status: 'aprovada' },
  { id: 11, type: 'Natação', date: '06 mai · 18:30', duration: '40 min', metric: '1,2 km', points: 70, kind: 'swim', status: 'aprovada' },
  { id: 12, type: 'Caminhada', date: '04 mai · 18:00', duration: '50 min', metric: '4,5 km', points: 50, kind: 'walk', status: 'em análise' },
];
