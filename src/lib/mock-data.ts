// Enhanced data store with localStorage persistence

export type Sport = "Football" | "Cricket" | "Badminton" | "Tennis" | "Basketball";
export type BookingStatus = "Pending" | "Confirmed" | "Cancelled" | "Completed";
export type Role = "customer" | "admin";

export interface Turf {
  id: string;
  name: string;
  sport: Sport;
  description: string;
  location: string;
  pricePerHour: number;
  rating: number;
  reviews: number;
  images: string[];
  image: string; // primary image (backward compat)
  amenities: string[];
  openHour: number;
  closeHour: number;
  featured?: boolean;
  capacity?: number; // max players
  surface?: string; // grass, astro, hardcourt, etc.
}

export interface Booking {
  id: string;
  turfId: string;
  turfName: string;
  customerEmail: string;
  customerName: string;
  date: string;
  startHour: number;
  duration: number;
  total: number;
  status: BookingStatus;
  createdAt: string;
  couponCode?: string;
  discount?: number;
  notes?: string;
  paymentId?: string;
}

export interface User {
  email: string;
  name: string;
  role: Role;
  phone?: string;
  joinedAt?: string;
  totalBookings?: number;
  loyaltyPoints?: number;
}

export interface Review {
  id: string;
  turfId: string;
  customerEmail: string;
  customerName: string;
  rating: number;
  text: string;
  createdAt: string;
  helpful?: number;
}

export interface Notification {
  id: string;
  userEmail: string;
  title: string;
  message: string;
  type: "booking" | "reminder" | "promo" | "system";
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface Coupon {
  code: string;
  discount: number; // percentage
  maxUses: number;
  usedCount: number;
  expiresAt: string;
  sport?: Sport;
  minAmount?: number;
}

const TURF_IMAGES = {
  football1: "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&q=80",
  football2: "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
  football3: "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=800&q=80",
  cricket1: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80",
  cricket2: "https://images.unsplash.com/photo-1624526267942-ab0ff8a3e972?w=800&q=80",
  badminton1: "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=800&q=80",
  badminton2: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80",
  tennis1: "https://images.unsplash.com/photo-1546608235-3310a2494cdf?w=800&q=80",
  tennis2: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80",
  basketball1: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=800&q=80",
  basketball2: "https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800&q=80",
};

const SEED_TURFS: Turf[] = [
  {
    id: "t1", name: "Greenfield Arena", sport: "Football",
    description: "Premium FIFA-grade artificial turf with floodlights, perfect for 5-a-side and 7-a-side matches. Our pitch features the latest generation 3G synthetic grass with rubber crumb infill, providing the perfect playing surface regardless of weather conditions.",
    location: "Bandra West, Mumbai", pricePerHour: 1200, rating: 4.8, reviews: 142,
    image: TURF_IMAGES.football1,
    images: [TURF_IMAGES.football1, TURF_IMAGES.football2, TURF_IMAGES.football3],
    amenities: ["Floodlights", "Changing Rooms", "Parking", "Drinking Water", "First Aid", "CCTV"],
    openHour: 6, closeHour: 23, featured: true, capacity: 14, surface: "3G Artificial Grass",
  },
  {
    id: "t2", name: "Sixers Cricket Ground", sport: "Cricket",
    description: "Full-size cricket pitch with practice nets and turf wicket. Ideal for box cricket and tournaments. Features a professionally prepared pitch with red soil and grass surface, practice nets for batting, and a scoreboard.",
    location: "Andheri East, Mumbai", pricePerHour: 1500, rating: 4.7, reviews: 98,
    image: TURF_IMAGES.cricket1,
    images: [TURF_IMAGES.cricket1, TURF_IMAGES.cricket2],
    amenities: ["Practice Nets", "Floodlights", "Cafeteria", "Parking", "Scoreboard"],
    openHour: 6, closeHour: 22, featured: true, capacity: 22, surface: "Natural Turf",
  },
  {
    id: "t3", name: "SmashPoint Badminton", sport: "Badminton",
    description: "Air-conditioned wooden courts with professional BWF-standard nets and shuttlecocks available. 4 courts available simultaneously. Features Yonex wooden flooring and professional lighting for optimal visibility.",
    location: "Powai, Mumbai", pricePerHour: 600, rating: 4.9, reviews: 211,
    image: TURF_IMAGES.badminton1,
    images: [TURF_IMAGES.badminton1, TURF_IMAGES.badminton2],
    amenities: ["AC", "Wooden Court", "Equipment Rental", "Locker", "Cafeteria", "Pro Shop"],
    openHour: 7, closeHour: 23, featured: true, capacity: 8, surface: "Wooden Court",
  },
  {
    id: "t4", name: "Ace Tennis Club", sport: "Tennis",
    description: "Hard court tennis facility with coaching available on request. Maintained to ATP standards with high-quality acrylic surface. Professional ball machine available for solo practice sessions.",
    location: "Juhu, Mumbai", pricePerHour: 900, rating: 4.6, reviews: 76,
    image: TURF_IMAGES.tennis1,
    images: [TURF_IMAGES.tennis1, TURF_IMAGES.tennis2],
    amenities: ["Coaching", "Floodlights", "Pro Shop", "Parking", "Ball Machine"],
    openHour: 6, closeHour: 22, capacity: 4, surface: "Acrylic Hard Court",
  },
  {
    id: "t5", name: "HoopsCity Basketball", sport: "Basketball",
    description: "Indoor basketball court with shock-absorbent flooring, regulation rims and electronic scoreboard. Features maple hardwood flooring, NBA-standard hoops, and digital shot clock for competitive play.",
    location: "Lower Parel, Mumbai", pricePerHour: 800, rating: 4.7, reviews: 120,
    image: TURF_IMAGES.basketball1,
    images: [TURF_IMAGES.basketball1, TURF_IMAGES.basketball2],
    amenities: ["Indoor", "Scoreboard", "AC", "Lockers", "Shot Clock", "First Aid"],
    openHour: 7, closeHour: 23, capacity: 10, surface: "Maple Hardwood",
  },
  {
    id: "t6", name: "Victory Football Park", sport: "Football",
    description: "Large 11-a-side ground suitable for league matches with stadium-grade lighting. This full-size professional pitch features natural grass maintained by our groundskeeping team and can accommodate 500 spectators.",
    location: "Navi Mumbai", pricePerHour: 1800, rating: 4.5, reviews: 64,
    image: TURF_IMAGES.football2,
    images: [TURF_IMAGES.football2, TURF_IMAGES.football1, TURF_IMAGES.football3],
    amenities: ["11-a-side", "Stadium Lights", "Cafeteria", "Parking", "Spectator Stands", "Scoreboard"],
    openHour: 6, closeHour: 23, capacity: 22, surface: "Natural Grass",
  },
];

function todayOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const SEED_BOOKINGS: Booking[] = [
  { id: "b1", turfId: "t1", turfName: "Greenfield Arena", customerEmail: "customer@test.com", customerName: "Rahul Sharma", date: todayOffset(0), startHour: 18, duration: 1, total: 1200, status: "Confirmed", createdAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "b2", turfId: "t3", turfName: "SmashPoint Badminton", customerEmail: "customer@test.com", customerName: "Rahul Sharma", date: todayOffset(2), startHour: 20, duration: 1, total: 600, status: "Confirmed", createdAt: new Date(Date.now() - 7200000).toISOString() },
  { id: "b3", turfId: "t2", turfName: "Sixers Cricket Ground", customerEmail: "priya@test.com", customerName: "Priya Patel", date: todayOffset(-2), startHour: 19, duration: 2, total: 3000, status: "Completed", createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: "b4", turfId: "t1", turfName: "Greenfield Arena", customerEmail: "amit@test.com", customerName: "Amit Verma", date: todayOffset(-1), startHour: 17, duration: 1, total: 1200, status: "Completed", createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: "b5", turfId: "t4", turfName: "Ace Tennis Club", customerEmail: "neha@test.com", customerName: "Neha Singh", date: todayOffset(1), startHour: 7, duration: 1, total: 900, status: "Pending", createdAt: new Date(Date.now() - 1800000).toISOString() },
  { id: "b6", turfId: "t5", turfName: "HoopsCity Basketball", customerEmail: "rohan@test.com", customerName: "Rohan Gupta", date: todayOffset(0), startHour: 21, duration: 1, total: 800, status: "Confirmed", createdAt: new Date(Date.now() - 5400000).toISOString() },
  { id: "b7", turfId: "t1", turfName: "Greenfield Arena", customerEmail: "kiran@test.com", customerName: "Kiran Mehta", date: todayOffset(0), startHour: 19, duration: 2, total: 2400, status: "Confirmed", createdAt: new Date(Date.now() - 9000000).toISOString() },
  { id: "b8", turfId: "t6", turfName: "Victory Football Park", customerEmail: "sara@test.com", customerName: "Sara Khan", date: todayOffset(-3), startHour: 18, duration: 2, total: 3600, status: "Completed", createdAt: new Date(Date.now() - 86400000 * 4).toISOString() },
  { id: "b9", turfId: "t2", turfName: "Sixers Cricket Ground", customerEmail: "vikas@test.com", customerName: "Vikas Rao", date: todayOffset(-5), startHour: 20, duration: 1, total: 1500, status: "Completed", createdAt: new Date(Date.now() - 86400000 * 6).toISOString() },
  { id: "b10", turfId: "t3", turfName: "SmashPoint Badminton", customerEmail: "anjali@test.com", customerName: "Anjali Desai", date: todayOffset(-7), startHour: 18, duration: 1, total: 600, status: "Completed", createdAt: new Date(Date.now() - 86400000 * 8).toISOString() },
  { id: "b11", turfId: "t1", turfName: "Greenfield Arena", customerEmail: "customer@test.com", customerName: "Rahul Sharma", date: todayOffset(-4), startHour: 16, duration: 1, total: 1200, status: "Completed", createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: "b12", turfId: "t5", turfName: "HoopsCity Basketball", customerEmail: "customer@test.com", customerName: "Rahul Sharma", date: todayOffset(-10), startHour: 19, duration: 2, total: 1600, status: "Completed", createdAt: new Date(Date.now() - 86400000 * 11).toISOString() },
  { id: "b13", turfId: "t4", turfName: "Ace Tennis Club", customerEmail: "priya@test.com", customerName: "Priya Patel", date: todayOffset(3), startHour: 8, duration: 1, total: 900, status: "Pending", createdAt: new Date(Date.now() - 600000).toISOString() },
  { id: "b14", turfId: "t2", turfName: "Sixers Cricket Ground", customerEmail: "amit@test.com", customerName: "Amit Verma", date: todayOffset(-8), startHour: 14, duration: 2, total: 3000, status: "Completed", createdAt: new Date(Date.now() - 86400000 * 9).toISOString() },
  { id: "b15", turfId: "t6", turfName: "Victory Football Park", customerEmail: "neha@test.com", customerName: "Neha Singh", date: todayOffset(4), startHour: 17, duration: 2, total: 3600, status: "Confirmed", createdAt: new Date(Date.now() - 3000000).toISOString() },
];

const SEED_REVIEWS: Review[] = [
  { id: "r1", turfId: "t1", customerEmail: "aditya@test.com", customerName: "Aditya R.", rating: 5, text: "Excellent surface and well-maintained facilities. Floodlights are top-notch. Will definitely book again!", createdAt: new Date(Date.now() - 86400000 * 5).toISOString(), helpful: 12 },
  { id: "r2", turfId: "t1", customerEmail: "sneha@test.com", customerName: "Sneha K.", rating: 5, text: "Booking was seamless and the staff was super friendly. The pitch is in perfect condition.", createdAt: new Date(Date.now() - 86400000 * 10).toISOString(), helpful: 8 },
  { id: "r3", turfId: "t1", customerEmail: "manish@test.com", customerName: "Manish P.", rating: 4, text: "Great spot for evening matches. Parking can get tight on weekends but overall excellent experience.", createdAt: new Date(Date.now() - 86400000 * 15).toISOString(), helpful: 5 },
  { id: "r4", turfId: "t2", customerEmail: "vikas@test.com", customerName: "Vikas R.", rating: 5, text: "Best cricket ground in the area. Nets are professional quality and the pitch plays true.", createdAt: new Date(Date.now() - 86400000 * 3).toISOString(), helpful: 7 },
  { id: "r5", turfId: "t2", customerEmail: "priya@test.com", customerName: "Priya M.", rating: 4, text: "Good facilities, cafeteria food is decent. Timing management could be better.", createdAt: new Date(Date.now() - 86400000 * 7).toISOString(), helpful: 3 },
  { id: "r6", turfId: "t3", customerEmail: "anjali@test.com", customerName: "Anjali D.", rating: 5, text: "Absolutely love this place! AC works perfectly, courts are immaculate. Best badminton courts in Mumbai.", createdAt: new Date(Date.now() - 86400000 * 2).toISOString(), helpful: 15 },
  { id: "r7", turfId: "t3", customerEmail: "rahul@test.com", customerName: "Rahul S.", rating: 5, text: "Equipment rental is available and affordable. The wooden court provides excellent grip.", createdAt: new Date(Date.now() - 86400000 * 4).toISOString(), helpful: 9 },
  { id: "r8", turfId: "t4", customerEmail: "neha@test.com", customerName: "Neha S.", rating: 4, text: "Beautiful court, coach is very professional. Ball machine is a great feature for practice.", createdAt: new Date(Date.now() - 86400000 * 6).toISOString(), helpful: 6 },
  { id: "r9", turfId: "t5", customerEmail: "rohan@test.com", customerName: "Rohan G.", rating: 5, text: "Indoor courts with great AC. Shot clock makes matches feel professional. Highly recommend!", createdAt: new Date(Date.now() - 86400000 * 1).toISOString(), helpful: 11 },
  { id: "r10", turfId: "t6", customerEmail: "sara@test.com", customerName: "Sara K.", rating: 4, text: "Great stadium feel with the stands. Perfect for league matches. Grass is well-maintained.", createdAt: new Date(Date.now() - 86400000 * 8).toISOString(), helpful: 4 },
];

const SEED_COUPONS: Coupon[] = [
  { code: "FIRST20", discount: 20, maxUses: 100, usedCount: 45, expiresAt: new Date(Date.now() + 86400000 * 30).toISOString(), minAmount: 500 },
  { code: "WEEKEND10", discount: 10, maxUses: 200, usedCount: 120, expiresAt: new Date(Date.now() + 86400000 * 15).toISOString() },
  { code: "FOOTBALL15", discount: 15, maxUses: 50, usedCount: 12, expiresAt: new Date(Date.now() + 86400000 * 7).toISOString(), sport: "Football" },
];

const SEED_NOTIFICATIONS: Notification[] = [
  { id: "n1", userEmail: "customer@test.com", title: "Booking Confirmed!", message: "Your booking at Greenfield Arena for today at 6:00 PM is confirmed.", type: "booking", read: false, createdAt: new Date(Date.now() - 3600000).toISOString(), link: "/my-bookings" },
  { id: "n2", userEmail: "customer@test.com", title: "Match Reminder", message: "You have a badminton session at SmashPoint Badminton in 2 days.", type: "reminder", read: false, createdAt: new Date(Date.now() - 7200000).toISOString(), link: "/my-bookings" },
  { id: "n3", userEmail: "customer@test.com", title: "Weekend Special Offer!", message: "Get 10% off all bookings this weekend. Use code WEEKEND10.", type: "promo", read: true, createdAt: new Date(Date.now() - 86400000).toISOString() },
];

const KEYS = {
  TURFS: "turfly:turfs",
  BOOKINGS: "turfly:bookings",
  USER: "turfly:user",
  REVIEWS: "turfly:reviews",
  NOTIFICATIONS: "turfly:notifications",
  COUPONS: "turfly:coupons",
  FAVORITES: "turfly:favorites",
};

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write<T>(key: string, value: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

export const store = {
  getTurfs(): Turf[] {
    const t = read<Turf[]>(KEYS.TURFS, []);
    if (!t.length) { write(KEYS.TURFS, SEED_TURFS); return SEED_TURFS; }
    return t;
  },
  saveTurfs(t: Turf[]) { write(KEYS.TURFS, t); },

  getBookings(): Booking[] {
    const b = read<Booking[]>(KEYS.BOOKINGS, []);
    if (!b.length) { write(KEYS.BOOKINGS, SEED_BOOKINGS); return SEED_BOOKINGS; }
    return b;
  },
  saveBookings(b: Booking[]) { write(KEYS.BOOKINGS, b); },

  getUser(): User | null { return read<User | null>(KEYS.USER, null); },
  setUser(u: User | null) { write(KEYS.USER, u); },

  getReviews(): Review[] {
    const r = read<Review[]>(KEYS.REVIEWS, []);
    if (!r.length) { write(KEYS.REVIEWS, SEED_REVIEWS); return SEED_REVIEWS; }
    return r;
  },
  saveReviews(r: Review[]) { write(KEYS.REVIEWS, r); },

  getNotifications(email: string): Notification[] {
    const n = read<Notification[]>(KEYS.NOTIFICATIONS, []);
    if (!n.length) { write(KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS); return SEED_NOTIFICATIONS.filter(x => x.userEmail === email); }
    return n.filter(x => x.userEmail === email);
  },
  saveNotifications(n: Notification[]) {
    const all = read<Notification[]>(KEYS.NOTIFICATIONS, []);
    const others = all.filter(x => !n.some(y => y.id === x.id));
    write(KEYS.NOTIFICATIONS, [...others, ...n]);
  },
  markNotificationsRead(email: string) {
    const all = read<Notification[]>(KEYS.NOTIFICATIONS, []);
    write(KEYS.NOTIFICATIONS, all.map(n => n.userEmail === email ? { ...n, read: true } : n));
  },

  getCoupons(): Coupon[] {
    const c = read<Coupon[]>(KEYS.COUPONS, []);
    if (!c.length) { write(KEYS.COUPONS, SEED_COUPONS); return SEED_COUPONS; }
    return c;
  },
  validateCoupon(code: string, amount: number, sport?: Sport): Coupon | null {
    const coupons = this.getCoupons();
    const c = coupons.find(x => x.code === code.toUpperCase() && x.usedCount < x.maxUses && new Date(x.expiresAt) > new Date());
    if (!c) return null;
    if (c.minAmount && amount < c.minAmount) return null;
    if (c.sport && c.sport !== sport) return null;
    return c;
  },

  getFavorites(email: string): string[] {
    const f = read<Record<string, string[]>>(KEYS.FAVORITES, {});
    return f[email] || [];
  },
  toggleFavorite(email: string, turfId: string): boolean {
    const f = read<Record<string, string[]>>(KEYS.FAVORITES, {});
    const curr = f[email] || [];
    const isFav = curr.includes(turfId);
    f[email] = isFav ? curr.filter(x => x !== turfId) : [...curr, turfId];
    write(KEYS.FAVORITES, f);
    return !isFav;
  },

  reset() {
    write(KEYS.TURFS, SEED_TURFS);
    write(KEYS.BOOKINGS, SEED_BOOKINGS);
    write(KEYS.REVIEWS, SEED_REVIEWS);
    write(KEYS.NOTIFICATIONS, SEED_NOTIFICATIONS);
    write(KEYS.COUPONS, SEED_COUPONS);
  },
};

export function isSlotBooked(bookings: Booking[], turfId: string, date: string, hour: number): Booking | undefined {
  return bookings.find(
    (b) =>
      b.turfId === turfId &&
      b.date === date &&
      b.status !== "Cancelled" &&
      hour >= b.startHour &&
      hour < b.startHour + b.duration,
  );
}

export function formatINR(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

export function getSportColor(sport: Sport): string {
  const colors: Record<Sport, string> = {
    Football: "sport-badge-football",
    Cricket: "sport-badge-cricket",
    Badminton: "sport-badge-badminton",
    Tennis: "sport-badge-tennis",
    Basketball: "sport-badge-basketball",
  };
  return colors[sport];
}

export function getSportIcon(sport: Sport): string {
  const icons: Record<Sport, string> = {
    Football: "⚽",
    Cricket: "🏏",
    Badminton: "🏸",
    Tennis: "🎾",
    Basketball: "🏀",
  };
  return icons[sport];
}

export function formatHour(h: number): string {
  const ampm = h >= 12 ? "PM" : "AM";
  const hh = h % 12 === 0 ? 12 : h % 12;
  return `${hh}:00 ${ampm}`;
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
}

export function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
