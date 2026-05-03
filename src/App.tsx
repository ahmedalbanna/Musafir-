import { useState, useEffect } from 'react';
import { auth, loginWithGoogle, logout, db, handleFirestoreError } from './lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { collection, query, getDocs, addDoc, where, serverTimestamp, getDoc, doc } from 'firebase/firestore';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bus, 
  MapPin, 
  Calendar, 
  Search, 
  User as UserIcon, 
  LogOut, 
  Ticket as TicketIcon, 
  ChevronRight, 
  ArrowRight,
  Clock,
  ShieldCheck,
  CreditCard,
  QrCode
} from 'lucide-react';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import { City, Trip, Booking, Company } from './types';

// Components
const Navbar = ({ user, onLogin, onLogout, onShowBookings }: { user: User | null, onLogin: () => void, onLogout: () => void, onShowBookings: () => void }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4 flex items-center justify-between">
    <div className="flex items-center gap-2 cursor-pointer" onClick={() => window.location.reload()}>
      <div className="bg-orange-500 p-2 rounded-xl">
        <Bus className="text-white w-6 h-6" />
      </div>
      <span className="text-2xl font-bold tracking-tight text-gray-900">Musafir <span className="text-orange-500 italic ml-1">مسافر</span></span>
    </div>
    
    <div className="flex items-center gap-4">
      {user ? (
        <div className="flex items-center gap-4">
          <button 
            onClick={onShowBookings}
            className="flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-orange-500 transition-colors"
          >
            <TicketIcon className="w-4 h-4" />
            <span className="hidden sm:inline">حجوزاتي</span>
          </button>
          <div className="flex items-center gap-3 bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
            <img src={user.photoURL || ''} alt="" className="w-6 h-6 rounded-full border border-gray-200" referrerPolicy="no-referrer" />
            <span className="text-sm font-medium text-gray-700 hidden sm:inline">{user.displayName}</span>
            <button onClick={onLogout} className="text-gray-400 hover:text-red-500 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={onLogin}
          className="bg-gray-900 text-white px-6 py-2 rounded-full text-sm font-medium flex items-center gap-2 hover:bg-orange-500 transition-all active:scale-95"
        >
          <UserIcon className="w-4 h-4" />
          تسجيل الدخول
        </button>
      )}
    </div>
  </nav>
);

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'HOME' | 'RESULTS' | 'SEAT' | 'PAYMENT' | 'TICKET' | 'BOOKINGS'>('HOME');
  const [searchParams, setSearchParams] = useState({ from: '', to: '', date: format(new Date(), 'yyyy-MM-dd') });
  const [trips, setTrips] = useState<Trip[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [myBookings, setMyBookings] = useState<Booking[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    fetchCities();
    return () => unsubscribe();
  }, [user]);

  const fetchCities = async () => {
    try {
      const q = query(collection(db, 'cities'));
      const snapshot = await getDocs(q);
      const cityData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as City));
      setCities(cityData);
      
      // If no cities, seed some data
      if (cityData.length === 0) {
        seedSampleData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const seedSampleData = async () => {
    console.log("Seeding sample data...");
    const routes = [
      { from: 'بغداد', to: 'أربيل', fromCode: 'BGW', toCode: 'EBL' },
      { from: 'أربيل', to: 'السليمانية', fromCode: 'EBL', toCode: 'SUW' },
      { from: 'بغداد', to: 'البصرة', fromCode: 'BGW', toCode: 'BSR' }
    ];

    const companyRef = collection(db, 'companies');
    const comp = await addDoc(companyRef, { name: 'نجم الشمال', logo: '', rating: 4.8 });

    const cityRef = collection(db, 'cities');
    for (const r of routes) {
      await addDoc(cityRef, { name: r.from, code: r.fromCode });
    }

    const tripRef = collection(db, 'trips');
    for (const r of [
        { from: 'بغداد', to: 'أربيل' },
        { from: 'أربيل', to: 'السليمانية' },
        { from: 'بغداد', to: 'البصرة' }
    ]) {
      await addDoc(tripRef, {
        departureCity: r.from,
        arrivalCity: r.to,
        companyId: comp.id,
        departureTime: new Date(Date.now() + 86400000).toISOString(),
        arrivalTime: new Date(Date.now() + 86400000 + 14400000).toISOString(),
        price: 25000,
        availableSeats: Array.from({ length: 40 }, (_, i) => i + 1),
        busId: 'bus_123',
        routeId: 'route_1'
      });
    }
    fetchCities();
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const q = query(
        collection(db, 'trips'),
        where('departureCity', '==', searchParams.from),
        where('arrivalCity', '==', searchParams.to)
      );
      const snapshot = await getDocs(q);
      const tripData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Trip));
      setTrips(tripData);
      setView('RESULTS');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async (trip: Trip, seat: number) => {
    if (!user) {
      await loginWithGoogle();
      return;
    }
    setLoading(true);
    try {
      const bookingData = {
        tripId: trip.id,
        userId: user.uid,
        passengerName: user.displayName || 'Passenger',
        seatNumber: seat,
        status: 'confirmed',
        paymentMethod: 'Electronic',
        createdAt: new Date().toISOString(),
        qrCode: `TKT-${trip.id}-${seat}-${Date.now()}`
      };
      await addDoc(collection(db, 'bookings'), bookingData);
      setView('TICKET');
    } catch (e) {
      handleFirestoreError(e, 'write' as any, 'bookings');
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBookings = async () => {
    if (!user) {
      await loginWithGoogle();
      return;
    }
    setLoading(true);
    try {
      const q = query(collection(db, 'bookings'), where('userId', '==', user.uid));
      const snapshot = await getDocs(q);
      const bookingData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Booking));
      setMyBookings(bookingData);
      setView('BOOKINGS');
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-gray-900 font-sans selection:bg-orange-100 selection:text-orange-900 overflow-x-hidden" dir="rtl">
      <Navbar 
        user={user} 
        onLogin={loginWithGoogle} 
        onLogout={logout} 
        onShowBookings={fetchMyBookings} 
      />

      <main className="pt-24 pb-12 px-6 max-w-5xl mx-auto">
        <AnimatePresence mode="wait">
          {view === 'HOME' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              {/* Hero Section */}
              <div className="text-center space-y-6 pt-12">
                <motion.h1 
                  className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 leading-[1.1]"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  سافر بذكاء، <br />
                  <span className="text-orange-500">احجز مقعدك</span> بسهولة
                </motion.h1>
                <p className="text-gray-500 text-lg md:text-xl max-w-2xl mx-auto font-medium">
                  منصة موحدة لحجز مقاعد الباصات لجميع المدن العراقية. سرعة، أمان، وراحة تامة.
                </p>
              </div>

              {/* Search Card */}
              <div className="bg-white p-8 rounded-[32px] shadow-sm border border-gray-100 grid md:grid-cols-4 gap-6 items-end relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full blur-3xl -mr-16 -mt-16 opacity-50"></div>
                
                <div className="space-y-2 relative">
                  <label className="text-xs uppercase tracking-widest text-gray-400 font-bold flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> من أين؟
                  </label>
                  <select 
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-gray-700 font-medium focus:ring-2 focus:ring-orange-500 transition-all appearance-none"
                    value={searchParams.from}
                    onChange={(e) => setSearchParams({ ...searchParams, from: e.target.value })}
                  >
                    <option value="">اختر مدينة</option>
                    {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2 relative">
                  <label className="text-xs uppercase tracking-widest text-gray-400 font-bold flex items-center gap-2">
                    <MapPin className="w-3 h-3" /> إلى أين؟
                  </label>
                  <select 
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-gray-700 font-medium focus:ring-2 focus:ring-orange-500 transition-all appearance-none"
                    value={searchParams.to}
                    onChange={(e) => setSearchParams({ ...searchParams, to: e.target.value })}
                  >
                    <option value="">اختر مدينة</option>
                    {cities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div className="space-y-2 relative">
                  <label className="text-xs uppercase tracking-widest text-gray-400 font-bold flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> التاريخ
                  </label>
                  <input 
                    type="date"
                    className="w-full bg-gray-50 border-none rounded-2xl py-4 px-4 text-gray-700 font-medium focus:ring-2 focus:ring-orange-500 transition-all"
                    value={searchParams.date}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                  />
                </div>

                <button 
                  onClick={handleSearch}
                  disabled={loading || !searchParams.from || !searchParams.to}
                  className="bg-orange-500 hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-2xl py-4 px-6 font-bold flex items-center justify-center gap-2 shadow-lg shadow-orange-200 transition-all active:scale-95 h-[56px]"
                >
                  {loading ? 'جاري البحث...' : <><Search className="w-5 h-5" /> ابحث الآن</>}
                </button>
              </div>

              {/* USP Section */}
              <div className="grid md:grid-cols-3 gap-8 text-center pt-8">
                {[
                  { icon: ShieldCheck, title: 'حجز مؤكد', desc: 'مقاعدك مضمونة بنسبة 100% عند الحجز' },
                  { icon: CreditCard, title: 'دفع سهل', desc: 'ادفع عبر زين كاش أو منافذ البيع' },
                  { icon: Clock, title: 'رحلات دقيقة', desc: 'مواعيد مضبوطة وانطلاق في الوقت المحدد' }
                ].map((item, i) => (
                  <div key={i} className="p-6 space-y-4">
                    <div className="w-12 h-12 bg-gray-900 text-white rounded-2xl flex items-center justify-center mx-auto shadow-xl">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-bold text-xl">{item.title}</h3>
                    <p className="text-gray-500 leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {view === 'RESULTS' && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">الرحلات المتوفرة</h2>
                  <p className="text-gray-500 mt-1">من {searchParams.from} إلى {searchParams.to}</p>
                </div>
                <button 
                  onClick={() => setView('HOME')}
                  className="text-orange-500 font-bold flex items-center gap-1 hover:underline"
                >
                  <ArrowRight className="w-4 h-4 rotate-180" /> تعديل البحث
                </button>
              </div>

              <div className="grid gap-6">
                {trips.length > 0 ? trips.map((trip) => (
                  <motion.div 
                    key={trip.id}
                    layoutId={trip.id}
                    className="bg-white p-6 rounded-[24px] border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row items-center gap-8"
                  >
                    <div className="flex-1 flex items-center justify-between w-full">
                      <div className="space-y-1">
                        <p className="text-2xl font-bold text-gray-900 text-right">{format(new Date(trip.departureTime), 'HH:mm')}</p>
                        <p className="text-sm font-medium text-gray-400">{trip.departureCity}</p>
                      </div>
                      
                      <div className="flex-1 px-8 flex flex-col items-center">
                        <div className="w-full flex items-center gap-2">
                          <div className="h-[2px] flex-1 bg-gray-100 relative">
                            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-300"></div>
                          </div>
                          <Bus className="w-5 h-5 text-orange-500" />
                          <div className="h-[2px] flex-1 bg-gray-100 relative">
                            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-gray-300"></div>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-gray-400 mt-2 tracking-widest uppercase">4 ساعات</span>
                      </div>

                      <div className="space-y-1 text-left">
                        <p className="text-2xl font-bold text-gray-900">{format(new Date(trip.arrivalTime), 'HH:mm')}</p>
                        <p className="text-sm font-medium text-gray-400">{trip.arrivalCity}</p>
                      </div>
                    </div>

                    <div className="w-px h-12 bg-gray-100 hidden md:block"></div>

                    <div className="md:w-48 w-full space-y-4">
                      <div className="flex justify-between items-center md:flex-col md:items-start gap-1">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">السعر</span>
                        <p className="text-2xl font-black text-orange-500">{trip.price.toLocaleString()} د.ع</p>
                      </div>
                      <button 
                        onClick={() => { setSelectedTrip(trip); setView('SEAT'); }}
                        className="w-full bg-gray-900 text-white rounded-xl py-3 font-bold hover:bg-orange-500 transition-all flex items-center justify-center gap-2"
                      >
                        اختيار المقعد <ChevronRight className="w-4 h-4 rotate-180" />
                      </button>
                    </div>
                  </motion.div>
                )) : (
                  <div className="text-center py-24 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 font-medium">عذراً، لم نجد رحلات مطابقة لبحثك</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {view === 'SEAT' && selectedTrip && (
            <motion.div 
              key="seat"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-8"
            >
              <div className="text-center space-y-2">
                <h2 className="text-3xl font-bold">اختر مقعدك</h2>
                <p className="text-gray-500">رحلة {selectedTrip.departureCity} إلى {selectedTrip.arrivalCity}</p>
              </div>

              <div className="bg-white p-12 rounded-[40px] shadow-sm border border-gray-100 max-w-sm mx-auto">
                <div className="grid grid-cols-4 gap-4">
                  {/* Bus Driver Seat Placeholder */}
                  <div className="col-start-4 mb-8">
                    <div className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center text-white">
                      <UserIcon className="w-5 h-5" />
                    </div>
                  </div>

                  {Array.from({ length: 40 }, (_, i) => i + 1).map((seat) => {
                    const isTaken = !selectedTrip.availableSeats.includes(seat);
                    const isSelected = selectedSeat === seat;
                    
                    return (
                      <button
                        key={seat}
                        disabled={isTaken}
                        onClick={() => setSelectedSeat(isSelected ? null : seat)}
                        className={`
                          aspect-square rounded-xl text-sm font-bold transition-all
                          ${isTaken ? 'bg-gray-100 text-gray-300 cursor-not-allowed' : 
                            isSelected ? 'bg-orange-500 text-white scale-110 shadow-lg shadow-orange-200' : 
                            'bg-gray-50 text-gray-500 hover:bg-orange-100 hover:text-orange-600'}
                        `}
                      >
                        {seat}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-8 flex justify-between text-xs font-bold uppercase tracking-widest text-gray-400">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-100 rounded"></div> متاح
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded"></div> مختار
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-300 rounded"></div> محجوز
                  </div>
                </div>
              </div>

              <div className="fixed bottom-8 left-0 right-0 px-6 max-w-5xl mx-auto flex justify-center">
                <motion.button 
                  initial={{ y: 100 }}
                  animate={{ y: 0 }}
                  disabled={!selectedSeat || loading}
                  onClick={() => handleBooking(selectedTrip, selectedSeat!)}
                  className="bg-gray-900 text-white px-12 py-5 rounded-[24px] font-bold text-lg shadow-2xl flex items-center gap-3 disabled:opacity-50 transition-all active:scale-95"
                >
                  {loading ? 'جاري الحجز...' : <>تأكيد حجز مقعد {selectedSeat} <ArrowRight className="w-5 h-5 rotate-180" /></>}
                </motion.button>
              </div>
            </motion.div>
          )}

          {view === 'TICKET' && (
            <motion.div 
              key="ticket"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-md mx-auto pt-10"
            >
              <div className="bg-white rounded-[40px] shadow-2xl shadow-orange-100/50 overflow-hidden relative border border-orange-50">
                <div className="bg-orange-500 p-8 text-white text-center space-y-2">
                  <div className="bg-white/20 w-16 h-16 rounded-3xl flex items-center justify-center mx-auto backdrop-blur-md mb-4">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-bold">تم الحجز بنجاح!</h3>
                  <p className="text-orange-100 font-medium">تذكرتك الرقمية جاهزة</p>
                </div>
                
                <div className="p-8 space-y-8">
                   <div className="flex justify-center p-6 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
                    <QRCodeSVG value={`TICKET-${selectedSeat}-${selectedTrip?.id}`} size={180} />
                   </div>

                   <div className="grid grid-cols-2 gap-8 text-right">
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">الرحلة</p>
                        <p className="font-bold text-gray-900">{selectedTrip?.departureCity} - {selectedTrip?.arrivalCity}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">رقم المقعد</p>
                        <p className="font-bold text-gray-900">{selectedSeat}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">الوقت</p>
                        <p className="font-bold text-gray-900">{selectedTrip ? format(new Date(selectedTrip.departureTime), 'HH:mm') : ''}</p>
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">المبلغ</p>
                        <p className="font-bold text-orange-500">{selectedTrip?.price.toLocaleString()} د.ع</p>
                      </div>
                   </div>
                </div>

                <div className="bg-gray-50 p-6 border-t border-gray-100 text-center">
                  <button 
                    onClick={() => setView('HOME')}
                    className="text-gray-500 font-bold text-sm hover:text-gray-900"
                  >
                    العودة للرئيسية
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'BOOKINGS' && (
            <motion.div 
              key="bookings"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-8"
            >
               <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold">رحلاتي القادمة</h2>
                <button 
                  onClick={() => setView('HOME')}
                  className="text-orange-500 font-bold hover:underline"
                >
                  العودة للرئيسية
                </button>
              </div>

              <div className="grid gap-4">
                {myBookings.length > 0 ? myBookings.map(booking => (
                  <div key={booking.id} className="bg-white p-6 rounded-[24px] border border-gray-100 flex items-center justify-between shadow-sm">
                    <div className="space-y-1">
                       <p className="font-bold text-lg">مقعد {booking.seatNumber}</p>
                       <p className="text-gray-400 text-sm">{format(new Date(booking.createdAt), 'yyyy/MM/dd')}</p>
                    </div>
                    <div className="flex items-center gap-4">
                       <div className="text-left">
                          <p className="font-bold text-green-500 bg-green-50 px-3 py-1 rounded-full text-xs uppercase tracking-widest">مؤكد</p>
                       </div>
                       <QrCode className="w-6 h-6 text-gray-400" />
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-24 bg-gray-50 rounded-[32px] border-2 border-dashed border-gray-200">
                    <p className="text-gray-400 font-medium">ليس لديك أي حجوزات حالياً</p>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
