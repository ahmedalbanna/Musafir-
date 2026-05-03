import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bus, MapPin, Calendar, Search, User as UserIcon, 
  LogOut, Ticket as TicketIcon, ChevronRight, ArrowRight,
  Clock, ShieldCheck, CreditCard, QrCode, Star, Navigation,
  LayoutDashboard, Lock, CheckCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { QRCodeSVG } from 'qrcode.react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

import { getTrips, mockCities, getCompany, getBus, mockTrips } from './data/mock';
import { Trip, Booking } from './types';
import Dashboard from './components/Dashboard';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// Mock User Session
const MOCK_USER = { uid: 'u1', displayName: 'أحمد صالح', email: 'ahmed@example.com' };

export default function App() {
  const [user, setUser] = useState<typeof MOCK_USER | null>(MOCK_USER);
  const [view, setView] = useState<'HOME' | 'RESULTS' | 'SEAT' | 'CHECKOUT' | 'SHELLEN_PAYMENT' | 'TICKET' | 'BOOKINGS'>('HOME');
  const [isOperatorMode, setIsOperatorMode] = useState(false);
  
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

  const proceedToCheckout = () => {
    if (!selectedSeat) return;
    setView('CHECKOUT');
  };

  const handleCreateTicket = async () => {
    setLoading(true);
    // Simulate payment API delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (selectedTrip && selectedSeat && user) {
      const newBooking: Booking = {
        id: `BKG-${Math.random().toString(36).substring(2, 9).toUpperCase()}`,
        tripId: selectedTrip.id,
        userId: user.uid,
        passengerName: user.displayName,
        seatNumber: selectedSeat,
        status: 'confirmed',
        paymentMethod: 'Shellen Wallet',
        createdAt: new Date().toISOString(),
        qrCode: `QR-${selectedTrip.id}-${selectedSeat}-${Date.now()}`
      };
      setMyBookings(prev => [newBooking, ...prev]);
      setTicketData(newBooking);
      setView('TICKET');
    }
    setLoading(false);
  };

  if (isOperatorMode) {
    return <Dashboard onExit={() => setIsOperatorMode(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-gray-900 font-sans selection:bg-amber-200 selection:text-amber-900 overflow-x-hidden pb-24" dir="rtl">
      {/* Role Switcher (Demo Only) */}
      <div className="fixed bottom-6 left-6 z-[60]">
        <button 
          onClick={() => setIsOperatorMode(true)}
          className="bg-emerald-950 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-2xl shadow-emerald-900/50 hover:bg-emerald-800 transition-all active:scale-95 flex items-center gap-2 border border-emerald-700/50"
        >
          <LayoutDashboard className="w-4 h-4" /> لوحة تحكم الشركات
        </button>
      </div>

      {/* Premium Minimal Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#F8F9FA]/80 backdrop-blur-xl border-b border-gray-200/50 px-6 py-4 flex items-center justify-between transition-all">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('HOME')}>
          <div className="bg-emerald-900 p-2.5 rounded-2xl shadow-lg shadow-emerald-900/20">
            <Bus className="text-white w-5 h-5" />
          </div>
          <span className="text-2xl font-black tracking-tight text-emerald-950 font-display">
            سفري <span className="text-emerald-600/80 font-medium text-lg">Safary</span>
          </span>
        </div>
        
        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setView('BOOKINGS')}
                className="hidden sm:flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-emerald-700 transition-colors uppercase tracking-widest"
              >
                <TicketIcon className="w-4 h-4" /> حجوزاتي
              </button>
              <div className="flex items-center gap-3 pl-2 pr-4 py-1.5 bg-white border border-gray-200 rounded-full shadow-sm">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                  {user.displayName.charAt(0)}
                </div>
                <span className="text-sm font-bold text-gray-800 hidden sm:inline">{user.displayName}</span>
                <button onClick={() => setUser(null)} className="text-gray-400 hover:text-red-500 ml-2 transition-colors">
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <button 
              onClick={() => setUser(MOCK_USER)}
              className="bg-emerald-950 text-white px-6 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-emerald-800 transition-all shadow-md active:scale-95"
            >
              <UserIcon className="w-4 h-4" /> دخول
            </button>
          )}
        </div>
      </nav>

      <main className="pt-28 px-4 sm:px-6 max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          
          {/* --- HOME VIEW --- */}
          {view === 'HOME' && (
            <motion.div 
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="space-y-16"
            >
              {/* Hero */}
              <div className="text-center pt-8 pb-4 space-y-6">
                <h1 className="text-5xl md:text-7xl font-black text-emerald-950 font-display leading-[1.1] tracking-tight">
                  الوجهة القادمة، <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-l from-emerald-600 to-emerald-400">بحجز أسهل.</span>
                </h1>
                <p className="text-gray-500 text-lg md:text-xl max-w-xl mx-auto font-medium leading-relaxed">
                  احجز تذكرتك الرقمية لجميع محافظات العراق في ثوانٍ.
                </p>
              </div>

              {/* Search Widget - Minimal Utility Card */}
              <div className="max-w-4xl mx-auto bg-white p-4 sm:p-6 rounded-[2rem] shadow-xl shadow-emerald-900/5 border border-gray-100 flex flex-col md:flex-row items-center gap-4 relative z-10">
                
                <div className="flex-1 w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-[1.5rem] p-4 transition-colors">
                  <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    <Navigation className="w-3.5 h-3.5" /> الانطلاق
                  </label>
                  <select 
                    className="w-full bg-transparent border-none p-0 text-xl font-bold text-emerald-950 focus:ring-0 cursor-pointer appearance-none outline-none"
                    value={searchParams.from}
                    onChange={(e) => setSearchParams({ ...searchParams, from: e.target.value })}
                  >
                    {mockCities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div className="hidden md:flex items-center justify-center -mx-6 z-10">
                  <div className="bg-white p-2 text-gray-300 rounded-full border border-gray-100 shadow-sm">
                    <ArrowRight className="w-5 h-5 text-emerald-500" />
                  </div>
                </div>

                <div className="flex-1 w-full bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-[1.5rem] p-4 transition-colors">
                  <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    <MapPin className="w-3.5 h-3.5" /> الوجهة
                  </label>
                  <select 
                    className="w-full bg-transparent border-none p-0 text-xl font-bold text-emerald-950 focus:ring-0 cursor-pointer appearance-none outline-none"
                    value={searchParams.to}
                    onChange={(e) => setSearchParams({ ...searchParams, to: e.target.value })}
                  >
                    {mockCities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>

                <div className="flex-1 w-full md:max-w-[200px] bg-gray-50/50 hover:bg-gray-50 border border-gray-100 rounded-[1.5rem] p-4 transition-colors">
                  <label className="text-[10px] sm:text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                    <Calendar className="w-3.5 h-3.5" /> الموعد
                  </label>
                  <input 
                    type="date"
                    className="w-full bg-transparent border-none p-0 text-lg font-bold text-emerald-950 focus:ring-0 outline-none"
                    value={searchParams.date}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    onChange={(e) => setSearchParams({ ...searchParams, date: e.target.value })}
                  />
                </div>

                <button 
                  onClick={handleSearch}
                  disabled={loading || searchParams.from === searchParams.to}
                  className="w-full md:w-auto md:aspect-square md:h-[90px] bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-emerald-600/30 transition-all active:scale-95 flex-shrink-0 p-4 md:p-0"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2 md:block">
                       <Search className="w-6 h-6 mx-auto" />
                       <span className="md:hidden font-bold">ابحث عن رحلة</span>
                    </span>
                  )}
                </button>
              </div>

              {/* Value Props - Minimal */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto py-12">
                {[
                  { icon: QrCode, title: 'تذكرة رقمية بالكامل', desc: 'وداعاً للورق، تذكرتك دائماً في هاتفك وجاهزة للمسح.' },
                  { icon: CreditCard, title: 'دفع سلس عبر شِلّن', desc: 'ادفع بأمان عبر محفظتك الإلكترونية المفضلة أو زين كاش.' },
                  { icon: ShieldCheck, title: 'مقاعد مؤكدة 100%', desc: 'تكامل مباشر مع أنظمة شركات النقل لضمان حجزك.' }
                ].map((item, i) => (
                  <div key={i} className="text-right space-y-3 p-6 rounded-[2rem] hover:bg-white transition-colors">
                    <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-sm border border-emerald-100">
                      <item.icon className="w-6 h-6" />
                    </div>
                    <h3 className="font-black text-xl text-emerald-950 font-display">{item.title}</h3>
                    <p className="text-gray-500 font-medium leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* --- RESULTS VIEW --- */}
          {view === 'RESULTS' && (
            <motion.div 
              key="results"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-8 max-w-4xl mx-auto"
            >
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-gray-200 pb-6">
                <div>
                  <button onClick={() => setView('HOME')} className="text-emerald-600 text-sm font-bold flex items-center gap-1 mb-3 hover:underline">
                    <ArrowRight className="w-4 h-4" /> عودة للبحث
                  </button>
                  <h2 className="text-3xl font-black font-display text-emerald-950">
                    {searchParams.from} <ArrowRight className="inline w-6 h-6 mx-2 text-gray-300" /> {searchParams.to}
                  </h2>
                  <p className="text-gray-500 font-medium mt-1">{format(new Date(searchParams.date), 'dd MMMM yyyy')}</p>
                </div>
                <div className="bg-white px-4 py-2 rounded-xl text-sm font-bold text-gray-500 border border-gray-200 shadow-sm inline-block self-start md:self-auto">
                  {trips.length} رحلات متاحة
                </div>
              </div>

              <div className="space-y-4">
                {trips.map(trip => {
                  const company = getCompany(trip.companyId);
                  const bus = getBus(trip.busId);
                  return (
                    <div key={trip.id} className="bg-white rounded-[2rem] p-6 sm:p-8 flex flex-col lg:flex-row items-center gap-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                      
                      {/* Company Info */}
                      <div className="flex lg:flex-col items-center lg:items-start justify-between w-full lg:w-48 border-b lg:border-b-0 lg:border-l border-gray-100 pb-6 lg:pb-0 lg:pl-6 gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-emerald-50 text-emerald-700 rounded-xl flex items-center justify-center font-black text-xl">
                            {company?.logo}
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-900">{company?.name}</h3>
                            <div className="flex items-center text-amber-500 text-xs mt-1 font-bold">
                              <Star className="w-3 h-3 fill-amber-500 ml-1" /> {company?.rating}
                            </div>
                          </div>
                        </div>
                        <div className="bg-gray-50 px-3 py-1 rounded-lg text-xs font-bold text-gray-500 border border-gray-200">
                          باص {bus?.type}
                        </div>
                      </div>

                      {/* Timeline */}
                      <div className="flex-1 flex items-center w-full relative">
                        <div className="w-24 text-left">
                          <p className="text-3xl font-black font-display text-emerald-950">{format(new Date(trip.departureTime), 'HH:mm')}</p>
                          <p className="text-sm font-bold text-gray-400 mt-1">{trip.departureCity}</p>
                        </div>
                        
                        <div className="flex-1 px-4 relative flex flex-col items-center">
                           <div className="absolute top-1/2 left-0 right-0 h-px bg-dashed border-t-2 border-dashed border-gray-200 -z-10 -translate-y-1/2"></div>
                           <div className="bg-white px-3 text-xs font-bold text-emerald-600 border border-emerald-100 rounded-full py-1">
                              4 ساعات
                           </div>
                        </div>

                        <div className="w-24 text-right">
                          <p className="text-3xl font-black font-display text-gray-400">{format(new Date(trip.arrivalTime), 'HH:mm')}</p>
                          <p className="text-sm font-bold text-gray-400 mt-1">{trip.arrivalCity}</p>
                        </div>
                      </div>

                      {/* Price & Action */}
                      <div className="w-full lg:w-auto flex flex-row lg:flex-col items-center lg:items-end justify-between border-t lg:border-t-0 border-gray-100 pt-6 lg:pt-0 gap-4">
                        <div className="text-right">
                          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-1">سعر التذكرة</p>
                          <p className="text-2xl font-black text-emerald-600">{trip.price.toLocaleString()} <span className="text-sm text-gray-500">د.ع</span></p>
                        </div>
                        <button 
                          onClick={() => { setSelectedTrip(trip); setSelectedSeat(null); setView('SEAT'); }}
                          className="bg-emerald-950 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-800 transition-colors flex items-center gap-2 lg:w-full justify-center group-hover:bg-emerald-600"
                        >
                          المقاعد <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>

                    </div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* --- SEAT SELECTION --- */}
          {view === 'SEAT' && selectedTrip && (
             <motion.div 
              key="seat"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-5xl mx-auto flex flex-col md:flex-row gap-8 items-start"
            >
              {/* Sidebar Booking Details */}
              <div className="w-full md:w-80 bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm sticky top-28 order-2 md:order-1">
                 <button onClick={() => setView('RESULTS')} className="text-gray-400 mb-6 hover:text-emerald-600 transition-colors">
                   <ArrowRight className="w-6 h-6" />
                 </button>
                 
                 <div className="space-y-6">
                    <div>
                      <h3 className="font-display font-black text-2xl text-emerald-950">{selectedTrip.departureCity} <ArrowRight className="inline w-4 h-4 mx-1 text-gray-300" /> {selectedTrip.arrivalCity}</h3>
                      <p className="text-sm font-bold text-gray-400 mt-1">{format(new Date(selectedTrip.departureTime), 'dd MMMM yyyy - HH:mm')}</p>
                    </div>

                    <div className="h-px bg-gray-100"></div>

                    <div className="flex justify-between items-center">
                       <span className="text-sm font-bold text-gray-500">المقعد المختار</span>
                       <span className="font-black text-xl text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                         {selectedSeat ? selectedSeat : '--'}
                       </span>
                    </div>

                    <div className="flex justify-between items-center">
                       <span className="text-sm font-bold text-gray-500">المبلغ الإجمالي</span>
                       <span className="font-black text-xl text-gray-900">
                         {selectedSeat ? selectedTrip.price.toLocaleString() : '0'} د.ع
                       </span>
                    </div>

                    <button 
                      disabled={!selectedSeat}
                      onClick={proceedToCheckout}
                      className="w-full py-4 mt-4 bg-emerald-600 text-white rounded-2xl font-bold disabled:opacity-30 disabled:bg-gray-300 transition-all flex justify-center items-center gap-2 hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-95"
                    >
                      متابعة الدفع
                    </button>
                 </div>
              </div>

              {/* Bus Layout - Minimal Hardware Style */}
              <div className="flex-1 w-full bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm order-1 md:order-2 flex flex-col items-center">
                <div className="mb-8 text-center">
                  <h2 className="text-2xl font-black font-display text-emerald-950">مخطط الحافلة</h2>
                  <p className="text-gray-500 text-sm font-medium">اختر مقعدك المفضل للرحلة</p>
                </div>

                <div className="bg-gray-50 p-8 rounded-[3rem] border border-gray-200 relative">
                  {/* Steering Wheel Indicator */}
                  <div className="flex justify-end mb-12 border-b-2 border-dashed border-gray-200 pb-6">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
                       <div className="w-6 h-6 border-2 border-gray-400 rounded-full relative">
                          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-400 -translate-y-1/2"></div>
                       </div>
                    </div>
                  </div>

                  {/* Seats Grid: 2 + 2 Layout assumption */}
                  <div className="grid grid-cols-4 gap-x-10 gap-y-4 relative">
                    {/* Middle Aisle Line */}
                    <div className="absolute top-0 bottom-0 left-[50%] w-px border-l-2 border-dashed border-gray-200 -translate-x-1/2"></div>
                    
                    {Array.from({ length: 40 }, (_, i) => i + 1).map((seat) => {
                      const isAvailable = selectedTrip.availableSeats.includes(seat);
                      const isSelected = selectedSeat === seat;
                      
                      return (
                        <button
                          key={seat}
                          disabled={!isAvailable}
                          onClick={() => setSelectedSeat(isSelected ? null : seat)}
                          className={cn(
                            "w-12 h-14 rounded-t-xl rounded-b-md flex items-center justify-center font-bold text-sm transition-all relative group",
                            "before:content-[''] before:absolute before:bottom-1 before:left-2 before:right-2 before:h-1.5 before:bg-black/10 before:rounded-full",
                            !isAvailable && "bg-gray-200 text-gray-400 opacity-50 cursor-not-allowed",
                            isAvailable && !isSelected && "bg-white border-2 border-gray-200 text-gray-600 hover:border-emerald-400 hover:text-emerald-600 shadow-sm",
                             isSelected && "bg-emerald-500 border-2 border-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-110 z-10 before:bg-emerald-700/50"
                          )}
                        >
                          {seat}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Legend */}
                <div className="flex items-center justify-center gap-6 mt-10 text-xs font-bold text-gray-500 px-6 py-3 bg-gray-50 rounded-full border border-gray-100">
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-white border-2 border-gray-200 rounded-sm"></div> متاح</div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-emerald-500 rounded-sm"></div> مختار</div>
                  <div className="flex items-center gap-2"><div className="w-4 h-4 bg-gray-200 rounded-sm opacity-50"></div> محجوز</div>
                </div>
              </div>
             </motion.div>
          )}

          {/* --- CHECKOUT VIEW --- */}
          {view === 'CHECKOUT' && selectedTrip && selectedSeat && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto"
            >
               <button onClick={() => setView('SEAT')} className="text-gray-400 mb-6 hover:text-emerald-600 transition-colors inline-block">
                 <ArrowRight className="w-6 h-6" />
               </button>
               
               <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-emerald-900/5 overflow-hidden">
                  <div className="bg-emerald-950 p-8 text-white relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-800 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4"></div>
                    <h2 className="text-2xl font-black font-display relative z-10">إتمام عملية الدفع</h2>
                    <p className="text-emerald-200 mt-2 relative z-10">الرجاء مراجعة تفاصيل الحجز قبل الدفع</p>
                  </div>

                  <div className="p-8 space-y-8">
                     <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-sm text-emerald-600">
                           <UserIcon strokeWidth={2.5} />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">بيانات المسافر</p>
                          <p className="font-bold text-gray-900">{user?.displayName || 'ضيف'}</p>
                        </div>
                     </div>

                     <div className="grid grid-cols-2 gap-4">
                        <div className="border border-gray-100 p-4 rounded-2xl">
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">الرحلة</p>
                           <p className="font-bold text-gray-900">{selectedTrip.departureCity} - {selectedTrip.arrivalCity}</p>
                        </div>
                        <div className="border border-gray-100 p-4 rounded-2xl">
                           <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">رقم المقعد</p>
                           <p className="font-black text-xl text-emerald-600">{selectedSeat}</p>
                        </div>
                     </div>

                     <div className="border border-emerald-100 bg-emerald-50/30 p-6 rounded-2xl">
                       <p className="text-sm font-bold text-emerald-800 mb-4 flex items-center gap-2"><CreditCard className="w-4 h-4" /> طريقة الدفع</p>
                       <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-emerald-200 cursor-pointer shadow-sm">
                          <div className="flex items-center gap-3">
                             <div className="w-10 h-10 bg-[#FF6B00] rounded-lg flex items-center justify-center text-white font-black text-xs font-display">
                               شِلّن
                             </div>
                             <span className="font-bold text-gray-900">محفظة شِلّن الرقمية</span>
                          </div>
                          <div className="w-5 h-5 rounded-full border-4 border-emerald-500 bg-white"></div>
                       </div>
                     </div>
                  </div>

                  <div className="bg-gray-50 p-8 border-t border-gray-100 flex items-center justify-between">
                     <div>
                       <p className="text-sm font-bold text-gray-500 mb-1">المبلغ المطلوب للدفع</p>
                       <p className="text-4xl font-black text-gray-900 font-display">{selectedTrip.price.toLocaleString()} <span className="text-lg text-gray-500">د.ع</span></p>
                     </div>
                     <button 
                       onClick={() => setView('SHELLEN_PAYMENT')}
                       className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:bg-emerald-700 shadow-lg shadow-emerald-600/30 transition-all active:scale-95 disabled:opacity-70"
                     >
                       متابعة الدفع
                     </button>
                  </div>
               </div>
            </motion.div>
          )}

          {/* --- SHELLEN WALLET PAYMENT SIMULATOR --- */}
          {view === 'SHELLEN_PAYMENT' && selectedTrip && selectedSeat && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md mx-auto"
            >
              <div className="bg-[#FF6B00] rounded-[2rem] shadow-2xl overflow-hidden relative">
                 <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl opacity-50 -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>
                 <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full blur-3xl opacity-50 translate-y-1/2 -translate-x-1/4 pointer-events-none"></div>

                 <div className="p-6 pb-0 flex justify-between items-center relative z-10">
                   <button onClick={() => setView('CHECKOUT')} className="text-white hover:bg-white/20 p-2 rounded-full transition-colors">
                     <ArrowRight className="w-5 h-5" />
                   </button>
                   <div className="font-display font-black text-white tracking-widest text-lg">شِلّن</div>
                 </div>

                 <div className="p-8 text-center text-white relative z-10">
                    <p className="text-white/80 font-bold mb-2">طلب دفع من</p>
                    <div className="bg-white/10 border border-white/20 inline-block px-4 py-2 rounded-xl backdrop-blur-sm mb-8 font-black text-lg">
                      تطبيق سفري Safary
                    </div>

                    <p className="text-sm font-bold text-white/80 mb-1">المبلغ المطلوب</p>
                    <p className="text-5xl font-black font-display mb-8">{selectedTrip.price.toLocaleString()} <span className="text-xl">د.ع</span></p>

                    <div className="bg-white rounded-3xl p-6 text-gray-900 shadow-xl text-right relative overflow-hidden">
                       {loading ? (
                          <div className="py-8 flex flex-col items-center justify-center">
                             <motion.div 
                               animate={{ rotate: 360 }}
                               transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                               className="w-12 h-12 border-4 border-gray-100 border-t-[#FF6B00] rounded-full mb-4"
                             />
                             <p className="font-bold text-gray-500">جاري التأكيد مع البنك المركزي...</p>
                          </div>
                       ) : (
                         <>
                           <div className="flex items-center gap-3 mb-6 bg-gray-50 p-4 rounded-xl">
                              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                                 <UserIcon className="w-5 h-5 text-gray-400" />
                              </div>
                              <div>
                                <p className="text-xs font-bold text-gray-400">حسابك</p>
                                <p className="font-black text-sm">{user?.displayName}</p>
                              </div>
                           </div>

                           <div className="flex items-center justify-center gap-2 text-sm font-bold text-gray-400 mb-6 bg-orange-50/50 p-3 rounded-lg border border-orange-100">
                              <Lock className="w-4 h-4 text-[#FF6B00]" /> الدفع محمي بتشفير البنك المركزي العراقي
                           </div>

                           <button 
                             onClick={handleCreateTicket}
                             className="w-full bg-[#FF6B00] text-white py-4 rounded-xl font-black flex items-center justify-center gap-2 hover:bg-[#E66000] transition-colors active:scale-95 shadow-lg shadow-[#ff6b00]/20"
                           >
                             السحب من الرصيد والتأكيد
                           </button>
                         </>
                       )}
                    </div>
                 </div>
              </div>
            </motion.div>
          )}

          {/* --- DIGITAL TICKET --- */}
          {view === 'TICKET' && ticketData && selectedTrip && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="max-w-md mx-auto pt-4"
            >
              <div className="bg-white rounded-[2rem] shadow-2xl shadow-emerald-900/10 overflow-hidden border border-gray-100 relative">
                
                {/* Torn edge effect (Top) */}
                <div className="h-4 w-full flex space-x-2 px-2 absolute top-0">
                   {Array.from({length: 15}).map((_, i) => <div key={i} className="w-4 h-4 bg-[#F8F9FA] rounded-full -mt-2"></div>)}
                </div>

                <div className="p-8 pt-10 text-center border-b-[3px] border-dashed border-gray-200 relative mb-4">
                  {/* Side cutouts */}
                  <div className="absolute top-[100%] left-0 w-6 h-6 bg-[#F8F9FA] rounded-full -translate-x-1/2 -translate-y-1/2 border-r border-gray-100"></div>
                  <div className="absolute top-[100%] right-0 w-6 h-6 bg-[#F8F9FA] rounded-full translate-x-1/2 -translate-y-1/2 border-l border-gray-100"></div>

                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-2xl font-black font-display text-emerald-950">رحلة مؤكدة</h3>
                  <p className="text-gray-500 font-bold text-sm mt-1">تذكرتك الرقمية جاهزة</p>
                </div>

                <div className="p-8 pt-4 space-y-6">
                   <div className="flex justify-center p-4 bg-white border-2 border-emerald-100 rounded-[2rem]">
                    <QRCodeSVG value={ticketData.qrCode} size={200} fgColor="#022c22" />
                   </div>
                   <p className="text-center font-mono text-xs font-bold text-gray-400 tracking-[0.2em]">{ticketData.id}</p>

                   <div className="grid grid-cols-2 gap-y-6 pt-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">المسار</p>
                        <p className="font-black text-gray-900 text-lg">{selectedTrip.departureCity} - {selectedTrip.arrivalCity}</p>
                      </div>
                      <div className="text-left">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">المقعد</p>
                        <p className="font-black text-emerald-600 text-3xl font-display">{ticketData.seatNumber}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">التاريخ والوقت</p>
                        <p className="font-bold text-gray-900">{format(new Date(selectedTrip.departureTime), 'MM/dd')}</p>
                        <p className="font-black text-gray-900">{format(new Date(selectedTrip.departureTime), 'HH:mm')}</p>
                      </div>
                      <div className="text-left py-2">
                         <div className="bg-emerald-50 py-1 px-3 rounded-lg inline-block border border-emerald-100">
                           <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">حالة الدفع</p>
                           <p className="font-black text-emerald-800 text-sm">مكتمل</p>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Torn edge effect (Bottom) */}
                 <div className="h-4 w-full flex space-x-2 px-2 absolute bottom-0">
                   {Array.from({length: 15}).map((_, i) => <div key={i} className="w-4 h-4 bg-[#F8F9FA] rounded-full -mb-2"></div>)}
                </div>
              </div>

              <div className="mt-8 text-center">
                <button 
                  onClick={() => {
                     setTicketData(null);
                     setView('HOME');
                  }}
                  className="bg-white border-2 border-gray-200 text-gray-600 px-8 py-3 rounded-full font-bold hover:border-emerald-600 hover:text-emerald-700 transition-colors"
                >
                  العودة للرئيسية
                </button>
              </div>
            </motion.div>
          )}

          {/* --- MY BOOKINGS --- */}
          {view === 'BOOKINGS' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-4xl mx-auto space-y-8"
            >
              <div className="flex items-center justify-between border-b border-gray-200 pb-6">
                <div>
                   <h2 className="text-3xl font-black font-display text-emerald-950">حجوزاتي القادمة</h2>
                </div>
                <button onClick={() => setView('HOME')} className="text-emerald-600 font-bold hover:underline flex items-center gap-1 text-sm border border-emerald-200 bg-emerald-50 px-4 py-2 rounded-lg">
                   <ArrowRight className="w-4 h-4" /> الرئيسية
                </button>
              </div>

              <div className="grid gap-6">
                {myBookings.length > 0 ? myBookings.map(booking => {
                  const trip = mockTrips.find(t => t.id === booking.tripId);
                  if (!trip) return null;
                  return (
                    <div key={booking.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 flex flex-col md:flex-row items-center justify-between shadow-sm hover:shadow-md transition-shadow gap-6 group">
                      <div className="flex items-center gap-6 w-full md:w-auto">
                         <div className="bg-gray-50 border border-gray-200 p-4 rounded-2xl text-center min-w-[80px]">
                            <p className="text-xs font-bold text-gray-400 mb-1">أغسطس</p>
                            <p className="text-3xl font-black text-gray-900 font-display">24</p>
                         </div>
                         <div>
                            <p className="font-black text-xl text-emerald-950 mb-1 font-display">
                               {trip.departureCity} - {trip.arrivalCity}
                            </p>
                            <div className="flex items-center gap-3 text-sm font-bold text-gray-500">
                               <Clock className="w-4 h-4" /> {format(new Date(trip.departureTime), 'HH:mm')} 
                               <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                               مقعد <span className="text-emerald-600 font-black px-1">{booking.seatNumber}</span>
                            </div>
                         </div>
                      </div>
                      
                      <div className="flex items-center gap-4 w-full md:w-auto border-t md:border-t-0 border-gray-100 pt-4 md:pt-0">
                         <div className="text-right flex-1 md:flex-none">
                            <p className="text-[10px] uppercase font-bold tracking-widest text-emerald-600 mb-1">مؤكد ومسدد</p>
                            <p className="font-mono text-xs text-gray-400">{booking.id}</p>
                         </div>
                         <button 
                           onClick={() => { setSelectedTrip(trip); setTicketData(booking); setView('TICKET'); }}
                           className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors border border-emerald-100 group-hover:border-emerald-600"
                         >
                           <QrCode className="w-6 h-6" />
                         </button>
                      </div>
                    </div>
                  )
                }) : (
                  <div className="text-center py-24 bg-white rounded-[3rem] border border-gray-100 shadow-sm">
                    <div className="w-20 h-20 bg-gray-50 text-gray-300 rounded-full flex items-center justify-center mx-auto mb-6">
                      <TicketIcon strokeWidth={1.5} className="w-10 h-10" />
                    </div>
                    <p className="text-xl font-bold text-gray-900 font-display mb-2">لا توجد حجوزات</p>
                    <p className="text-gray-500 font-medium">قم بالبحث عن رحلة وابدأ حجزك الأول</p>
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
