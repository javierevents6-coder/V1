import { DressOption } from '../types/booking';

export interface MaternityPackageType {
  id: string;
  title: string;
  price: string;
  duration: string;
  description: string;
  features: string[];
  image: string;
  looks: number;
}

export const maternityPackages: MaternityPackageType[] = [
  {
    id: 'maternity-gold',
    title: 'GOLD',
    price: 'R$ 200',
    duration: '30 minutos',
    description: 'Sessão rápida em estúdio para registrar com carinho este momento único.',
    features: [
      'Figurinos: 1',
      'Fotos digitais: 10',
      'Participantes: Apenas 2 pessoas + filhos',
      'Local: Apenas no estúdio',
      'Maquiagem adicional: R$ 80'
    ],
    image: 'https://images.pexels.com/photos/4253831/pexels-photo-4253831.jpeg?auto=compress&cs=tinysrgb&w=1600',
    looks: 1
  },
  {
    id: 'maternity-platinum',
    title: 'PLATINUM',
    price: 'R$ 400',
    duration: '1 hora 30 minutos',
    description: 'Sessão completa com maior variedade de looks, podendo ser externa ou em estúdio.',
    features: [
      'Figurinos: 3',
      'Fotos digitais: 30',
      'Participantes: Família inteira pode participar',
      'Maquiagem: Inclusa',
      'Local: Externas ou estúdio',
      'Maquiagem adicional: R$ 80'
    ],
    image: 'https://images.pexels.com/photos/3951843/pexels-photo-3951843.jpeg?auto=compress&cs=tinysrgb&w=1600',
    looks: 3
  },
  {
    id: 'maternity-diamond',
    title: 'DIAMOND',
    price: 'R$ 250',
    duration: 'Até 45 minutos',
    description: 'Sessão dinâmica com foco em fotos externas ou em estúdio, incluindo a família.',
    features: [
      'Figurinos: 2',
      'Fotos digitais: 20',
      'Participantes: Família inteira nas fotos externas',
      'Local: Externas ou estúdio',
      'Maquiagem adicional: R$ 80'
    ],
    image: 'https://images.pexels.com/photos/3992658/pexels-photo-3992658.jpeg?auto=compress&cs=tinysrgb&w=1600',
    looks: 2
  }
];
