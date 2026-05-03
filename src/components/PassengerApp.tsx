import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bus, MapPin, Calendar, Search, User as UserIcon, 
  LogOut, Ticket as TicketIcon, ChevronRight, ArrowRight,
  Clock, ShieldCheck, CreditCard, QrCode, Star, Navigation,
  LayoutDashboard, Lock, CheckCircle, Home, History, Bell,
  Menu, X, Filter, SlidersHorizontal, Map, Wifi, Zap, Wind, Coffee,
  Settings, BellRing, Trash2
} from 'lucide-react';
import { format, parseISO, isAfter, isBefore, setHours, setMinutes } from 'date-fns';
import { ar } from 'date-fns/locale';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '../lib/utils';
import { getTrips, mockCities, getCompany, getBus, mockTrips, mockCompanies, mockNotifications, defaultPreferences } from '../data/mock';
import { Trip, Booking, Notification, NotificationPreferences } from '../types';
import TrackingMap from './TrackingMap';

interface PassengerAppProps {
  user: { uid: string; displayName: string; email: string } | null;
  onLogin: () => void;
  onLogout: () => void;
  onLaunchOperator: () => void;
}

const AMENITIES = [
  { id: 'Wi-Fi', icon: Wifi, label: 'واي فاي' },
  { id: 'Charging', icon: Zap, label: 'شحن USB' },
  { id: 'AC', icon: Wind, label: 'تكيف' },
  { id: 'Snack', icon: Coffee, label: 'وجبة خفيفة' },
];

export default function PassengerApp({ user, onLogin, onLogout, onLaunchOperator }: PassengerAppProps) {
  const [view, setView] = useState<'HOME' | 'RESULTS' | 'SEAT' | 'CHECKOUT' | 'SUCCESS' | 'BOOKINGS' | 'TRACKING' | 'NOTIFICATIONS' | 'NOTIFICATION_SETTINGS'>('HOME');
  const [searchParams, setSearchParams] = useState({ 
    from: 'بغداد', 
    to: 'أربيل', 
    date: format(new Date(), 'yyyy-MM-dd') 
  });
  
  const [trips, setTrips] = useState<Trip[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);
  const [ticketData, setTicketData] = useState<Booking | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [notificationPrefs, setNotificationPrefs] = useState<NotificationPreferences>(defaultPreferences);

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const markAsRead = (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Filter States
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    maxPrice: 60000,
    timeRange: 'all' as 'all' | 'morning' | 'afternoon' | 'night',
    companies: [] as string[],
    amenities: [] as string[],
    busType: 'all' as 'all' | 'VIP' | 'Standard' | 'Business',
    maxDuration: 10 // in hours
  });

  const filteredTrips = trips.filter(trip => {
    const bus = getBus(trip.busId);
    
    // Price Filter
    if (trip.price > filters.maxPrice) return false;

    // Time Filter
    const depDate = parseISO(trip.departureTime);
    const arrDate = parseISO(trip.arrivalTime);
    const hour = depDate.getHours();
    if (filters.timeRange === 'morning' && (hour < 5 || hour >= 12)) return false;
    if (filters.timeRange === 'afternoon' && (hour < 12 || hour >= 18)) return false;
    if (filters.timeRange === 'night' && (hour < 18 && hour >= 5)) return false;

    // Duration Filter (Duration in hours)
    const durationHours = (arrDate.getTime() - depDate.getTime()) / (1000 * 60 * 60);
    if (durationHours > filters.maxDuration) return false;

    // Company Filter
    if (filters.companies.length > 0 && !filters.companies.includes(trip.companyId)) return false;

    // Amenities Filter
    if (filters.amenities.length > 0) {
      const busAmenities = bus?.amenities || [];
      const hasAllAmenities = filters.amenities.every(a => busAmenities.includes(a));
      if (!hasAllAmenities) return false;
    }

    // Bus Type Filter
    if (filters.busType !== 'all' && bus?.type !== filters.busType) return false;

    return true;
  });

  const handleSearch = async () => {
    setLoading(true);
    try {
      const results = await getTrips(searchParams.from, searchParams.to, searchParams.date);
      setTrips(results);
      setView('RESULTS');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    if (selectedTrip && selectedSeat && user) {
      const newBooking: Booking = {
        id: `BKG-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        tripId: selectedTrip.id,
        userId: user.uid,
        passengerName: user.displayName,
        seatNumber: selectedSeat,
        status: 'confirmed',
        paymentMethod: 'Shellen Balance',
        createdAt: new Date().toISOString(),
        qrCode: `TKT-${selectedTrip.id}-${selectedSeat}-${Date.now()}`
      };
      setMyBookings(prev => [newBooking, ...prev]);
      setTicketData(newBooking);
      setView('SUCCESS');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#FDFDFD] text-gray-900 font-sans sm:pb-0 pb-20" dir="rtl">
      
      {/* Mobile Top Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2" onClick={() => setView('HOME')}>
          <div className="bg-emerald-600 p-2 rounded-xl text-white">
            <Bus className="w-5 h-5" />
          </div>
          <span className="text-xl font-black font-display text-emerald-950 tracking-tight">سفري</span>
        </div>
        
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setView('NOTIFICATIONS')}
            className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 relative"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
               <span className="absolute top-1 right-1 bg-red-500 w-2 h-2 rounded-full border-2 border-white"></span>
            )}
          </button>
          {user ? (
             <button 
              onClick={() => setIsMenuOpen(true)}
              className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold border border-emerald-100"
             >
               {user.displayName.charAt(0)}
             </button>
          ) : (
             <button 
              onClick={onLogin}
              className="bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
             >
               دخول
             </button>
          )}
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="pt-20 px-5 max-w-lg mx-auto">
        <AnimatePresence mode="wait">
          
          {/* HOME VIEW: Search & Discovery */}
          {view === 'HOME' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 pb-10"
            >
              <div className="pt-6 space-y-2">
                <h1 className="text-3xl font-black font-display text-emerald-950 leading-tight">
                  أين وجهتك <br />
                  القادمة اليوم؟
                </h1>
                <p className="text-gray-500 font-medium">خطط لرحلتك، اختر مقعدك، واحجز في ثوانٍ.</p>
              </div>

              {/* Enhanced Search Card */}
              <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-emerald-950/5 border border-gray-50 p-6 space-y-4">
                <div className="space-y-4 relative">
                  {/* From Field */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <label className="text-[10px] font-black text-emerald-600/50 uppercase tracking-widest mb-1 block">محطة الانطلاق</label>
                    <div className="flex items-center gap-3">
                      <Navigation className="w-5 h-5 text-emerald-600" />
                      <select 
                        value={searchParams.from}
                        onChange={(e) => setSearchParams({...searchParams, from: e.target.value})}
                        className="bg-transparent border-none p-0 w-full text-lg font-black text-emerald-950 outline-none focus:ring-0"
                      >
                        {mockCities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>

                  {/* Swap Button */}
                  <button className="absolute right-8 top-1/2 -translate-y-1/2 z-10 w-10 h-10 bg-white shadow-lg border border-gray-100 rounded-full flex items-center justify-center text-emerald-600 active:rotate-180 transition-transform duration-500">
                    <SlidersHorizontal className="w-4 h-4 rotate-90" />
                  </button>

                  {/* To Field */}
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <label className="text-[10px] font-black text-emerald-600/50 uppercase tracking-widest mb-1 block">محطة الوصول</label>
                    <div className="flex items-center gap-3">
                      <MapPin className="w-5 h-5 text-emerald-600" />
                      <select 
                        value={searchParams.to}
                        onChange={(e) => setSearchParams({...searchParams, to: e.target.value})}
                        className="bg-transparent border-none p-0 w-full text-lg font-black text-emerald-950 outline-none focus:ring-0"
                      >
                        {mockCities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <label className="text-[10px] font-black text-emerald-600/50 uppercase tracking-widest mb-1 block">تاريخ السفر</label>
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-emerald-600" />
                    <input 
                      type="date"
                      value={searchParams.date}
                      onChange={(e) => setSearchParams({...searchParams, date: e.target.value})}
                      className="bg-transparent border-none p-0 w-full text-lg font-black text-emerald-950 outline-none focus:ring-0"
                    />
                  </div>
                </div>

                <button 
                  onClick={handleSearch}
                  disabled={loading || searchParams.from === searchParams.to}
                  className="w-full h-16 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-600/30 flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Search className="w-6 h-6" />
                      <span>بحث عن رحلة</span>
                    </>
                  )}
                </button>
              </div>

              {/* Featured Companies / Promotions */}
              <div className="space-y-4">
                <div className="flex justify-between items-center px-1">
                  <h3 className="font-black text-lg text-emerald-950">شركاء النقل</h3>
                  <button className="text-emerald-600 text-xs font-bold uppercase tracking-widest">عرض الكل</button>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide no-scrollbar">
                  {['خطوط الشمال', 'الرافدين', 'دجلة'].map((name, i) => (
                    <div key={i} className="flex-shrink-0 w-32 bg-white border border-gray-50 p-4 rounded-[2rem] text-center shadow-sm">
                       <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-3 font-black text-xl">
                         {name.charAt(0)}
                       </div>
                       <p className="text-xs font-bold text-gray-900 line-clamp-1">{name}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* RESULTS VIEW */}
          {view === 'RESULTS' && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6 pb-10"
            >
               <div className="flex items-center justify-between">
                  <button onClick={() => setView('HOME')} className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <div className="text-center">
                    <h2 className="font-black text-emerald-950 text-lg">{searchParams.from} ← {searchParams.to}</h2>
                    <p className="text-[10px] font-bold text-gray-400">{format(new Date(searchParams.date), 'dd MMMM', { locale: ar })}</p>
                  </div>
                  <button 
                    onClick={() => setIsFilterOpen(true)}
                    className={cn(
                      "w-10 h-10 rounded-full bg-white border flex items-center justify-center transition-all",
                      isFilterOpen ? "border-emerald-600 text-emerald-600 bg-emerald-50" : "border-gray-100 text-gray-400"
                    )}
                  >
                    <Filter className="w-4 h-4" />
                  </button>
               </div>

               <div className="space-y-4">
                  {filteredTrips.length > 0 ? filteredTrips.map((trip, idx) => {
                    const company = getCompany(trip.companyId);
                    const bus = getBus(trip.busId);
                    
                    const depDate = parseISO(trip.departureTime);
                    const arrDate = parseISO(trip.arrivalTime);
                    const diffMs = arrDate.getTime() - depDate.getTime();
                    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
                    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                    const duration = `${diffHrs}س ${diffMins}د`;
                    
                    return (
                      <motion.div 
                        key={trip.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: idx * 0.1 }}
                        onClick={() => { setSelectedTrip(trip); setView('SEAT'); }}
                        className="bg-white rounded-[2rem] border border-gray-50 shadow-sm p-6 space-y-6 active:scale-[0.98] transition-all cursor-pointer relative overflow-hidden group"
                      >
                         <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                               <div className="w-10 h-10 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center font-black">
                                  {company?.logo}
                               </div>
                               <div>
                                  <h4 className="font-black text-emerald-950 text-sm">{company?.name}</h4>
                                  <div className="flex items-center text-[10px] text-amber-500 font-black">
                                    <Star className="w-3 h-3 fill-amber-500 ml-1" /> {company?.rating} ({bus?.type})
                                  </div>
                               </div>
                            </div>
                            <div className="text-right">
                               <p className="text-xl font-black text-emerald-600 font-display">{trip.price.toLocaleString()} <span className="text-[10px] text-gray-400 font-normal">د.ع</span></p>
                            </div>
                         </div>

                         <div className="flex items-center justify-between relative py-2">
                            <div className="flex-1 flex flex-col items-center">
                               <span className="text-2xl font-black text-emerald-950 font-display leading-none">{format(parseISO(trip.departureTime), 'HH:mm')}</span>
                               <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase">انطلاق</span>
                            </div>

                            <div className="flex-[2] px-4 flex flex-col items-center">
                               <div className="w-full h-px border-t border-dashed border-gray-200 relative mb-1">
                                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-2">
                                     <Bus className="w-4 h-4 text-emerald-500" />
                                  </div>
                               </div>
                               <span className="text-[9px] font-black text-emerald-600/60 tracking-widest">{duration}</span>
                            </div>

                            <div className="flex-1 flex flex-col items-center">
                               <span className="text-2xl font-black text-gray-300 font-display leading-none">{format(parseISO(trip.arrivalTime), 'HH:mm')}</span>
                               <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase">وصول</span>
                            </div>
                         </div>
                         
                         <div className="flex justify-between items-center border-t border-gray-50 pt-4">
                            <div className="flex items-center gap-3">
                               <div className="flex items-center gap-1.5">
                                 <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                                 <span className="text-[10px] font-bold text-emerald-700">متاح {trip.availableSeats.length} مقعد</span>
                               </div>
                               <div className="flex gap-1.5 border-r border-gray-100 pr-3">
                                  {bus?.amenities?.slice(0, 3).map(a => {
                                    const amenity = AMENITIES.find(am => am.id === a);
                                    if (!amenity) return null;
                                    return <amenity.icon key={a} className="w-3 h-3 text-gray-300" />
                                  })}
                               </div>
                            </div>
                            <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">احجز الآن →</div>
                         </div>
                      </motion.div>
                    );
                  }) : (
                    <div className="text-center py-20">
                       <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300">
                          <Search className="w-10 h-10" />
                       </div>
                       <h3 className="font-black text-emerald-950">لا توجد رحلات</h3>
                       <p className="text-gray-400 text-sm">حاول تغيير التاريخ أو خيارات التصفية</p>
                    </div>
                  )}
               </div>
            </motion.div>
          )}

          {/* SEAT SELECTION */}
          {view === 'SEAT' && selectedTrip && (
            <motion.div 
              key="seat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 pb-24"
            >
               <div className="flex items-center justify-between">
                  <button onClick={() => setView('RESULTS')} className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <div className="text-center">
                    <h2 className="font-black text-emerald-950 text-lg">اختر مقعدك</h2>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{format(new Date(selectedTrip.departureTime), 'HH:mm')} • باص VIP</p>
                  </div>
                  <div className="w-10 h-10" />
               </div>

               {/* Bus Layout Canvas */}
               <div className="bg-white rounded-[3rem] border border-gray-50 shadow-xl shadow-emerald-950/5 p-8 flex flex-col items-center">
                  <div className="w-full flex justify-end mb-10 pb-4 border-b border-dashed border-gray-100">
                     <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-gray-300 rounded-full relative">
                           <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 -translate-y-1/2"></div>
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-12 gap-y-4">
                     <div className="grid grid-cols-2 gap-4">
                        {[1, 2, 5, 6, 9, 10, 13, 14, 17, 18].map(s => (
                           <button 
                             key={s}
                             disabled={!selectedTrip.availableSeats.includes(s)}
                             onClick={() => setSelectedSeat(selectedSeat === s ? null : s)}
                             className={cn(
                               "w-12 h-14 rounded-t-xl rounded-b-md font-black text-sm transition-all relative border-b-4",
                               selectedSeat === s ? "bg-emerald-500 text-white border-emerald-700 shadow-lg scale-110 z-10" : 
                               selectedTrip.availableSeats.includes(s) ? "bg-gray-50 text-gray-700 border-gray-200" : 
                               "bg-gray-100 text-gray-300 border-gray-200 opacity-40 cursor-not-allowed"
                             )}
                           >
                             {s}
                           </button>
                        ))}
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        {[3, 4, 7, 8, 11, 12, 15, 16, 19, 20].map(s => (
                           <button 
                             key={s}
                             disabled={!selectedTrip.availableSeats.includes(s)}
                             onClick={() => setSelectedSeat(selectedSeat === s ? null : s)}
                             className={cn(
                               "w-12 h-14 rounded-t-xl rounded-b-md font-black text-sm transition-all relative border-b-4",
                               selectedSeat === s ? "bg-emerald-500 text-white border-emerald-700 shadow-lg scale-110 z-10" : 
                               selectedTrip.availableSeats.includes(s) ? "bg-gray-50 text-gray-700 border-gray-200" : 
                               "bg-gray-100 text-gray-300 border-gray-200 opacity-40 cursor-not-allowed"
                             )}
                           >
                             {s}
                           </button>
                        ))}
                     </div>
                  </div>

                  <div className="flex gap-6 mt-12 text-[10px] font-bold text-gray-400 bg-gray-50 px-6 py-2 rounded-full border border-gray-100">
                     <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-white border border-gray-200 rounded-sm"></div> متاح</div>
                     <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> مختار</div>
                     <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-gray-100 border border-gray-200 rounded-sm opacity-50"></div> محجوز</div>
                  </div>
               </div>

               {/* Bottom Floating Bar */}
               <div className="fixed bottom-0 left-0 right-0 p-5 bg-white/80 backdrop-blur-xl border-t border-gray-100 z-40 pb-safe">
                  <div className="max-w-md mx-auto flex items-center justify-between">
                     <div>
                        <p className="text-[10px] font-black text-emerald-600/50 uppercase tracking-widest">إجمالي الحجز</p>
                        <p className="text-2xl font-black text-emerald-950 font-display">{selectedSeat ? selectedTrip.price.toLocaleString() : '0'} <span className="text-sm">د.ع</span></p>
                     </div>
                     <button 
                       disabled={!selectedSeat}
                       onClick={() => setView('CHECKOUT')}
                       className="bg-emerald-950 text-white h-14 px-8 rounded-2xl font-black flex items-center gap-3 shadow-xl shadow-emerald-950/20 active:scale-95 transition-all disabled:opacity-20"
                     >
                       تأكيد و حجز <ChevronRight className="w-4 h-4" />
                     </button>
                  </div>
               </div>
            </motion.div>
          )}

          {/* CHECKOUT & PAYMENT */}
          {view === 'CHECKOUT' && selectedTrip && selectedSeat && (
            <motion.div 
               key="checkout"
               initial={{ opacity: 0, scale: 0.98 }}
               animate={{ opacity: 1, scale: 1 }}
               exit={{ opacity: 0, scale: 0.98 }}
               className="space-y-6 pb-20"
            >
               <div className="flex items-center justify-between">
                  <button onClick={() => setView('SEAT')} className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <h2 className="font-black text-emerald-950 text-lg">مراجعة الحجز</h2>
                  <div className="w-10 h-10" />
               </div>

               <div className="bg-emerald-950 rounded-[3rem] p-8 text-white space-y-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-800 rounded-full blur-3xl opacity-30 -translate-y-1/2 translate-x-1/2"></div>
                  
                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-emerald-400/50 uppercase tracking-widest leading-none">تفاصيل الرحلة</p>
                     <div className="flex justify-between items-end">
                        <div className="space-y-1">
                           <h4 className="text-2xl font-black font-display tracking-tight">{selectedTrip.departureCity} - {selectedTrip.arrivalCity}</h4>
                           <div className="flex items-center gap-2 text-emerald-300/60 font-bold text-sm">
                             <Calendar className="w-4 h-4" /> {format(new Date(selectedTrip.departureTime), 'dd MMMM yyyy (HH:mm)', { locale: ar })}
                           </div>
                        </div>
                        <div className="text-center bg-white/10 px-4 py-2 rounded-2xl backdrop-blur-md border border-white/10">
                           <span className="block text-[8px] font-black text-white/50 uppercase">المقعد</span>
                           <span className="text-2xl font-black font-display text-emerald-400">{selectedSeat}</span>
                        </div>
                     </div>
                  </div>

                  <div className="h-px bg-white/10"></div>

                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-emerald-400/50 uppercase tracking-widest leading-none">بيانات المسافر</p>
                     <div className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl border border-white/5">
                        <div className="w-12 h-12 bg-emerald-800 rounded-xl flex items-center justify-center font-black text-lg">
                           {user?.displayName.charAt(0)}
                        </div>
                        <div>
                           <p className="font-black text-sm">{user?.displayName}</p>
                           <p className="text-[10px] font-bold text-emerald-300/40 uppercase tracking-widest">{user?.email}</p>
                        </div>
                     </div>
                  </div>

                  <div className="pt-4">
                     <div className="flex justify-between items-center mb-6">
                        <span className="text-gray-400 font-bold">السعر الإجمالي</span>
                        <span className="text-3xl font-black font-display">{selectedTrip.price.toLocaleString()} <span className="text-sm">د.ع</span></span>
                     </div>
                     <button 
                       onClick={handleCreateTicket}
                       disabled={loading}
                       className="w-full h-16 bg-white text-emerald-950 rounded-2xl font-black text-lg flex items-center justify-center gap-3 active:scale-[0.98] transition-all disabled:opacity-50"
                     >
                       {loading ? (
                         <div className="w-6 h-6 border-4 border-emerald-950/20 border-t-emerald-950 rounded-full animate-spin" />
                       ) : (
                         <>
                           <CreditCard className="w-6 h-6" />
                           <span>ادفع الآن (شِلّن)</span>
                         </>
                       )}
                     </button>
                  </div>
               </div>

               <div className="text-center p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100">
                  <p className="text-[11px] font-bold text-emerald-600 leading-relaxed">
                     بمجرد الدفع، سيتم إنشاء تذكرة رقمية QR Code خاصة بك. <br />
                     تأكد من الحضور للمحطة قبل 15 دقيقة من موعد الانطلاق.
                  </p>
               </div>
            </motion.div>
          )}

          {/* SUCCESS VIEW / TICKET */}
          {view === 'SUCCESS' && ticketData && selectedTrip && (
            <motion.div 
               key="success"
               initial={{ opacity: 0, scale: 0.9, y: 50 }}
               animate={{ opacity: 1, scale: 1, y: 0 }}
               transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
               className="space-y-6 pb-20"
            >
               <div className="text-center space-y-3 py-6">
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                     <CheckCircle strokeWidth={3} className="w-8 h-8" />
                  </div>
                  <h2 className="text-3xl font-black font-display text-emerald-950 tracking-tight">تم الحجز بنجاح!</h2>
                  <p className="text-gray-500 font-medium">نتمنى لك رحلة ممتعة وآمنة.</p>
               </div>

               <div className="bg-white rounded-[3rem] shadow-2xl shadow-emerald-900/10 border border-gray-100 overflow-hidden relative">
                  <div className="p-8 pb-4 space-y-6">
                     <div className="flex justify-center p-6 bg-gray-50 border-2 border-gray-100 rounded-[2.5rem]">
                        <QRCodeSVG value={ticketData.qrCode} size={200} fgColor="#064e3b" />
                     </div>
                     <div className="text-center">
                        <p className="text-[10px] font-black text-emerald-600/50 uppercase tracking-widest mb-1">معرف التذكرة</p>
                        <p className="font-mono text-[10px] font-bold text-gray-400 tracking-[0.3em]">{ticketData.id}</p>
                     </div>
                  </div>

                  <div className="h-px border-t border-dashed border-gray-200 mx-8 relative">
                     <div className="absolute top-1/2 left-0 w-6 h-6 bg-[#FDFDFD] -translate-x-1/2 -translate-y-1/2 rounded-full border-r border-gray-100"></div>
                     <div className="absolute top-1/2 right-0 w-6 h-6 bg-[#FDFDFD] translate-x-1/2 -translate-y-1/2 rounded-full border-l border-gray-100"></div>
                  </div>

                  <div className="p-8 grid grid-cols-2 gap-y-6">
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">المسار</p>
                        <p className="font-black text-emerald-950 text-lg leading-tight">{selectedTrip.departureCity} - {selectedTrip.arrivalCity}</p>
                     </div>
                     <div className="text-left">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">المقعد</p>
                        <p className="font-black text-emerald-600 text-3xl font-display">{ticketData.seatNumber}</p>
                     </div>
                     <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">الانطلاق</p>
                        <p className="font-black text-emerald-950">{format(new Date(selectedTrip.departureTime), 'HH:mm')}</p>
                        <p className="text-[10px] font-bold text-gray-400">{format(new Date(selectedTrip.departureTime), 'dd/MM/yyyy')}</p>
                     </div>
                     <div className="text-left">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 px-1">الرصيف</p>
                        <p className="font-black text-emerald-950">G-12</p>
                     </div>
                  </div>
               </div>

               <div className="flex gap-4">
                  <button 
                    onClick={() => setView('TRACKING')}
                    className="flex-1 h-16 bg-white border-2 border-gray-100 text-gray-900 rounded-2xl font-black text-sm flex items-center justify-center hover:bg-gray-50 transition-all active:scale-[0.98] gap-2"
                  >
                    <MapPin className="w-4 h-4" /> تتبع الحافلة
                  </button>
                  <button 
                    onClick={() => setView('BOOKINGS')}
                    className="flex-1 h-16 bg-emerald-950 text-white rounded-2xl font-black text-sm flex items-center justify-center hover:bg-emerald-900 transition-all active:scale-[0.98]"
                  >
                    عرض حجوزاتي
                  </button>
               </div>
            </motion.div>
          )}

          {/* MY BOOKINGS VIEW */}
          {view === 'BOOKINGS' && (
            <motion.div 
               key="bookings"
               initial={{ opacity: 0, x: -20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: 20 }}
               className="space-y-6 pb-20"
            >
               <h2 className="text-3xl font-black font-display text-emerald-950 pt-4">حجوزاتي</h2>
               
               <div className="space-y-4">
                  {myBookings.length > 0 ? myBookings.map((b, idx) => {
                     const trip = mockTrips.find(t => t.id === b.tripId);
                     if (!trip) return null;
                     return (
                        <motion.div 
                          key={b.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          onClick={() => { setTicketData(b); setSelectedTrip(trip); setView('SUCCESS'); }}
                          className="bg-white p-5 rounded-[2rem] border border-gray-50 flex items-center gap-5 shadow-sm active:scale-[0.98] transition-all cursor-pointer relative"
                        >
                           <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex flex-col items-center justify-center border border-emerald-100 flex-shrink-0">
                              <span className="text-[10px] font-black text-emerald-600/50 uppercase">{format(new Date(trip.departureTime), 'MMM', { locale: ar })}</span>
                              <span className="text-2xl font-black text-emerald-700 font-display leading-none">{format(new Date(trip.departureTime), 'd')}</span>
                           </div>
                           <div className="flex-1 min-w-0">
                              <h4 className="font-black text-emerald-950 text-sm truncate">{trip.departureCity} ← {trip.arrivalCity}</h4>
                              <div className="flex items-center gap-3 text-[10px] font-bold text-gray-400 mt-1">
                                 <div className="flex items-center gap-1"><Clock className="w-3 h-3" /> {format(new Date(trip.departureTime), 'HH:mm')}</div>
                                 <div className="flex items-center gap-1"><UserIcon className="w-3 h-3" /> مقعد {b.seatNumber}</div>
                              </div>
                           </div>
                           <ChevronRight className="w-4 h-4 text-gray-300" />
                        </motion.div>
                     );
                  }) : (
                     <div className="text-center py-20 bg-gray-50/50 rounded-[3rem] border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 text-gray-300 shadow-sm">
                           <TicketIcon className="w-8 h-8" />
                        </div>
                        <p className="text-sm font-bold text-gray-500">لا توجد حجوزات حتى الآن</p>
                     </div>
                  )}
               </div>
            </motion.div>
          )}

          {/* NOTIFICATIONS VIEW */}
          {view === 'NOTIFICATIONS' && (
            <motion.div 
               key="notifications"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="space-y-6 pb-20 flex flex-col min-h-screen"
            >
               <div className="flex items-center justify-between pt-4 px-4">
                  <button onClick={() => setView('HOME')} className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <div className="text-center">
                    <h2 className="font-black text-emerald-950 text-lg">التنبيهات</h2>
                  </div>
                  <button onClick={() => setView('NOTIFICATION_SETTINGS')} className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400">
                    <Settings className="w-5 h-5" />
                  </button>
               </div>

               <div className="px-4 space-y-4 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((n) => (
                      <motion.div 
                        key={n.id}
                        layout
                        onClick={() => markAsRead(n.id)}
                        className={cn(
                          "p-5 rounded-3xl border transition-all relative overflow-hidden",
                          n.isRead ? "bg-white border-gray-100 opacity-70" : "bg-emerald-50/50 border-emerald-100 shadow-sm"
                        )}
                      >
                         {!n.isRead && <div className="absolute top-0 right-0 w-2 h-2 bg-emerald-500 rounded-bl-xl shadow-sm" />}
                         <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-3">
                               <div className={cn(
                                 "w-10 h-10 rounded-xl flex items-center justify-center shadow-sm",
                                 n.type === 'trip_reminder' ? "bg-blue-50 text-blue-600" :
                                 n.type === 'schedule_change' ? "bg-amber-50 text-amber-600" :
                                 n.type === 'promotion' ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-600"
                               )}>
                                  {n.type === 'trip_reminder' ? <Clock className="w-5 h-5" /> :
                                   n.type === 'schedule_change' ? <BellRing className="w-5 h-5" /> :
                                   n.type === 'promotion' ? <Coffee className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                               </div>
                               <h4 className="font-black text-emerald-950 text-sm">{n.title}</h4>
                            </div>
                            <button 
                              onClick={(e) => { e.stopPropagation(); deleteNotification(n.id); }}
                              className="text-gray-300 hover:text-red-500 transition-colors p-1"
                            >
                               <Trash2 className="w-4 h-4" />
                            </button>
                         </div>
                         <p className="text-xs text-gray-500 leading-relaxed font-medium mb-3">{n.message}</p>
                         <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">
                            {format(parseISO(n.createdAt), 'dd MMMM - HH:mm', { locale: ar })}
                         </p>
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-20 flex flex-col items-center justify-center text-center opacity-30">
                       <BellRing className="w-16 h-16 mb-4 text-emerald-950" />
                       <h3 className="font-black text-emerald-950">لا يوجد تنبيهات</h3>
                       <p className="text-xs font-bold">كل شيء هادئ هنا حالياً</p>
                    </div>
                  )}
               </div>
            </motion.div>
          )}

          {/* NOTIFICATION SETTINGS VIEW */}
          {view === 'NOTIFICATION_SETTINGS' && (
            <motion.div 
               key="notification_settings"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="space-y-6 pb-20 flex flex-col min-h-screen"
            >
               <div className="flex items-center justify-between pt-4 px-4">
                  <button onClick={() => setView('NOTIFICATIONS')} className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <div className="text-center">
                    <h2 className="font-black text-emerald-950 text-lg">إعدادات التنبيهات</h2>
                  </div>
                  <div className="w-10 h-10" />
               </div>

               <div className="px-6 space-y-8">
                  <div className="space-y-4">
                     <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">تفضيلات الإرسال</p>
                     <div className="bg-white rounded-[2rem] border border-gray-100 divide-y divide-gray-50 overflow-hidden shadow-sm">
                        {[
                          { id: 'upcomingTrips', label: 'تذكير بالرحلات القادمة', desc: 'تنبيهات قبل 24 ساعة من انطلاق الرحلة' },
                          { id: 'scheduleChanges', label: 'تغييرات في الجدول', desc: 'تنبيهات فورية عند تأجيل أو تعديل موعد رحلة' },
                          { id: 'promotions', label: 'عروض وخصومات', desc: 'تنبيهات بالعروض الحصرية وأكواد الخصم' },
                          { id: 'systemUpdates', label: 'تحديثات النظام', desc: 'معلومات عامة حول حسابك وتطبيق شِلّن' },
                        ].map((pref) => (
                          <div key={pref.id} className="p-5 flex items-center justify-between group">
                             <div className="flex-1 ml-4">
                                <h4 className="font-black text-emerald-950 text-sm mb-1">{pref.label}</h4>
                                <p className="text-[10px] font-bold text-gray-400">{pref.desc}</p>
                             </div>
                             <button 
                                onClick={() => setNotificationPrefs(prev => ({ ...prev, [pref.id]: !prev[pref.id as keyof NotificationPreferences] }))}
                                className={cn(
                                  "w-12 h-6 rounded-full transition-all relative p-1",
                                  notificationPrefs[pref.id as keyof NotificationPreferences] ? "bg-emerald-600" : "bg-gray-200"
                                )}
                             >
                                <motion.div 
                                  animate={{ x: notificationPrefs[pref.id as keyof NotificationPreferences] ? 24 : 0 }}
                                  className="w-4 h-4 bg-white rounded-full shadow-sm"
                                />
                             </button>
                          </div>
                        ))}
                     </div>
                  </div>

                  <div className="p-6 bg-emerald-50 rounded-3xl border border-emerald-100 flex gap-4">
                     <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm shrink-0">
                        <ShieldCheck className="w-6 h-6" />
                     </div>
                     <div>
                        <h4 className="font-black text-emerald-900 text-sm mb-1">خصوصيتك أولاً</h4>
                        <p className="text-[10px] font-bold text-emerald-700/60 leading-relaxed">نحن لا نرسل سوى التنبيهات الضرورية التي تهمك. يمكنك التحكم في كل شيء من هنا.</p>
                     </div>
                  </div>
               </div>
            </motion.div>
          )}

          {/* TRACKING VIEW */}
          {view === 'TRACKING' && selectedTrip && ticketData && (
            <motion.div 
               key="tracking"
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               className="space-y-6 pb-20 h-[80vh] flex flex-col"
            >
               <div className="flex items-center justify-between pt-4">
                  <button onClick={() => setView('SUCCESS')} className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400">
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <div className="text-center">
                    <h2 className="font-black text-emerald-950 text-lg">تتبع الحافلة المباشر</h2>
                    <p className="text-[10px] font-bold text-emerald-600 tracking-widest">{selectedTrip.departureCity} ← {selectedTrip.arrivalCity}</p>
                  </div>
                  <div className="w-10 h-10" />
               </div>

               <div className="flex-1 w-full bg-gray-50 rounded-[2rem] border border-gray-200 overflow-hidden relative shadow-sm">
                  <TrackingMap departureCity={selectedTrip.departureCity} arrivalCity={selectedTrip.arrivalCity} />
                  
                  {/* Floating Info Card on Map */}
                  <div className="absolute bottom-6 left-6 right-6 bg-white/90 backdrop-blur-xl p-4 rounded-2xl border border-gray-100 shadow-xl z-[1000]">
                    <div className="flex justify-between items-center">
                       <div>
                          <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">الوقت المتبقي للوصول</p>
                          <p className="font-black text-emerald-950 text-2xl font-display">2س 15د</p>
                       </div>
                       <div className="bg-emerald-50 px-3 py-2 rounded-xl text-center border border-emerald-100">
                          <p className="text-[10px] font-bold text-emerald-600">السرعة</p>
                          <p className="font-black text-emerald-900">95 <span className="text-[10px]">كم/س</span></p>
                       </div>
                    </div>
                  </div>
               </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Advanced Filter Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsFilterOpen(false)}
               className="fixed inset-0 z-[60] bg-emerald-950/40 backdrop-blur-sm"
            />
            <motion.div 
               initial={{ y: '100%' }}
               animate={{ y: 0 }}
               exit={{ y: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="fixed bottom-0 left-0 right-0 z-[70] bg-white rounded-t-[3rem] shadow-2xl p-8 max-h-[85vh] overflow-y-auto outline-none"
            >
               <div className="flex justify-between items-center mb-8 sticky top-0 bg-white z-10 pb-4 border-b border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                      <SlidersHorizontal className="w-5 h-5" />
                    </div>
                    <h2 className="font-display font-black text-2xl text-emerald-950">تصفية النتائج</h2>
                  </div>
                  <button 
                    onClick={() => setFilters({
                      maxPrice: 60000,
                      timeRange: 'all',
                      companies: [],
                      amenities: [],
                      busType: 'all',
                      maxDuration: 10
                    })}
                    className="text-emerald-600 text-xs font-black uppercase tracking-widest hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    إعادة ضبط
                  </button>
               </div>

               <div className="space-y-8 pb-10">
                  {/* Price Range */}
                  <div className="space-y-4">
                     <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">السعر الأقصى</label>
                        <span className="font-black text-emerald-950">{filters.maxPrice.toLocaleString()} <span className="text-[10px]">د.ع</span></span>
                     </div>
                     <input 
                        type="range" 
                        min="20000" 
                        max="100000" 
                        step="5000"
                        value={filters.maxPrice}
                        onChange={(e) => setFilters({...filters, maxPrice: parseInt(e.target.value)})}
                        className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                     />
                  </div>

                  {/* Trip Duration */}
                  <div className="space-y-4">
                     <div className="flex justify-between items-center px-1">
                        <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">مدة الرحلة القصوى</label>
                        <span className="font-black text-emerald-950">{filters.maxDuration} <span className="text-[10px]">ساعات</span></span>
                     </div>
                     <input 
                        type="range" 
                        min="2" 
                        max="12" 
                        step="1"
                        value={filters.maxDuration}
                        onChange={(e) => setFilters({...filters, maxDuration: parseInt(e.target.value)})}
                        className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                     />
                  </div>

                  {/* Departure Time */}
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 block">وقت الانطلاق</label>
                     <div className="grid grid-cols-2 gap-3">
                        {[
                          { id: 'all', label: 'كل الأوقات' },
                          { id: 'morning', label: 'صباحاً (5-12)' },
                          { id: 'afternoon', label: 'ظهراً (12-6)' },
                          { id: 'night', label: 'ليلاً (6-5)' },
                        ].map(t => (
                          <button 
                            key={t.id}
                            onClick={() => setFilters({...filters, timeRange: t.id as any})}
                            className={cn(
                              "py-4 rounded-2xl font-bold text-sm transition-all border",
                              filters.timeRange === t.id ? "bg-emerald-600 text-white border-emerald-600" : "bg-white text-gray-500 border-gray-100 hover:bg-gray-50"
                            )}
                          >
                            {t.label}
                          </button>
                        ))}
                     </div>
                  </div>

                  {/* Amenities */}
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 block">المميزات</label>
                     <div className="flex flex-wrap gap-3">
                        {AMENITIES.map(a => (
                          <button 
                            key={a.id}
                            onClick={() => {
                              const newAmenities = filters.amenities.includes(a.id) 
                                ? filters.amenities.filter(item => item !== a.id)
                                : [...filters.amenities, a.id];
                              setFilters({...filters, amenities: newAmenities});
                            }}
                            className={cn(
                              "px-4 py-3 rounded-2xl flex items-center gap-2 border transition-all",
                              filters.amenities.includes(a.id) ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-white text-gray-400 border-gray-100"
                            )}
                          >
                             <a.icon className="w-4 h-4" />
                             <span className="text-xs font-bold">{a.label}</span>
                          </button>
                        ))}
                     </div>
                  </div>

                  {/* Bus Type */}
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 block">نوع الحافلة</label>
                     <div className="flex gap-3">
                        {['all', 'VIP', 'Business', 'Standard'].map(type => (
                          <button 
                            key={type}
                            onClick={() => setFilters({...filters, busType: type as any})}
                            className={cn(
                              "flex-1 py-3 rounded-2xl font-bold text-xs transition-all border",
                              filters.busType === type ? "bg-emerald-950 text-white border-emerald-950" : "bg-white text-gray-400 border-gray-100 hover:bg-gray-50"
                            )}
                          >
                            {type === 'all' ? 'الكل' : type}
                          </button>
                        ))}
                     </div>
                  </div>

                  {/* Companies */}
                  <div className="space-y-4">
                     <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 block">شركات النقل</label>
                     <div className="space-y-2">
                        {mockCompanies.map(c => (
                          <button 
                            key={c.id}
                            onClick={() => {
                              const newCompanies = filters.companies.includes(c.id) 
                                ? filters.companies.filter(item => item !== c.id)
                                : [...filters.companies, c.id];
                              setFilters({...filters, companies: newCompanies});
                            }}
                            className={cn(
                              "w-full p-4 rounded-2xl flex items-center justify-between border transition-all",
                              filters.companies.includes(c.id) ? "bg-emerald-50 text-emerald-950 border-emerald-200" : "bg-white text-gray-500 border-gray-100"
                            )}
                          >
                             <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-black">{c.logo}</div>
                                <span className="font-bold text-sm">{c.name}</span>
                             </div>
                             {filters.companies.includes(c.id) && <CheckCircle className="w-4 h-4 text-emerald-600" />}
                          </button>
                        ))}
                     </div>
                  </div>
               </div>

               <div className="sticky bottom-0 bg-white pt-4 pb-2">
                  <button 
                    onClick={() => setIsFilterOpen(false)}
                    className="w-full h-16 bg-emerald-600 text-white rounded-2xl font-black text-lg shadow-xl shadow-emerald-600/30 active:scale-[0.98] transition-all"
                  >
                    عرض {filteredTrips.length} رحلة
                  </button>
               </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Side Menu Overlay */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-gray-100 px-8 py-3 flex justify-between items-center shadow-lg pb-safe">
        {[
          { id: 'HOME', icon: Home, label: 'الرئيسية' },
          { id: 'BOOKINGS', icon: History, label: 'حجوزاتي' },
          { id: 'NOTIFICATIONS', icon: Bell, label: 'تنبيهات', badge: unreadCount },
          { id: 'PROFILE', icon: UserIcon, label: 'حسابي' },
        ].map((item) => (
          <button 
            key={item.id}
            onClick={() => {
              if (item.id === 'HOME' || item.id === 'BOOKINGS' || item.id === 'NOTIFICATIONS') {
                setView(item.id as any);
                if (item.id === 'NOTIFICATIONS') setIsMenuOpen(false);
              } else if (item.id === 'PROFILE') {
                setIsMenuOpen(true);
              }
            }}
            className={cn(
              "flex flex-col items-center gap-1 relative transition-colors py-1",
              (view === item.id || (view === 'RESULTS' && item.id === 'HOME')) ? "text-emerald-600" : "text-gray-300"
            )}
          >
            <item.icon className="w-5 h-5" />
            <span className="text-[10px] font-black">{item.label}</span>
            {item.badge > 0 && (
               <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                  {item.badge}
               </span>
            )}
          </button>
        ))}
      </nav>

      {/* Side Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
               initial={{ opacity: 0 }}
               animate={{ opacity: 1 }}
               exit={{ opacity: 0 }}
               onClick={() => setIsMenuOpen(false)}
               className="fixed inset-0 z-[60] bg-emerald-950/20 backdrop-blur-sm"
            />
            <motion.div 
               initial={{ x: '100%' }}
               animate={{ x: 0 }}
               exit={{ x: '100%' }}
               transition={{ type: 'spring', damping: 25, stiffness: 200 }}
               className="fixed top-0 bottom-0 right-0 z-[70] w-72 bg-white shadow-2xl p-8 flex flex-col"
            >
               <div className="flex justify-between items-center mb-10">
                  <span className="font-display font-black text-xl text-emerald-950">القائمة</span>
                  <button onClick={() => setIsMenuOpen(false)} className="bg-gray-50 p-2 rounded-xl text-gray-400">
                     <X className="w-5 h-5" />
                  </button>
               </div>

               <div className="flex-1 space-y-6">
                  {user && (
                    <div className="bg-emerald-50 p-4 rounded-2xl mb-8">
                       <p className="text-[10px] font-black text-emerald-600/50 uppercase tracking-widest mb-2">أهلاً بك</p>
                       <p className="font-black text-emerald-950">{user.displayName}</p>
                    </div>
                  )}

                  <div className="space-y-4">
                     <button className="w-full flex items-center gap-4 text-emerald-950 font-bold hover:text-emerald-600 transition-colors">
                        <UserIcon className="w-5 h-5" /> الملف الشخصي
                     </button>
                     <button className="w-full flex items-center gap-4 text-emerald-950 font-bold hover:text-emerald-600 transition-colors">
                        <CreditCard className="w-5 h-5" /> طرق الدفع (شِلّن)
                     </button>
                     <button 
                        onClick={() => {
                          setIsMenuOpen(false);
                          if (!selectedTrip || !ticketData) {
                            setSelectedTrip(mockTrips[0]);
                            setTicketData({
                              id: 'MOCK-123',
                              tripId: mockTrips[0].id,
                              userId: user?.uid || 'u1',
                              passengerName: user?.displayName || 'ضيف',
                              seatNumber: 5,
                              status: 'confirmed',
                              paymentMethod: 'Shellen',
                              createdAt: new Date().toISOString(),
                              qrCode: 'mock-qr'
                            });
                          }
                          setView('TRACKING');
                        }}
                        className="w-full flex items-center gap-4 text-emerald-950 font-bold hover:text-emerald-600 transition-colors"
                     >
                        <Map className="w-5 h-5" /> تتبع الحافلة
                     </button>
                  </div>

                  <div className="h-px bg-gray-50 my-6"></div>

                  <button 
                    onClick={() => { setIsMenuOpen(false); onLaunchOperator(); }}
                    className="w-full flex items-center gap-4 text-emerald-950 font-bold hover:text-emerald-600 transition-colors"
                  >
                     <LayoutDashboard className="w-5 h-5" /> بوابة الشركات
                  </button>
               </div>

               <button 
                 onClick={() => { setIsMenuOpen(false); onLogout(); }}
                 className="mt-auto flex items-center gap-3 text-red-500 font-bold"
               >
                  <LogOut className="w-5 h-5" /> تسجيل الخروج
               </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

    </div>
  );
}
