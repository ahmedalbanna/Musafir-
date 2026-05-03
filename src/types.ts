export interface City {
  id: string;
  name: string;
  code: string;
}

export interface Company {
  id: string;
  name: string;
  logo: string;
  rating: number;
}

export interface Bus {
  id: string;
  companyId: string;
  plateNumber: string;
  type: 'Standard' | 'VIP' | 'Business';
  totalSeats: number;
  layout: string; // e.g., "2+2"
  amenities?: string[]; // e.g., ["wifi", "charging", "ac", "snack"]
}

export interface Trip {
  id: string;
  routeId: string;
  busId: string;
  companyId: string;
  departureCity: string;
  arrivalCity: string;
  departureTime: string;
  arrivalTime: string;
  price: number;
  availableSeats: number[]; // List of seat numbers currently available
}

export interface Booking {
  id: string;
  tripId: string;
  userId: string;
  passengerName: string;
  seatNumber: number;
  status: 'pending' | 'confirmed' | 'cancelled';
  paymentMethod: string;
  createdAt: string;
  qrCode: string;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'trip_reminder' | 'schedule_change' | 'promotion' | 'system';
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
}

export interface NotificationPreferences {
  upcomingTrips: boolean;
  scheduleChanges: boolean;
  promotions: boolean;
  systemUpdates: boolean;
}
