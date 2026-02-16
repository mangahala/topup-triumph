export interface GamePackage {
  id: string;
  diamonds: number;
  price: number;
  label: string;
  popular?: boolean;
}

export interface Game {
  id: string;
  name: string;
  slug: string;
  currency: string;
  image: string;
  color: string;
  packages: GamePackage[];
}

export const games: Game[] = [
  {
    id: "free-fire",
    name: "Free Fire",
    slug: "free-fire",
    currency: "Diamonds",
    image: "https://images.unsplash.com/photo-1542751371-adc38448a05e?w=400&h=500&fit=crop",
    color: "from-orange-500 to-red-600",
    packages: [
      { id: "ff-100", diamonds: 100, price: 120, label: "100 💎" },
      { id: "ff-310", diamonds: 310, price: 350, label: "310 💎" },
      { id: "ff-520", diamonds: 520, price: 580, label: "520 💎", popular: true },
      { id: "ff-1060", diamonds: 1060, price: 1100, label: "1060 💎" },
      { id: "ff-2180", diamonds: 2180, price: 2200, label: "2180 💎" },
      { id: "ff-5600", diamonds: 5600, price: 5500, label: "5600 💎" },
    ],
  },
  {
    id: "pubg",
    name: "PUBG Mobile",
    slug: "pubg-mobile",
    currency: "UC",
    image: "https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=400&h=500&fit=crop",
    color: "from-yellow-500 to-orange-600",
    packages: [
      { id: "pubg-60", diamonds: 60, price: 99, label: "60 UC" },
      { id: "pubg-325", diamonds: 325, price: 499, label: "325 UC" },
      { id: "pubg-660", diamonds: 660, price: 999, label: "660 UC", popular: true },
      { id: "pubg-1800", diamonds: 1800, price: 2500, label: "1800 UC" },
      { id: "pubg-3850", diamonds: 3850, price: 4999, label: "3850 UC" },
    ],
  },
  {
    id: "mobile-legends",
    name: "Mobile Legends",
    slug: "mobile-legends",
    currency: "Diamonds",
    image: "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=400&h=500&fit=crop",
    color: "from-blue-500 to-purple-600",
    packages: [
      { id: "ml-86", diamonds: 86, price: 150, label: "86 💎" },
      { id: "ml-172", diamonds: 172, price: 290, label: "172 💎" },
      { id: "ml-257", diamonds: 257, price: 430, label: "257 💎", popular: true },
      { id: "ml-706", diamonds: 706, price: 1100, label: "706 💎" },
      { id: "ml-2195", diamonds: 2195, price: 3300, label: "2195 💎" },
    ],
  },
  {
    id: "genshin",
    name: "Genshin Impact",
    slug: "genshin-impact",
    currency: "Genesis Crystals",
    image: "https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=500&fit=crop",
    color: "from-cyan-400 to-blue-500",
    packages: [
      { id: "gi-60", diamonds: 60, price: 120, label: "60 💠" },
      { id: "gi-330", diamonds: 330, price: 600, label: "330 💠" },
      { id: "gi-1090", diamonds: 1090, price: 1900, label: "1090 💠", popular: true },
      { id: "gi-2240", diamonds: 2240, price: 3800, label: "2240 💠" },
      { id: "gi-3880", diamonds: 3880, price: 6500, label: "3880 💠" },
    ],
  },
  {
    id: "valorant",
    name: "Valorant",
    slug: "valorant",
    currency: "VP",
    image: "https://images.unsplash.com/photo-1552820728-8b83bb6b2b28?w=400&h=500&fit=crop",
    color: "from-red-500 to-pink-600",
    packages: [
      { id: "val-475", diamonds: 475, price: 499, label: "475 VP" },
      { id: "val-1000", diamonds: 1000, price: 999, label: "1000 VP", popular: true },
      { id: "val-2050", diamonds: 2050, price: 1999, label: "2050 VP" },
      { id: "val-3650", diamonds: 3650, price: 3499, label: "3650 VP" },
      { id: "val-5350", diamonds: 5350, price: 4999, label: "5350 VP" },
    ],
  },
  {
    id: "clash-of-clans",
    name: "Clash of Clans",
    slug: "clash-of-clans",
    currency: "Gems",
    image: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=400&h=500&fit=crop",
    color: "from-green-500 to-emerald-600",
    packages: [
      { id: "coc-80", diamonds: 80, price: 99, label: "80 💚" },
      { id: "coc-500", diamonds: 500, price: 499, label: "500 💚" },
      { id: "coc-1200", diamonds: 1200, price: 999, label: "1200 💚", popular: true },
      { id: "coc-2500", diamonds: 2500, price: 1999, label: "2500 💚" },
      { id: "coc-6500", diamonds: 6500, price: 4999, label: "6500 💚" },
    ],
  },
];

export interface PaymentMethod {
  id: string;
  name: string;
  icon: string;
  qrImage: string;
}

export const paymentMethods: PaymentMethod[] = [
  { id: "esewa", name: "eSewa", icon: "💚", qrImage: "https://via.placeholder.com/300x300?text=eSewa+QR" },
  { id: "khalti", name: "Khalti", icon: "💜", qrImage: "https://via.placeholder.com/300x300?text=Khalti+QR" },
  { id: "bank", name: "Bank Transfer", icon: "🏦", qrImage: "https://via.placeholder.com/300x300?text=Bank+QR" },
];
