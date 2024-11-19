export type GameState = 'BONUS_SELECT' | 'FARM' | 'MARKET' | 'SWAP' | 'REFERRALS';

export interface Bonus {
  id: number;
  name: string;
  description: string;
}

export interface Crop {
  slot: number;
  type: string;
  plantedAt: number;
  stage: number;
}

export const bonuses: Bonus[] = [
  { id: 1, name: 'Speed', description: 'Grow crops 20% faster' },
  { id: 2, name: 'More farms', description: '20% more farmland' },
  { id: 3, name: 'Higher price', description: '20% more profit' },
]; 