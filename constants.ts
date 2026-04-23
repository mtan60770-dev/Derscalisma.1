export interface Gift {
  name: string;
  icon: string;
  cost: number;
  popularity: number;
  durationDays?: number;
}

export const GIFTS: Gift[] = [
  { name: 'Yıldız', icon: '⭐', cost: 50, popularity: 100 },
  { name: 'Araba', icon: '🚗', cost: 100, popularity: 200 },
  { name: 'Uçak', icon: '✈️', cost: 200, popularity: 400 },
  { name: 'Uçan Araba', icon: '🛸', cost: 500, popularity: 1000 },
  { name: 'Uzaylı', icon: '👽', cost: 1000, popularity: 2000 },
  { name: 'Kral', icon: '👑', cost: 2000, popularity: 3000 },
  { name: 'Ders', icon: '📚', cost: 3000, popularity: 4000 },
  { name: 'Aslan', icon: '🦁', cost: 20000, popularity: 30000 },
  { name: 'Lemurjini', icon: '🏎️', cost: 30000, popularity: 40000 },
  { name: 'Dinazor', icon: '🦖', cost: 50000, popularity: 60000 },
  { name: 'Şampiyon', icon: '🏆', cost: 80000, popularity: 100000 },
  { name: 'Kırtasiye', icon: '✏️', cost: 100000, popularity: 200000, durationDays: 20 },
  { name: 'Okul Unvanı', icon: '🎓', cost: 150000, popularity: 300000, durationDays: 20 },
];

export const RANKS = [
  { id: 'fatih', name: 'FATİH', min: 2300, bg: 'bg-red-950/50', border: 'border-red-500', color: 'text-red-500', gradient: 'from-red-900 to-red-600', icon: 'emoji_events' },
  { id: 'asotoritesi15', name: 'AS OTORİTESİ 15', min: 2200, bg: 'bg-rose-950/50', border: 'border-rose-600', color: 'text-rose-300', gradient: 'from-rose-950 to-rose-700', icon: 'verified' },
  { id: 'asotoritesi14', name: 'AS OTORİTESİ 14', min: 2000, bg: 'bg-rose-950/50', border: 'border-rose-600', color: 'text-rose-300', gradient: 'from-rose-950 to-rose-700', icon: 'verified' },
  { id: 'asotoritesi13', name: 'AS OTORİTESİ 13', min: 1900, bg: 'bg-rose-950/50', border: 'border-rose-600', color: 'text-rose-300', gradient: 'from-rose-950 to-rose-700', icon: 'verified' },
  { id: 'asotoritesi12', name: 'AS OTORİTESİ 12', min: 1800, bg: 'bg-rose-950/50', border: 'border-rose-600', color: 'text-rose-300', gradient: 'from-rose-950 to-rose-700', icon: 'verified' },
  { id: 'asotoritesi11', name: 'AS OTORİTESİ 11', min: 1700, bg: 'bg-rose-950/50', border: 'border-rose-600', color: 'text-rose-300', gradient: 'from-rose-950 to-rose-700', icon: 'verified' },
  { id: 'asotoritesi10', name: 'AS OTORİTESİ 10', min: 1640, bg: 'bg-rose-950/50', border: 'border-rose-600', color: 'text-rose-300', gradient: 'from-rose-950 to-rose-700', icon: 'verified' },
  { id: 'asustasi9', name: 'AS USTASI 9', min: 1599, bg: 'bg-pink-950/50', border: 'border-pink-600', color: 'text-pink-400', gradient: 'from-pink-900 to-pink-600', icon: 'stars' },
  { id: 'asustasi8', name: 'AS USTASI 8', min: 1550, bg: 'bg-pink-950/50', border: 'border-pink-600', color: 'text-pink-400', gradient: 'from-pink-900 to-pink-600', icon: 'stars' },
  { id: 'asustasi7', name: 'AS USTASI 7', min: 1500, bg: 'bg-pink-950/50', border: 'border-pink-600', color: 'text-pink-400', gradient: 'from-pink-900 to-pink-600', icon: 'stars' },
  { id: 'asustasi6', name: 'AS USTASI 6', min: 1470, bg: 'bg-pink-950/50', border: 'border-pink-600', color: 'text-pink-400', gradient: 'from-pink-900 to-pink-600', icon: 'stars' },
  { id: 'as5', name: 'AS 5', min: 1400, bg: 'bg-amber-950/50', border: 'border-amber-600', color: 'text-amber-400', gradient: 'from-amber-900 to-amber-600', icon: 'star' },
  { id: 'as4', name: 'AS 4', min: 1350, bg: 'bg-amber-950/50', border: 'border-amber-600', color: 'text-amber-400', gradient: 'from-amber-900 to-amber-600', icon: 'star' },
  { id: 'as3', name: 'AS 3', min: 1300, bg: 'bg-amber-950/50', border: 'border-amber-600', color: 'text-amber-400', gradient: 'from-amber-900 to-amber-600', icon: 'star' },
  { id: 'as2', name: 'AS 2', min: 1200, bg: 'bg-amber-950/50', border: 'border-amber-600', color: 'text-amber-400', gradient: 'from-amber-900 to-amber-600', icon: 'star' },
  { id: 'as1', name: 'AS 1', min: 1100, bg: 'bg-amber-950/50', border: 'border-amber-600', color: 'text-amber-400', gradient: 'from-amber-900 to-amber-600', icon: 'star' },
  { id: 'tac1', name: 'TAÇ 1', min: 1000, bg: 'bg-orange-950/50', border: 'border-orange-600', color: 'text-orange-400', gradient: 'from-orange-900 to-orange-600', icon: 'military_tech' },
  { id: 'tac2', name: 'TAÇ 2', min: 950, bg: 'bg-orange-950/50', border: 'border-orange-600', color: 'text-orange-400', gradient: 'from-orange-900 to-orange-600', icon: 'military_tech' },
  { id: 'tac3', name: 'TAÇ 3', min: 900, bg: 'bg-orange-950/50', border: 'border-orange-600', color: 'text-orange-400', gradient: 'from-orange-900 to-orange-600', icon: 'military_tech' },
  { id: 'tac4', name: 'TAÇ 4', min: 850, bg: 'bg-orange-950/50', border: 'border-orange-600', color: 'text-orange-400', gradient: 'from-orange-900 to-orange-600', icon: 'military_tech' },
  { id: 'tac5', name: 'TAÇ 5', min: 800, bg: 'bg-orange-950/50', border: 'border-orange-600', color: 'text-orange-400', gradient: 'from-orange-900 to-orange-600', icon: 'military_tech' },
  { id: 'elmas1', name: 'ELMAS 1', min: 760, bg: 'bg-blue-950/50', border: 'border-blue-600', color: 'text-blue-400', gradient: 'from-blue-900 to-blue-600', icon: 'diamond' },
  { id: 'elmas2', name: 'ELMAS 2', min: 700, bg: 'bg-blue-950/50', border: 'border-blue-600', color: 'text-blue-400', gradient: 'from-blue-900 to-blue-600', icon: 'diamond' },
  { id: 'elmas3', name: 'ELMAS 3', min: 640, bg: 'bg-blue-950/50', border: 'border-blue-600', color: 'text-blue-400', gradient: 'from-blue-900 to-blue-600', icon: 'diamond' },
  { id: 'elmas4', name: 'ELMAS 4', min: 580, bg: 'bg-blue-950/50', border: 'border-blue-600', color: 'text-blue-400', gradient: 'from-blue-900 to-blue-600', icon: 'diamond' },
  { id: 'elmas5', name: 'ELMAS 5', min: 510, bg: 'bg-blue-950/50', border: 'border-blue-600', color: 'text-blue-400', gradient: 'from-blue-900 to-blue-600', icon: 'diamond' },
  { id: 'platin1', name: 'PLATİN 1', min: 470, bg: 'bg-sky-950/50', border: 'border-sky-600', color: 'text-sky-400', gradient: 'from-sky-900 to-sky-600', icon: 'workspace_premium' },
  { id: 'platin2', name: 'PLATİN 2', min: 400, bg: 'bg-sky-950/50', border: 'border-sky-600', color: 'text-sky-400', gradient: 'from-sky-900 to-sky-600', icon: 'workspace_premium' },
  { id: 'platin3', name: 'PLATİN 3', min: 380, bg: 'bg-sky-950/50', border: 'border-sky-600', color: 'text-sky-400', gradient: 'from-sky-900 to-sky-600', icon: 'workspace_premium' },
  { id: 'platin4', name: 'PLATİN 4', min: 300, bg: 'bg-sky-950/50', border: 'border-sky-600', color: 'text-sky-400', gradient: 'from-sky-900 to-sky-600', icon: 'workspace_premium' },
  { id: 'platin5', name: 'PLATİN 5', min: 280, bg: 'bg-sky-950/50', border: 'border-sky-600', color: 'text-sky-400', gradient: 'from-sky-900 to-sky-600', icon: 'workspace_premium' },
  { id: 'altin1', name: 'ALTIN 1', min: 200, bg: 'bg-yellow-950/50', border: 'border-yellow-600', color: 'text-yellow-400', gradient: 'from-yellow-900 to-yellow-600', icon: 'emoji_events' },
  { id: 'altin2', name: 'ALTIN 2', min: 180, bg: 'bg-yellow-950/50', border: 'border-yellow-600', color: 'text-yellow-400', gradient: 'from-yellow-900 to-yellow-600', icon: 'emoji_events' },
  { id: 'altin3', name: 'ALTIN 3', min: 160, bg: 'bg-yellow-950/50', border: 'border-yellow-600', color: 'text-yellow-400', gradient: 'from-yellow-900 to-yellow-600', icon: 'emoji_events' },
  { id: 'altin4', name: 'ALTIN 4', min: 100, bg: 'bg-yellow-950/50', border: 'border-yellow-600', color: 'text-yellow-400', gradient: 'from-yellow-900 to-yellow-600', icon: 'emoji_events' },
  { id: 'altin5', name: 'ALTIN 5', min: 50, bg: 'bg-yellow-950/50', border: 'border-yellow-600', color: 'text-yellow-400', gradient: 'from-yellow-900 to-yellow-600', icon: 'emoji_events' },
  { id: 'caylak', name: 'Çaylak', min: 20, bg: 'bg-stone-900/50', border: 'border-stone-600', color: 'text-stone-400', gradient: 'from-stone-900 to-stone-600', icon: 'person' },
];

export const getRank = (total: number) => {
  return RANKS.find(r => total >= r.min) || RANKS[RANKS.length - 1];
};

export const capitalize = (str: string) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const LEVELS = [
  { level: 1, minQuestions: 20 },
  { level: 2, minQuestions: 40 },
  { level: 3, minQuestions: 60 },
  { level: 4, minQuestions: 90 },
  { level: 5, minQuestions: 100 },
  { level: 6, minQuestions: 140 },
  { level: 7, minQuestions: 180 },
  { level: 8, minQuestions: 220 },
  { level: 9, minQuestions: 250 },
  { level: 10, minQuestions: 300 },
  { level: 11, minQuestions: 350 },
  { level: 12, minQuestions: 360 },
  { level: 13, minQuestions: 400 },
  { level: 14, minQuestions: 480 },
  { level: 15, minQuestions: 530 },
  { level: 16, minQuestions: 580 },
  { level: 17, minQuestions: 660 },
  { level: 18, minQuestions: 770 },
  { level: 19, minQuestions: 800 },
  { level: 20, minQuestions: 900 },
  { level: 21, minQuestions: 1000 },
  { level: 22, minQuestions: 1200 },
  { level: 23, minQuestions: 1500 },
  { level: 24, minQuestions: 1900 },
  { level: 25, minQuestions: 2200 },
  { level: 26, minQuestions: 2800 },
  { level: 27, minQuestions: 3800 },
  { level: 28, minQuestions: 4500 },
  { level: 29, minQuestions: 5900 },
  { level: 30, minQuestions: 7000 },
  { level: 31, minQuestions: 7900 },
  { level: 32, minQuestions: 9000 },
  { level: 33, minQuestions: 10000 },
  { level: 34, minQuestions: 12000 },
  { level: 35, minQuestions: 15000 },
  { level: 36, minQuestions: 18000 },
  { level: 37, minQuestions: 20000 },
  { level: 38, minQuestions: 22000 },
  { level: 39, minQuestions: 26000 },
  { level: 40, minQuestions: 30000 },
  { level: 41, minQuestions: 36000 },
  { level: 42, minQuestions: 40000 },
  { level: 43, minQuestions: 47000 },
  { level: 44, minQuestions: 50000 },
  { level: 45, minQuestions: 55000 },
  { level: 46, minQuestions: 60000 },
  { level: 47, minQuestions: 70000 },
  { level: 48, minQuestions: 80000 },
  { level: 49, minQuestions: 90000 },
  { level: 50, minQuestions: 100000 },
];

export const getLevel = (total: number) => {
  return LEVELS.slice().reverse().find(l => total >= l.minQuestions)?.level || 1;
};

export const getLevelStyle = (level: number) => {
  if (level >= 45) return { bg: 'bg-red-900/20', text: 'text-red-400', border: 'border-red-500/30', animation: 'animate-pulse' };
  if (level >= 40) return { bg: 'bg-purple-900/20', text: 'text-purple-400', border: 'border-purple-500/30', animation: 'animate-pulse' };
  if (level >= 35) return { bg: 'bg-rose-900/20', text: 'text-rose-400', border: 'border-rose-500/30', animation: '' };
  if (level >= 30) return { bg: 'bg-indigo-900/20', text: 'text-indigo-400', border: 'border-indigo-500/30', animation: '' };
  if (level >= 25) return { bg: 'bg-sky-900/20', text: 'text-sky-400', border: 'border-sky-500/30', animation: '' };
  if (level >= 20) return { bg: 'bg-emerald-900/20', text: 'text-emerald-400', border: 'border-emerald-500/30', animation: '' };
  if (level >= 15) return { bg: 'bg-teal-900/20', text: 'text-teal-400', border: 'border-teal-500/30', animation: '' };
  if (level >= 10) return { bg: 'bg-blue-900/20', text: 'text-blue-400', border: 'border-blue-500/30', animation: '' };
  if (level >= 5) return { bg: 'bg-amber-900/20', text: 'text-amber-400', border: 'border-amber-500/30', animation: '' };
  return { bg: 'bg-slate-900/20', text: 'text-slate-400', border: 'border-slate-500/30', animation: '' };
};

export const FRAMES = [
  { id: 'frame_none', name: 'Standart', color: 'border-white/10', cost: 0, animation: '' },
];

export const DIAMOND_PACKAGES = [
  { amount: 100, price: 40 },
  { amount: 300, price: 100 },
  { amount: 500, price: 200 },
  { amount: 1000, price: 400 },
  { amount: 5000, price: 1000 },
  { amount: 10000, price: 2000 },
  { amount: 20000, price: 4000 },
  { amount: 40000, price: 10000 },
  { amount: 80000, price: 3000 },
  { amount: 100000, price: 50000 },
];

export const SPECIAL_DIAMOND_PACKAGE = {
  amount: 80000,
  price: 3000,
  startDate: new Date().getTime(),
  durationDays: 25
};

export const POPULARITY_LEVELS = [
  { level: 1, min: 0 },
  { level: 2, min: 100 },
  { level: 3, min: 200 },
  { level: 4, min: 400 },
  { level: 5, min: 600 },
  { level: 6, min: 800 },
  { level: 7, min: 1000 },
  { level: 8, min: 3000 },
  { level: 9, min: 10000 },
  { level: 10, min: 20000 },
  { level: 11, min: 40000 },
  { level: 12, min: 60000 },
  { level: 13, min: 70000 },
  { level: 14, min: 80000 },
  { level: 15, min: 90000 },
  { level: 16, min: 100000 },
  { level: 17, min: 140000 },
  { level: 18, min: 200000 },
  { level: 19, min: 250000 },
  { level: 20, min: 300000 },
  { level: 21, min: 400000 },
  { level: 22, min: 500000 },
  { level: 23, min: 600000 },
  { level: 24, min: 800000 },
  { level: 25, min: 1000000 },
  { level: 26, min: 1200000 },
  { level: 27, min: 1400000 },
  { level: 28, min: 1700000 },
  { level: 29, min: 2000000 },
  { level: 30, min: 3000000 },
  { level: 31, min: 4000000 },
  { level: 32, min: 6000000 },
  { level: 33, min: 8000000 },
  { level: 34, min: 10000000 },
  { level: 35, min: 15000000 },
  { level: 36, min: 17000000 },
  { level: 37, min: 20000000 },
  { level: 38, min: 25000000 },
  { level: 39, min: 27000000 },
  { level: 40, min: 30000000 },
  { level: 41, min: 32000000 },
];

export const getPopularityLevel = (popularity: number) => {
  const level = POPULARITY_LEVELS.slice().reverse().find(l => popularity >= l.min)?.level || 1;
  return Math.min(level, 41);
};

export const getPopularityProgress = (popularity: number) => {
    const level = getPopularityLevel(popularity);
    if (level >= 41) return 100;
    const currentLevelMin = POPULARITY_LEVELS.find(l => l.level === level)?.min || 0;
    const nextLevelMin = POPULARITY_LEVELS.find(l => l.level === level + 1)?.min || popularity;
    const range = nextLevelMin - currentLevelMin;
    if (range === 0) return 100;
    return Math.min(100, Math.max(0, ((popularity - currentLevelMin) / range) * 100));
};
