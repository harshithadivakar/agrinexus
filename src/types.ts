export type ActiveScreen =
  | 'welcome'
  | 'setup'
  | 'pairing'
  | 'plant_choice'
  | 'garden'
  | 'diagnose'
  | 'learn'
  | 'support';

export interface UserProfile {
  email: string;
  name: string;
  avatarUrl: string;
}

export interface Plant {
  id: string;
  name: string;
  scientificName?: string;
  description: string;
  imageUrl: string;
  growingDaysMax: number;
  harvestOffsetDays: number;
  waterOptimalMsg: string;
  phOptimalMsg: string;
}

export interface GardenState {
  isPaired: boolean;
  pairedDeviceId: string | null;
  setupCompleted: boolean;
  setupStep: number; // 1 to 5
  selectedPlantId: string | null;
  setupDate: string | null; // ISO string
  waterLevel: 'optimal' | 'low' | 'critical';
  lightStatus: 'on' | 'off' | 'on_schedule';
  phStatus: 'steady' | 'high' | 'low';
}

export const APPROVED_PLANTS: Plant[] = [
  {
    id: 'sweet_basil',
    name: 'Sweet Basil',
    scientificName: 'Ocimum basilicum',
    description: 'Aromatic and easy to grow',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBD3kr8SnQN5ZigEev9PUad-apeU8aX0VOfUjulsY-qGiDMB2HP565tVjPyNyiygzw9ckDSu7h5uWoClMUD-AJm80KII8BYiErHPiQgSL567t68V6b8uBT6rKTAbNPnueALU_qbgKtJnt8K5fEpxjuKakrKD7X3fZ8pB4YVUzAH3_r6YCzPt0j4r6fGOyEJ9OnjNbGhPq9B3vYdc843EG7qBwizIH10H6ocV3FpSkwmT74k3GFNC1PMtgANZ6cukADrE2JBTR5qAx72',
    growingDaysMax: 30,
    harvestOffsetDays: 18,
    waterOptimalMsg: 'Level is optimal',
    phOptimalMsg: '6.2 pH balanced'
  },
  {
    id: 'mint',
    name: 'Mint',
    scientificName: 'Mentha',
    description: 'Fresh and vigorous',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuApMExSviZWEXP_lN_N4ip2FakCNvuDHVXYWCHXc-N67fPbJM6hhXBrh0yPWDuu5cm3vCBhOnuJQGo5TDvgZowYX2OaA-klePq0pdpsSyy7qTWufE4vRExilkSnQrXIchUbwt7SLXABui47UHwRUqkiYJbY8-JuHPTpB4I8dc818At0otYLdZZ1hVlbGX99ES802wWZSn1rqkIIqxx12OFFU-feYlUCxpx4T4M-qxCWErPO0-qr5kpVJHfgYIcDNJ2ef9NrgIZYh8AG',
    growingDaysMax: 35,
    harvestOffsetDays: 20,
    waterOptimalMsg: 'Level is optimal',
    phOptimalMsg: '6.5 pH balanced'
  },
  {
    id: 'butterhead_lettuce',
    name: 'Butterhead Lettuce',
    scientificName: 'Lactuca sativa var. capitata',
    description: 'Crisp and delicious',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBoHWXhdb09Nr4S5FMNoac6H6OhH3qosKOeispOpcJB8iL9jR_NiQoDh6UTZ8C0RS_QmdrYg2Y8i_VVtJLkGX0Nms41QxyJzoit0hYoMyyKE1e2Lmcfa-_1Y9ezxFuzNpFiNx72p3nK9pvNV3ADPqTG04L_FVWuE-x0NJkdDD-VYbt4EZgf_-a1o86VkV34r9eXC0qWQX-bwGltA_3aRDo7iScUSKkul2lF6cn7In8599t5mprDJS4D0DQdNSCxcLjXFim62_vY7Zrx',
    growingDaysMax: 40,
    harvestOffsetDays: 25,
    waterOptimalMsg: 'Level is optimal',
    phOptimalMsg: '6.0 pH balanced'
  },
  {
    id: 'cilantro',
    name: 'Cilantro',
    scientificName: 'Coriandrum sativum',
    description: 'Essential kitchen herb',
    imageUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD5gYjGoSTjpraU8q9nSRR8RUuQ8oqhnLV3aqHjzB30d9KwYn1fhfMOkRlmeHNomSDNLZtekjXo9nGU-o-ZDM8FF435EzdJME7XX5TPwEyjwSdCJtwDAI22ItmtodSrEY4LCMhGwllTJN5P1H60Y-TYXjuALihkzTBcJu62-ZYteXoKFhPU9Q30bD6yYfKtg6uO5UeYj5A2g3pqXyRidsKoxCmUgkhBTd7oQXcskPU3posWyblUvZNoeD6G_gH7xSMP2ADdaZEZ-keS',
    growingDaysMax: 28,
    harvestOffsetDays: 14,
    waterOptimalMsg: 'Level is optimal',
    phOptimalMsg: '6.3 pH balanced'
  }
];
