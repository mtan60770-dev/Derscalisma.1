export interface Gift {
  name: string;
  icon: string;
  cost: number;
  popularity: number;
}

export const GIFTS: Gift[] = [
  { name: 'Yıldız', icon: '⭐', cost: 50, popularity: 50 },
  { name: 'Araba', icon: '🚗', cost: 100, popularity: 100 },
  { name: 'Uçak', icon: '✈️', cost: 200, popularity: 200 },
  { name: 'Uçan Araba', icon: '🛸', cost: 500, popularity: 500 },
];

export const RANKS = [
  { id: 'bronze', name: 'Bronz', min: 0, bg: 'bg-orange-900/20', border: 'border-orange-900/30', color: 'text-orange-400', gradient: 'from-orange-900 to-orange-700', icon: 'shield' },
  { id: 'silver', name: 'Gümüş', min: 100, bg: 'bg-slate-500/20', border: 'border-slate-500/30', color: 'text-slate-300', gradient: 'from-slate-500 to-slate-300', icon: 'military_tech' },
  { id: 'gold', name: 'Altın', min: 500, bg: 'bg-yellow-500/20', border: 'border-yellow-500/30', color: 'text-yellow-400', gradient: 'from-yellow-500 to-yellow-300', icon: 'emoji_events' },
  { id: 'platinum', name: 'Platin', min: 1000, bg: 'bg-cyan-500/20', border: 'border-cyan-500/30', color: 'text-cyan-400', gradient: 'from-cyan-500 to-cyan-300', icon: 'workspace_premium' },
  { id: 'diamond', name: 'Elmas', min: 2000, bg: 'bg-purple-500/20', border: 'border-purple-500/30', color: 'text-purple-400', gradient: 'from-purple-500 to-purple-300', icon: 'diamond' },
];

export const getRank = (total: number) => {
  return RANKS.slice().reverse().find(r => total >= r.min) || RANKS[0];
};

export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const LEVELS = [
  { level: 1, minQuestions: 0 },
  { level: 2, minQuestions: 50 },
  { level: 3, minQuestions: 150 },
  { level: 4, minQuestions: 300 },
  { level: 5, minQuestions: 500 },
];

export const getLevel = (total: number) => {
  return LEVELS.slice().reverse().find(l => total >= l.minQuestions)?.level || 1;
};

export const FRAMES = [
  { id: 'frame_none', name: 'Standart', color: 'border-white/10', cost: 0, animation: '' },
];
