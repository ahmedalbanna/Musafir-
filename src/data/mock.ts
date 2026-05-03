import { City, Company, Bus, Trip, Booking } from '../types';
import { addDays, setHours, setMinutes, formatISO } from 'date-fns';

export const mockCities: City[] = [
  { id: 'c1', name: 'بغداد', code: 'BGW' },
  { id: 'c2', name: 'أربيل', code: 'EBL' },
  { id: 'c3', name: 'البصرة', code: 'BSR' },
  { id: 'c4', name: 'السليمانية', code: 'ISU' },
  { id: 'c5', name: 'الموصل', code: 'OSM' },
  { id: 'c6', name: 'النجف', code: 'NJF' }
];

export const mockCompanies: Company[] = [
  { id: 'comp1', name: 'خطوط الشمال', logo: 'N', rating: 4.8 },
  { id: 'comp2', name: 'الرافدين اكسبرس', logo: 'R', rating: 4.5 },
  { id: 'comp3', name: 'أجنحة دجلة', logo: 'T', rating: 4.9 }
];

export const mockBuses: Bus[] = [
  { id: 'b1', companyId: 'comp1', plateNumber: 'A-1234', type: 'VIP', totalSeats: 30, layout: '2+1', amenities: ['Wi-Fi', 'Charging', 'AC', 'Snack'] },
  { id: 'b2', companyId: 'comp1', plateNumber: 'A-5678', type: 'Standard', totalSeats: 45, layout: '2+2', amenities: ['AC'] },
  { id: 'b3', companyId: 'comp2', plateNumber: 'B-9012', type: 'Business', totalSeats: 35, layout: '2+1', amenities: ['Wi-Fi', 'Charging', 'AC'] },
];

const tomorrow = addDays(new Date(), 1);

export const mockTrips: Trip[] = [
  {
    id: 't1',
    routeId: 'r1',
    busId: 'b1',
    companyId: 'comp1',
    departureCity: 'بغداد',
    arrivalCity: 'أربيل',
    departureTime: formatISO(setMinutes(setHours(tomorrow, 8), 0)),
    arrivalTime: formatISO(setMinutes(setHours(tomorrow, 13), 30)),
    price: 35000,
    availableSeats: Array.from({ length: 30 }, (_, i) => i + 1).filter(s => ![3, 4, 15, 16].includes(s)), // Some booked
  },
  {
    id: 't2',
    routeId: 'r1',
    busId: 'b2',
    companyId: 'comp1',
    departureCity: 'بغداد',
    arrivalCity: 'أربيل',
    departureTime: formatISO(setMinutes(setHours(tomorrow, 10), 0)),
    arrivalTime: formatISO(setMinutes(setHours(tomorrow, 15), 0)),
    price: 25000,
    availableSeats: Array.from({ length: 45 }, (_, i) => i + 1).filter(s => ![1, 2, 8, 9, 10].includes(s)),
  },
  {
    id: 't3',
    routeId: 'r2',
    busId: 'b3',
    companyId: 'comp2',
    departureCity: 'بغداد',
    arrivalCity: 'البصرة',
    departureTime: formatISO(setMinutes(setHours(tomorrow, 22), 0)),
    arrivalTime: formatISO(setMinutes(setHours(tomorrow, 4), 30)),
    price: 40000,
    availableSeats: Array.from({ length: 35 }, (_, i) => i + 1),
  },
  {
    id: 't4',
    routeId: 'r1',
    busId: 'b1',
    companyId: 'comp3',
    departureCity: 'بغداد',
    arrivalCity: 'أربيل',
    departureTime: formatISO(setMinutes(setHours(tomorrow, 23), 0)),
    arrivalTime: formatISO(setMinutes(setHours(tomorrow, 5), 0)),
    price: 30000,
    availableSeats: Array.from({ length: 30 }, (_, i) => i + 1).filter(s => s % 2 === 0), // Half booked
  }
];

export const mockStats = {
  dailyRevenue: 4850000,
  activeTrips: 12,
  pendingBookings: 24,
  averageOccupancy: 84,
  weeklyRevenue: [
    { day: 'السيت', value: 3200000 },
    { day: 'الأحد', value: 4100000 },
    { day: 'الاثنين', value: 3800000 },
    { day: 'الثلاثاء', value: 4500000 },
    { day: 'الأربعاء', value: 5200000 },
    { day: 'الخميس', value: 6800000 },
    { day: 'الجمعة', value: 5900000 },
  ]
};

export const mockBookings: Booking[] = [
  { id: 'B1', tripId: 't1', userId: 'u1', passengerName: 'أحمد علي', seatNumber: 3, status: 'confirmed', paymentMethod: 'Shellen', createdAt: new Date().toISOString(), qrCode: 'QR1' },
  { id: 'B2', tripId: 't1', userId: 'u2', passengerName: 'سارة حسن', seatNumber: 4, status: 'confirmed', paymentMethod: 'Shellen', createdAt: new Date().toISOString(), qrCode: 'QR2' },
  { id: 'B3', tripId: 't2', userId: 'u3', passengerName: 'محمد جاسم', seatNumber: 1, status: 'confirmed', paymentMethod: 'Cash', createdAt: new Date().toISOString(), qrCode: 'QR3' },
];

export const getTrips = async (from: string, to: string, date: string): Promise<Trip[]> => {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return mockTrips.filter(t => 
    t.departureCity === from && 
    t.arrivalCity === to
    // In a real app we'd filter by date too, but mock data is hardcoded to tomorrow for simplicity
  );
};

export const getCompany = (id: string) => mockCompanies.find(c => c.id === id);
export const getBus = (id: string) => mockBuses.find(b => b.id === id);
