// Demo data + in-memory store with localStorage persistence

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
  image: string;
  amenities: string[];
  openHour: number; // 6
  closeHour: number; // 23
}

export interface Booking {
  id: string;
  turfId: string;
  turfName: string;
  customerEmail: string;
  customerName: string;
  date: string; // YYYY-MM-DD
  startHour: number; // 0-23
  duration: number; // hours (0.5, 1, 2)
  total: number;
  status: BookingStatus;
  createdAt: string;
}

export interface User {
  email: string;
  name: string;
  role: Role;
}

const TURF_IMAGES = [
  "https://images.unsplash.com/photo-1459865264687-595d652de67e?w=800&q=80",
  "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=800&q=80",
  "https://images.unsplash.com/photo-1521412644187-c49fa049e84d?w=800&q=80",
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=800&q=80",
  "https://images.unsplash.com/photo-1546608235-3310a2494cdf?w=800&q=80",
  "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80",
];

const SEED_TURFS: Turf[] = [
  { id: "t1", name: "Greenfield Arena", sport: "Football", description: "Premium FIFA-grade artificial turf with floodlights, perfect for 5-a-side and 7-a-side matches.", location: "Bandra West, Mumbai", pricePerHour: 1200, rating: 4.8, reviews: 142, image: TURF_IMAGES[0], amenities: ["Floodlights","Changing Rooms","Parking","Drinking Water","First Aid"], openHour: 6, closeHour: 23 },
  { id: "t2", name: "Sixers Cricket Ground", sport: "Cricket", description: "Full-size cricket pitch with practice nets and turf wicket. Ideal for box cricket and tournaments.", location: "Andheri East, Mumbai", pricePerHour: 1500, rating: 4.7, reviews: 98, image: TURF_IMAGES[1], amenities: ["Practice Nets","Floodlights","Cafeteria","Parking"], openHour: 6, closeHour: 22 },
  { id: "t3", name: "SmashPoint Badminton", sport: "Badminton", description: "Air-conditioned wooden courts with professional BWF-standard nets and shuttlecocks available.", location: "Powai, Mumbai", pricePerHour: 600, rating: 4.9, reviews: 211, image: TURF_IMAGES[2], amenities: ["AC","Wooden Court","Equipment Rental","Locker"], openHour: 7, closeHour: 23 },
  { id: "t4", name: "Ace Tennis Club", sport: "Tennis", description: "Hard court tennis facility with coaching available on request. Maintained to ATP standards.", location: "Juhu, Mumbai", pricePerHour: 900, rating: 4.6, reviews: 76, image: TURF_IMAGES[3], amenities: ["Coaching","Floodlights","Pro Shop","Parking"], openHour: 6, closeHour: 22 },
  { id: "t5", name: "HoopsCity Basketball", sport: "Basketball", description: "Indoor basketball court with shock-absorbent flooring, regulation rims and scoreboard.", location: "Lower Parel, Mumbai", pricePerHour: 800, rating: 4.7, reviews: 120, image: TURF_IMAGES[4], amenities: ["Indoor","Scoreboard","AC","Lockers"], openHour: 7, closeHour: 23 },
  { id: "t6", name: "Victory Football Park", sport: "Football", description: "Large 11-a-side ground suitable for league matches with stadium-grade lighting.", location: "Navi Mumbai", pricePerHour: 1800, rating: 4.5, reviews: 64, image: TURF_IMAGES[5], amenities: ["11-a-side","Stadium Lights","Cafeteria","Parking","Spectator Stands"], openHour: 6, closeHour: 23 },
];

function todayOffset(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const SEED_BOOKINGS: Booking[] = [
  { id: "b1", turfId: "t1", turfName: "Greenfield Arena", customerEmail: "customer@test.com", customerName: "Rahul Sharma", date: todayOffset(0), startHour: 18, duration: 1, total: 1200, status: "Confirmed", createdAt: new Date().toISOString() },
  { id: "b2", turfId: "t3", turfName: "SmashPoint Badminton", customerEmail: "customer@test.com", customerName: "Rahul Sharma", date: todayOffset(2), startHour: 20, duration: 1, total: 600, status: "Confirmed", createdAt: new Date().toISOString() },
  { id: "b3", turfId: "t2", turfName: "Sixers Cricket Ground", customerEmail: "priya@test.com", customerName: "Priya Patel", date: todayOffset(-2), startHour: 19, duration: 2, total: 3000, status: "Completed", createdAt: new Date().toISOString() },
  { id: "b4", turfId: "t1", turfName: "Greenfield Arena", customerEmail: "amit@test.com", customerName: "Amit Verma", date: todayOffset(-1), startHour: 17, duration: 1, total: 1200, status: "Completed", createdAt: new Date().toISOString() },
  { id: "b5", turfId: "t4", turfName: "Ace Tennis Club", customerEmail: "neha@test.com", customerName: "Neha Singh", date: todayOffset(1), startHour: 7, duration: 1, total: 900, status: "Pending", createdAt: new Date().toISOString() },
  { id: "b6", turfId: "t5", turfName: "HoopsCity Basketball", customerEmail: "rohan@test.com", customerName: "Rohan Gupta", date: todayOffset(0), startHour: 21, duration: 1, total: 800, status: "Confirmed", createdAt: new Date().toISOString() },
  { id: "b7", turfId: "t1", turfName: "Greenfield Arena", customerEmail: "kiran@test.com", customerName: "Kiran Mehta", date: todayOffset(0), startHour: 19, duration: 2, total: 2400, status: "Confirmed", createdAt: new Date().toISOString() },
  { id: "b8", turfId: "t6", turfName: "Victory Football Park", customerEmail: "sara@test.com", customerName: "Sara Khan", date: todayOffset(-3), startHour: 18, duration: 2, total: 3600, status: "Completed", createdAt: new Date().toISOString() },
  { id: "b9", turfId: "t2", turfName: "Sixers Cricket Ground", customerEmail: "vikas@test.com", customerName: "Vikas Rao", date: todayOffset(-5), startHour: 20, duration: 1, total: 1500, status: "Completed", createdAt: new Date().toISOString() },
  { id: "b10", turfId: "t3", turfName: "SmashPoint Badminton", customerEmail: "anjali@test.com", customerName: "Anjali Desai", date: todayOffset(-7), startHour: 18, duration: 1, total: 600, status: "Completed", createdAt: new Date().toISOString() },
];

const TURFS_KEY = "turfly:turfs";
const BOOKINGS_KEY = "turfly:bookings";
const USER_KEY = "turfly:user";

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
    const t = read<Turf[]>(TURFS_KEY, []);
    if (!t.length) {
      write(TURFS_KEY, SEED_TURFS);
      return SEED_TURFS;
    }
    return t;
  },
  saveTurfs(t: Turf[]) { write(TURFS_KEY, t); },
  getBookings(): Booking[] {
    const b = read<Booking[]>(BOOKINGS_KEY, []);
    if (!b.length) {
      write(BOOKINGS_KEY, SEED_BOOKINGS);
      return SEED_BOOKINGS;
    }
    return b;
  },
  saveBookings(b: Booking[]) { write(BOOKINGS_KEY, b); },
  getUser(): User | null { return read<User | null>(USER_KEY, null); },
  setUser(u: User | null) { write(USER_KEY, u); },
  reset() {
    write(TURFS_KEY, SEED_TURFS);
    write(BOOKINGS_KEY, SEED_BOOKINGS);
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
