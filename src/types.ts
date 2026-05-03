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
