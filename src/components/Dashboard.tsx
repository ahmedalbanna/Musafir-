import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Bus as BusIcon, 
  Calendar, 
  TrendingUp, 
  Users, 
  Settings, 
  LogOut, 
  Plus, 
  MapPin, 
  Clock, 
  ChevronRight,
  ArrowRight,
  Search,
  Filter,
  BarChart3,
  DollarSign,
  Ticket,
  QrCode,
  CheckCircle2,
  XCircle,
  Briefcase,
  Percent,
  Star
} from 'lucide-react';
import { mockStats, mockTrips, mockBuses, mockBookings, mockCities } from '../data/mock';
import { Trip, Bus, Booking } from '../types';
import { format } from 'date-fns';

interface DashboardProps {
  onExit: () => void;
}

export default function Dashboard({ onExit }: DashboardProps) {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'TRIPS' | 'FLEET' | 'POS' | 'BOARDING' | 'REPORTS' | 'AGENTS'>('OVERVIEW');

  return (
    <div className="flex min-h-screen bg-[#F0F2F5] text-emerald-950 font-sans" dir="rtl">
      {/* Sidebar */}
      <aside className="w-64 bg-emerald-950 text-white flex flex-col sticky top-0 h-screen">
        <div className="p-8">
          <div className="flex items-center gap-3 mb-8">
            <div className="bg-emerald-600 p-2 rounded-xl">
              <BusIcon className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black font-display tracking-tight">سفري <span className="text-emerald-400 text-sm">Operator</span></span>
          </div>

          <nav className="space-y-2">
            {[
              { id: 'OVERVIEW', label: 'نظرة عامة', icon: LayoutDashboard },
              { id: 'TRIPS', label: 'الرحلات', icon: Calendar },
              { id: 'FLEET', label: 'الأسطول', icon: BusIcon },
              { id: 'POS', label: 'نقطة البيع (POS)', icon: Ticket },
              { id: 'BOARDING', label: 'التدقيق (Boarding)', icon: QrCode },
              { id: 'REPORTS', label: 'التقارير المالية', icon: TrendingUp },
              { id: 'AGENTS', label: 'إدارة الوكلاء', icon: Briefcase },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeTab === item.id 
                    ? 'bg-white/10 text-emerald-400 shadow-inner' 
                    : 'text-emerald-100/50 hover:bg-white/5 hover:text-white'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="mt-auto p-8 border-t border-white/10 space-y-4">
          <button className="flex items-center gap-3 text-emerald-100/50 hover:text-white text-sm font-bold transition-colors">
            <Settings className="w-5 h-5" /> الإعدادات
          </button>
          <button 
            onClick={onExit}
            className="flex items-center gap-3 text-red-400 hover:text-red-300 text-sm font-bold transition-colors"
          >
            <LogOut className="w-5 h-5" /> خروج للمسافر
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        <header className="flex justify-between items-center mb-10 bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-black font-display text-emerald-950">
              {activeTab === 'OVERVIEW' && 'نظرة عامة'}
              {activeTab === 'TRIPS' && 'إدارة الجداول'}
              {activeTab === 'FLEET' && 'أسطول الحافلات'}
              {activeTab === 'POS' && 'نقطة بيع التذاكر'}
              {activeTab === 'BOARDING' && 'تدقيق الركاب والصعود'}
              {activeTab === 'REPORTS' && 'التقارير والإحصائيات'}
              {activeTab === 'AGENTS' && 'إدارة الوكلاء ونقاط البيع'}
            </h1>
            <p className="text-emerald-600/60 font-bold mt-1">مرحباً بك في لوحة تحكم خطوط الشمال</p>
          </div>

          <div className="flex items-center gap-4">
             <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl shadow-inner border border-gray-100 font-bold text-sm">
                <span className="text-emerald-600">الحالة:</span>
                <span className="flex items-center gap-2 text-emerald-950">
                   متصل <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                </span>
             </div>
             <div className="bg-emerald-100 text-emerald-700 w-12 h-12 rounded-full flex items-center justify-center font-black shadow-sm">
                N
             </div>
          </div>
        </header>

        <section>
           {activeTab === 'OVERVIEW' && <OverviewTab />}
           {activeTab === 'TRIPS' && <TripsTab />}
           {activeTab === 'FLEET' && <FleetTab />}
           {activeTab === 'POS' && <PosTab />}
           {activeTab === 'BOARDING' && <BoardingTab />}
           {activeTab === 'REPORTS' && <ReportsTab />}
           {activeTab === 'AGENTS' && <AgentsTab />}
        </section>
      </main>
    </div>
  );
}

function OverviewTab() {
  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'إجمالي إيرادات اليوم', value: mockStats.dailyRevenue.toLocaleString() + ' د.ع', icon: DollarSign, trend: '+12.5%', color: 'emerald' },
          { label: 'الرحلات النشطة', value: mockStats.activeTrips, icon: Clock, trend: 'مستقرة', color: 'blue' },
          { label: 'حجوزات قيد الانتظار', value: mockStats.pendingBookings, icon: Users, trend: '+5', color: 'amber' },
          { label: 'معدل الإشغال', value: mockStats.averageOccupancy + '%', icon: BarChart3, trend: '+2.1%', color: 'purple' },
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-3 rounded-2xl bg-${stat.color}-50 text-${stat.color}-600`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <span className={`text-xs font-black ${stat.trend.startsWith('+') ? 'text-emerald-500' : 'text-gray-400'} px-2 py-1 rounded-full bg-gray-50`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-1">{stat.label}</p>
            <p className="text-2xl font-black text-emerald-950 font-display">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Weekly Chart Placeholder */}
        <div className="lg:col-span-2 bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-black text-xl text-emerald-950 font-display">نمو المبيعات الأسبوعي</h3>
            <select className="bg-gray-50 border-none rounded-xl text-xs font-bold text-gray-500 px-4 py-2">
               <option>آخر 7 أيام</option>
               <option>آخر 30 يوم</option>
            </select>
          </div>
          <div className="flex-1 flex items-end justify-between gap-4 h-48">
             {mockStats.weeklyRevenue.map((d, i) => (
               <div key={i} className="flex-1 flex flex-col items-center gap-3">
                  <div 
                    className="w-full bg-emerald-100 rounded-t-xl relative group transition-all hover:bg-emerald-600"
                    style={{ height: `${(d.value / 7000000) * 100}%` }}
                  >
                    <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-emerald-950 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                       {d.value.toLocaleString()}
                    </div>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400">{d.day}</span>
               </div>
             ))}
          </div>
        </div>

        {/* Recent Bookings */}
        <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100">
          <h3 className="font-black text-xl text-emerald-950 font-display mb-6">آخر الحجوزات</h3>
          <div className="space-y-6">
             {mockBookings.map((b) => (
               <div key={b.id} className="flex items-center justify-between group">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center font-bold text-emerald-700">
                        {b.passengerName.charAt(0)}
                     </div>
                     <div>
                        <p className="text-sm font-bold text-emerald-950">{b.passengerName}</p>
                        <p className="text-[10px] font-bold text-gray-400">مقعد {b.seatNumber} • {b.paymentMethod}</p>
                     </div>
                  </div>
                  <button className="p-2 text-gray-300 hover:text-emerald-600 transition-colors">
                     <ChevronRight className="w-4 h-4" />
                  </button>
               </div>
             ))}
          </div>
          <button className="w-full mt-8 py-3 rounded-xl border-2 border-dashed border-gray-100 text-gray-400 font-bold text-sm hover:border-emerald-200 hover:text-emerald-600 transition-all">
             عرض كافة الحجوزات
          </button>
        </div>
      </div>
    </div>
  );
}

function TripsTab() {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
         <div className="relative">
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="ابحث عن رحلة..." 
              className="bg-white border-gray-100 rounded-2xl pr-10 pl-4 py-2 text-sm font-medium focus:ring-emerald-500 w-64 shadow-sm"
            />
         </div>
         <div className="flex gap-3">
            <button className="bg-white border border-gray-100 px-4 py-2 rounded-2xl flex items-center gap-2 text-sm font-bold text-gray-500 hover:bg-gray-50 shadow-sm">
               <Filter className="w-4 h-4" /> تصفية
            </button>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-600 text-white px-6 py-2 rounded-2xl flex items-center gap-2 text-sm font-bold hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
            >
               <Plus className="w-4 h-4" /> إضافة رحلة جديدة
            </button>
         </div>
      </div>

      <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
         <table className="w-full text-right">
            <thead>
               <tr className="bg-gray-50">
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">معرف الرحلة</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">المسار</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">وقت الانطلاق</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">الإشغال</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">السعر</th>
                  <th className="px-6 py-4 text-xs font-black text-gray-400 uppercase tracking-widest">الإجراء</th>
               </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
               {mockTrips.map(trip => (
                 <tr key={trip.id} className="hover:bg-emerald-50/30 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs font-bold text-gray-400">#{trip.id.toUpperCase()}</td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-950">{trip.departureCity}</span>
                          <ArrowRight className="w-3 h-3 text-gray-300" />
                          <span className="font-bold text-emerald-950">{trip.arrivalCity}</span>
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2 text-sm font-bold text-emerald-950">
                          <Clock className="w-4 h-4 text-emerald-500" />
                          {format(new Date(trip.departureTime), 'HH:mm - MM/dd')}
                       </div>
                    </td>
                    <td className="px-6 py-4">
                       <div className="flex items-center gap-2">
                          <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                             <div 
                               className="h-full bg-emerald-500" 
                               style={{ width: `${((trip.availableSeats.length) / 40) * 100}%` }}
                             ></div>
                          </div>
                          <span className="text-xs font-bold text-emerald-700">{trip.availableSeats.length}/40</span>
                       </div>
                    </td>
                    <td className="px-6 py-4 font-black text-emerald-950">{trip.price.toLocaleString()} <span className="text-[10px] text-gray-400 font-normal">د.ع</span></td>
                    <td className="px-6 py-4">
                       <div className="flex gap-2">
                         <button className="text-gray-400 hover:text-emerald-600 text-xs font-bold bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">تعديل</button>
                         <button className="text-gray-400 hover:text-red-600 text-xs font-bold bg-white border border-gray-200 px-3 py-1.5 rounded-lg shadow-sm">إلغاء</button>
                       </div>
                    </td>
                 </tr>
               ))}
            </tbody>
         </table>
      </div>

      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-emerald-950/20 backdrop-blur-sm"
              onClick={() => setShowAddModal(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] p-8 max-w-2xl w-full relative z-10 shadow-2xl"
            >
              <h2 className="text-2xl font-black text-emerald-950 font-display mb-6">إضافة رحلة جديدة</h2>
              
              <div className="grid grid-cols-2 gap-6 mb-6">
                 <div>
                   <label className="block text-xs font-bold text-gray-400 mb-2">من</label>
                   <select className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold text-emerald-950 flex-1">
                     {mockCities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                   </select>
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-400 mb-2">إلى</label>
                   <select className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold text-emerald-950 flex-1" defaultValue="أربيل">
                     {mockCities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                   </select>
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-400 mb-2">وقت الانطلاق</label>
                   <input type="datetime-local" className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold text-emerald-950" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-400 mb-2">الحافلة المخصصة</label>
                   <select className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold text-emerald-950">
                     {mockBuses.map(b => <option key={b.id} value={b.id}>{b.plateNumber} ({b.type} - {b.totalSeats} مقعد)</option>)}
                   </select>
                 </div>
              </div>

              <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-8">
                 <h3 className="text-sm font-bold text-emerald-950 mb-4 flex items-center gap-2"><DollarSign className="w-4 h-4 text-emerald-600" /> التسعير الديناميكي (Dynamic Pricing)</h3>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2">السعر الأساسي</label>
                      <input type="number" defaultValue="25000" className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold text-emerald-950 focus:border-emerald-500 focus:ring-0" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-400 mb-2">سعر المواسم / الذروة</label>
                      <input type="number" defaultValue="35000" className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm font-bold text-emerald-950 focus:border-emerald-500 focus:ring-0" />
                    </div>
                 </div>
                 <div className="mt-4 flex items-center justify-between bg-white p-4 rounded-xl border border-emerald-100 shadow-sm">
                   <div>
                     <p className="text-sm font-bold text-emerald-950 mb-1">خصم الحجز المبكر</p>
                     <p className="text-xs text-gray-500">تطبيق خصم 10% قبل 48 ساعة من الانطلاق</p>
                   </div>
                   <div className="w-12 h-6 bg-emerald-500 rounded-full relative cursor-pointer">
                     <div className="w-5 h-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                   </div>
                 </div>
              </div>

              <div className="flex gap-4">
                 <button className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-95" onClick={() => setShowAddModal(false)}>
                   نشر وإتاحة للحجز
                 </button>
                 <button className="flex-1 bg-white border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50" onClick={() => setShowAddModal(false)}>
                   إلغاء
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function FleetTab() {
  const [showAddFleet, setShowAddFleet] = useState(false);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {mockBuses.map(bus => (
           <div key={bus.id} className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-gray-100 flex flex-col items-center text-center group hover:bg-emerald-900 hover:border-emerald-900 transition-all duration-500">
              <div className="w-20 h-20 bg-emerald-50 rounded-[2rem] flex items-center justify-center mb-6 group-hover:bg-emerald-800 transition-colors">
                 <BusIcon className="w-10 h-10 text-emerald-600 group-hover:text-emerald-400" />
              </div>
              <h3 className="font-black text-xl text-emerald-950 font-display mb-1 group-hover:text-white transition-colors">{bus.plateNumber}</h3>
              <p className="text-emerald-600/60 font-bold text-sm mb-6 group-hover:text-emerald-400 transition-colors">باص {bus.type} • {bus.totalSeats} مقعد</p>
              
              <div className="w-full grid grid-cols-2 gap-4 pt-6 border-t border-gray-50 group-hover:border-emerald-800">
                 <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">المخطط</p>
                    <p className="font-bold text-emerald-950 group-hover:text-white flex justify-center items-center gap-1">
                       {bus.layout === 'VIP (2+1)' ? (
                          <><Star className="w-3 h-3 text-amber-500" /> VIP (2+1)</>
                       ) : (
                          <>ثنائي (2+2)</>
                       )}
                    </p>
                 </div>
                 <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">الحالة</p>
                    <p className="font-bold text-emerald-500">جاهز للرحلة</p>
                 </div>
              </div>
              
              <button className="mt-8 w-full py-3 bg-gray-50 rounded-xl text-sm font-bold text-emerald-950 hover:bg-emerald-100 transition-colors group-hover:bg-emerald-800 group-hover:text-white">
                 التفاصيل والصيانة
              </button>
           </div>
         ))}
         <button 
            onClick={() => setShowAddFleet(true)}
            className="bg-gray-100/50 border-4 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-gray-400 hover:border-emerald-200 hover:text-emerald-600 hover:bg-white transition-all group min-h-[350px]"
         >
            <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4 group-hover:bg-emerald-50 transition-colors">
               <Plus className="w-8 h-8" />
            </div>
            <span className="font-black text-lg">إضافة مخطط / حافلة</span>
         </button>
      </div>

      <AnimatePresence>
        {showAddFleet && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-emerald-950/20 backdrop-blur-sm"
              onClick={() => setShowAddFleet(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-[2rem] p-8 max-w-2xl w-full relative z-10 shadow-2xl"
            >
              <h2 className="text-2xl font-black text-emerald-950 font-display mb-6">إضافة حافلة جديدة للأسطول</h2>
              
              <div className="grid grid-cols-2 gap-6 mb-8">
                 <div>
                   <label className="block text-xs font-bold text-gray-400 mb-2">نوع الحافلة (الشركة المصنعة)</label>
                   <input type="text" placeholder="مثال: Mercedes Tourismo" className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold text-emerald-950" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-400 mb-2">رقم اللوحة</label>
                   <input type="text" placeholder="بغداد 12345" className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold text-emerald-950" />
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-400 mb-2">مخطط المقاعد</label>
                   <select className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold text-emerald-950">
                     <option>ثنائي (2+2) - سعة 40 مقعد</option>
                     <option>VIP (2+1) - سعة 30 مقعد</option>
                     <option>مزدوج (طابقين) - سعة 60 مقعد</option>
                   </select>
                 </div>
                 <div>
                   <label className="block text-xs font-bold text-gray-400 mb-2">سنة الصنع</label>
                   <input type="number" defaultValue={2024} className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold text-emerald-950" />
                 </div>
              </div>

              <div className="flex gap-4">
                 <button className="flex-1 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20" onClick={() => setShowAddFleet(false)}>
                   حفظ الحافلة
                 </button>
                 <button className="flex-1 bg-white border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50" onClick={() => setShowAddFleet(false)}>
                   إلغاء
                 </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PosTab() {
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedTrip, setSelectedTrip] = useState<string | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [passengerName, setPassengerName] = useState('');
  const [ticketIssued, setTicketIssued] = useState(false);
  
  const trip = mockTrips.find(t => t.id === selectedTrip);
  const availableTrips = selectedCity ? mockTrips.filter(t => t.arrivalCity === selectedCity) : [];
  
  const handleIssueTicket = () => {
    if (trip && selectedSeat && passengerName) {
      setTicketIssued(true);
      setTimeout(() => {
        setTicketIssued(false);
        setSelectedSeat(null);
        setPassengerName('');
        setSelectedTrip(null);
        setSelectedCity('');
      }, 5000);
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex gap-8">
        <div className="w-1/3 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col relative overflow-hidden">
          {ticketIssued && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute inset-0 bg-emerald-600 z-10 flex flex-col items-center justify-center text-white p-6 text-center"
            >
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-black text-2xl font-display mb-1">تم إصدار التذكرة!</h3>
              <p className="text-emerald-100 font-bold mb-6">يمكنك طباعة التذكرة وتسليمها للمسافر</p>
              <div className="bg-white text-emerald-950 p-4 rounded-xl w-full border border-emerald-100 mb-6">
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
                  <span className="text-xs text-gray-500 font-bold">رقم التذكرة</span>
                  <span className="font-mono font-black text-sm">#TK-{Math.floor(1000 + Math.random() * 9000)}</span>
                </div>
                <div className="flex justify-between items-center mb-2 pb-2 border-b border-gray-100">
                  <span className="text-xs text-gray-500 font-bold">الرحلة</span>
                  <span className="font-bold text-sm">{selectedCity}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500 font-bold">المقعد</span>
                  <span className="font-black text-emerald-600 text-lg">{selectedSeat}</span>
                </div>
              </div>
              <button onClick={() => setTicketIssued(false)} className="w-full bg-white text-emerald-600 font-bold py-3 rounded-xl hover:bg-emerald-50 transition-colors">
                إصدار تذكرة جديدة
              </button>
            </motion.div>
          )}

          <h2 className="text-xl font-black text-emerald-950 font-display mb-6">الحجز اليدوي (المكتب)</h2>
          
          <div className="space-y-4 flex-1">
             <div>
               <label className="block text-xs font-bold text-gray-400 mb-2">الوجهة</label>
               <select 
                 className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold text-emerald-950"
                 value={selectedCity}
                 onChange={(e) => { setSelectedCity(e.target.value); setSelectedTrip(null); setSelectedSeat(null); }}
               >
                 <option value="">اختر الوجهة</option>
                 {mockCities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
               </select>
             </div>
             
             <div>
               <label className="block text-xs font-bold text-gray-400 mb-2">اسم المسافر</label>
               <input 
                 type="text" 
                 value={passengerName}
                 onChange={(e) => setPassengerName(e.target.value)}
                 placeholder="أدخل اسم المسافر..." 
                 className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold text-emerald-950 placeholder-gray-300" 
               />
             </div>
             
             <div>
               <label className="block text-xs font-bold text-gray-400 mb-2">رقم الجوال (اختياري)</label>
               <input type="tel" placeholder="07XX XXX XXXX" className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold text-emerald-950 placeholder-gray-300 text-left" dir="ltr" />
             </div>
          </div>
          
          <div className="pt-6 border-t border-gray-100 mt-6 space-y-4">
             <div className="flex justify-between items-center text-emerald-950 font-bold">
               <span>الإجمالي</span>
               <span className="text-2xl font-black">{trip ? trip.price.toLocaleString() : 0} <span className="text-sm text-gray-400">د.ع</span></span>
             </div>
             <button 
                onClick={handleIssueTicket}
                disabled={!trip || !selectedSeat || !passengerName}
                className={`w-full font-bold py-4 rounded-2xl transition-all shadow-lg ${
                  trip && selectedSeat && passengerName 
                    ? 'bg-emerald-600 text-white shadow-emerald-600/20 active:scale-95 hover:bg-emerald-700' 
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed shadow-none'
                }`}
             >
               إصدار تذكرة وطباعة
             </button>
          </div>
        </div>

        <div className="flex-1 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
            {selectedCity ? (
               <div className="space-y-6">
                  <div>
                    <h3 className="text-lg font-black text-emerald-950 font-display mb-4">الرحلات المتاحة إلى {selectedCity}</h3>
                    {availableTrips.length > 0 ? (
                      <div className="grid grid-cols-2 gap-4">
                        {availableTrips.map(t => (
                          <div 
                            key={t.id} 
                            onClick={() => setSelectedTrip(t.id)}
                            className={`p-4 rounded-2xl border-2 transition-all cursor-pointer ${
                              selectedTrip === t.id ? 'border-emerald-500 bg-emerald-50' : 'border-gray-100 hover:border-emerald-200'
                            }`}
                          >
                            <div className="flex justify-between items-center mb-2">
                              <span className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                                <Clock className="w-4 h-4 text-emerald-500" />
                                {format(new Date(t.departureTime), 'HH:mm')}
                              </span>
                              <span className="text-xs font-black text-emerald-600">{t.price.toLocaleString()} د.ع</span>
                            </div>
                            <span className="text-[10px] font-bold text-gray-400">باص {t.busId.replace('bus-', '')} • متبقي {t.availableSeats.length} مقعد</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-100">
                        <p className="font-bold text-gray-500">لا توجد رحلات متاحة لهذه الوجهة اليوم</p>
                      </div>
                    )}
                  </div>

                  {trip && (
                    <div className="pt-6 border-t border-gray-100">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-black text-emerald-950 font-display">اختر المقعد</h3>
                        <span className="text-xs font-bold px-3 py-1 bg-gray-100 rounded-lg text-gray-500">
                          {trip.availableSeats.length} متاحة
                        </span>
                      </div>
                      <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200 flex flex-col items-center max-w-sm mx-auto">
                        <div className="w-full flex justify-between px-8 mb-8 text-gray-300">
                           <span className="text-xs font-bold">السائق</span>
                           <span className="text-xs font-bold">الباب</span>
                        </div>
                        <div className="grid grid-cols-4 gap-4 w-full">
                          {Array.from({ length: 40 }).map((_, i) => {
                            const seatNum = i + 1;
                            const isAvailable = trip.availableSeats.includes(seatNum);
                            const isSelected = selectedSeat === seatNum;
                            return (
                              <button
                                key={seatNum}
                                disabled={!isAvailable}
                                onClick={() => setSelectedSeat(seatNum)}
                                className={`w-10 h-10 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                                  isSelected 
                                    ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/30 scale-110' 
                                    : isAvailable 
                                      ? 'bg-white text-emerald-950 hover:bg-emerald-100 border border-gray-200 shadow-sm' 
                                      : 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-50'
                                } ${i % 4 === 1 ? 'ml-6' : ''}`}
                              >
                                {seatNum}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
               </div>
            ) : (
                <div className="text-center text-gray-300 h-full flex flex-col items-center justify-center">
                  <MapPin className="w-16 h-16 mx-auto mb-4 opacity-50" />
                  <p className="font-bold text-lg">اختر الوجهة لعرض الرحلات</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}

function BoardingTab() {
  const [scanStatus, setScanStatus] = useState<'IDLE' | 'SUCCESS' | 'ERROR'>('IDLE');
  const [selectedTripId, setSelectedTripId] = useState<string>('trip-2');

  const trip = mockTrips.find(t => t.id === selectedTripId);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-xl font-black text-emerald-950 font-display">تدقيق الرحلات النشطة (Boarding)</h2>
          <p className="text-sm font-bold text-gray-400 mt-1">امسح تذاكر الركاب قبل الصعود لتأكيد الحضور.</p>
        </div>
        <select 
          value={selectedTripId} 
          onChange={(e) => setSelectedTripId(e.target.value)}
          className="bg-gray-50 border-none rounded-xl p-3 text-sm font-bold text-emerald-950 min-w-[250px]"
        >
          {mockTrips.map(t => (
            <option key={t.id} value={t.id}>{t.departureCity} - {t.arrivalCity} ({format(new Date(t.departureTime), 'HH:mm')})</option>
          ))}
        </select>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Boarding List */}
        <div className="w-full lg:w-1/3 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="font-black text-xl text-emerald-950 font-display">قائمة الركاب</h3>
            <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full">
              {mockBookings.filter(b => b.tripId === selectedTripId).length} ركاب
            </span>
          </div>
          
          <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {mockBookings.filter(b => b.tripId === selectedTripId).map((b, i) => (
              <div key={b.id} className="flex items-center justify-between p-3 rounded-xl border border-gray-50 bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${i % 2 === 0 ? 'bg-emerald-500 shadow-[0_0_8px_#10b981]' : 'bg-gray-300'}`}></div>
                  <div>
                    <p className="text-sm font-bold text-emerald-950">{b.passengerName}</p>
                    <p className="text-[10px] font-bold text-gray-400">مقعد {b.seatNumber}</p>
                  </div>
                </div>
                {i % 2 === 0 && (
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-100 px-2 py-1 rounded-lg">صعد</span>
                )}
              </div>
            ))}
            
            {mockBookings.filter(b => b.tripId === selectedTripId).length === 0 && (
              <div className="text-center py-8 text-gray-400 font-bold text-sm">
                لا توجد حجوزات لهذه الرحلة
              </div>
            )}
          </div>
        </div>

        {/* Scanner */}
        <div className="w-full lg:w-2/3 bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-12">
          
          <div className="w-full flex-1 flex flex-col items-center justify-center">
            <h2 className="text-xl font-black text-emerald-950 font-display mb-2">ماسح التذاكر (QR)</h2>
            <p className="text-gray-500 text-sm font-bold mb-8 text-center">قم بتوجيه كاميرا جهازك أو جهاز المسح نحو الدائرة لتدقيق التذكرة</p>
            
             <div className="w-64 h-64 bg-gray-900 rounded-[2.5rem] relative overflow-hidden mb-8 shadow-xl shadow-gray-900/10 border-[6px] border-emerald-950">
                <div className="absolute inset-x-8 inset-y-8 border-2 border-emerald-500/30 rounded-2xl"></div>
                
                {scanStatus === 'IDLE' && (
                  <motion.div 
                    animate={{ top: ['10%', '90%', '10%'] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                    className="absolute left-6 right-6 h-1 bg-emerald-400 shadow-[0_0_12px_3px_#34d399] rounded-full z-10"
                  ></motion.div>
                )}

                <div className="absolute inset-0 flex items-center justify-center opacity-20">
                  <QrCode className="w-24 h-24 text-white" />
                </div>
             </div>
             
             <div className="flex gap-4 w-full max-w-xs">
                <button 
                  onClick={() => setScanStatus('SUCCESS')}
                  className="flex-1 bg-emerald-50 text-emerald-700 font-bold py-3 rounded-xl border border-emerald-200 hover:bg-emerald-100"
                >
                  محاكاة (مقبول)
                </button>
                <button 
                  onClick={() => setScanStatus('ERROR')}
                  className="flex-1 bg-red-50 text-red-700 font-bold py-3 rounded-xl border border-red-200 hover:bg-red-100"
                >
                  محاكاة (مرفوض)
                </button>
             </div>
          </div>

          <div className="w-full md:w-80 bg-gray-50 border border-gray-100 rounded-[2rem] p-6 flex flex-col items-center justify-center min-h-[350px]">
             {scanStatus === 'IDLE' && (
               <div className="text-center text-gray-400">
                  <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-gray-300" />
                  </div>
                  <p className="font-bold text-lg text-gray-500 mb-1">في انتظار المسح</p>
                  <p className="text-sm">نتائج المسح ستظهر هنا</p>
               </div>
             )}
             
             {scanStatus === 'SUCCESS' && (
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className="w-full"
               >
                  <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                     <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <h3 className="text-center font-black text-xl text-emerald-950 mb-6 font-display">تذكرة صالحة</h3>
                  
                  <div className="space-y-4 bg-white p-4 rounded-2xl border border-emerald-100">
                     <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                       <span className="text-xs font-bold text-gray-400">المسافر</span>
                       <span className="font-bold text-emerald-950 text-sm">أحمد علي</span>
                     </div>
                     <div className="flex justify-between items-center pb-3 border-b border-gray-50">
                       <span className="text-xs font-bold text-gray-400">الرحلة</span>
                       <span className="font-bold text-emerald-950 text-sm">{trip?.departureCity} - {trip?.arrivalCity}</span>
                     </div>
                     <div className="flex justify-between items-center">
                       <span className="text-xs font-bold text-gray-400">رقم المقعد</span>
                       <span className="font-black text-emerald-600 bg-emerald-50 px-3 py-1 rounded-xl text-lg">3</span>
                     </div>
                  </div>
                  
                  <button 
                    onClick={() => setScanStatus('IDLE')}
                    className="w-full mt-6 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                  >
                    تأكيد صعود الراكب
                  </button>
               </motion.div>
             )}

             {scanStatus === 'ERROR' && (
               <motion.div 
                 initial={{ scale: 0.9, opacity: 0 }}
                 animate={{ scale: 1, opacity: 1 }}
                 className="w-full text-center"
               >
                  <div className="w-16 h-16 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                     <XCircle className="w-8 h-8" />
                  </div>
                  <h3 className="font-black text-xl text-red-950 mb-4 font-display">تذكرة غير صالحة</h3>
                  
                  <div className="bg-red-50 p-4 rounded-2xl border border-red-100 mb-6 text-right">
                    <p className="text-red-700 font-bold text-sm">
                      سبب الرفض:
                      <br/>
                      <span className="text-red-900 font-black mt-1 block">التذكرة ممسوحة مسبقاً في الساعة 08:15 ص</span>
                    </p>
                  </div>

                  <button 
                    onClick={() => setScanStatus('IDLE')}
                    className="w-full bg-white border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:border-gray-300 hover:bg-gray-50 transition-all"
                  >
                    مسح تذكرة أخرى
                  </button>
               </motion.div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ReportsTab() {
  return (
     <div className="space-y-8">
        <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
           <div>
             <h2 className="text-xl font-black text-emerald-950 font-display">التقارير المالية والتشغيلية</h2>
             <p className="text-sm font-bold text-gray-400 mt-1">عرض تحليلات الإيرادات ونسب الإشغال لكل خط.</p>
           </div>
           <div className="flex gap-3">
             <button className="bg-gray-50 border border-gray-100 text-gray-600 px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-50 transition-colors">
                <Calendar className="w-4 h-4" /> هذا الشهر
             </button>
             <button className="bg-emerald-950 text-white px-6 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-800 transition-colors shadow-lg shadow-emerald-900/20 active:scale-95">
                تصدير (PDF/Excel) <DollarSign className="w-4 h-4" />
             </button>
           </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           {/* Revenue Breakdown */}
           <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
              <h3 className="text-lg font-black text-emerald-950 font-display mb-6">تفصيل الإيرادات</h3>
              
              <div className="space-y-6">
                 <div>
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-sm font-bold text-gray-500">حجوزات إلكترونية (محفظة شِلّن)</span>
                       <span className="font-black text-xl text-emerald-600">8,450,000 <span className="text-xs text-gray-400">د.ع</span></span>
                    </div>
                    <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                       <div className="h-full bg-emerald-500" style={{ width: '65%' }}></div>
                    </div>
                 </div>
                 
                 <div>
                    <div className="flex justify-between items-end mb-2">
                       <span className="text-sm font-bold text-gray-500">نقاط البيع (الوكلاء والمحطة)</span>
                       <span className="font-black text-xl text-orange-500">4,550,000 <span className="text-xs text-gray-400">د.ع</span></span>
                    </div>
                    <div className="h-2 w-full bg-gray-50 rounded-full overflow-hidden">
                       <div className="h-full bg-orange-500" style={{ width: '35%' }}></div>
                    </div>
                 </div>
              </div>

              <div className="mt-8 pt-6 border-t border-gray-100 grid grid-cols-2 gap-4">
                 <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100">
                    <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-1">صافي إيراد المُشغّل</p>
                    <p className="font-black text-emerald-950 text-xl">11,700,000 <span className="text-xs">د.ع</span></p>
                 </div>
                 <div className="bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1 flex items-center gap-1">عمولات (النقابة + المنصة)</p>
                    <p className="font-black text-gray-900 text-xl">1,300,000 <span className="text-xs">د.ع</span></p>
                 </div>
              </div>
           </div>

           {/* Top Routes */}
           <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm">
              <h3 className="text-lg font-black text-emerald-950 font-display mb-6">أكثر الخطوط نشاطاً</h3>
              
              <div className="space-y-4">
                 {[
                   { route: 'بغداد - أربيل', bookings: 420, revenue: 10500000, trend: '+15%' },
                   { route: 'بغداد - البصرة', bookings: 310, revenue: 12400000, trend: '+5%' },
                   { route: 'أربيل - السليمانية', bookings: 185, revenue: 3700000, trend: '-2%' },
                 ].map((route, i) => (
                   <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors border border-transparent hover:border-emerald-100">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white shadow-sm rounded-full flex items-center justify-center font-bold text-emerald-600">
                           #{i + 1}
                        </div>
                        <div>
                           <p className="font-bold text-emerald-950">{route.route}</p>
                           <p className="text-[10px] font-bold text-gray-400">{route.bookings} رحلة مباعة</p>
                        </div>
                      </div>
                      <div className="text-right">
                         <p className="font-black text-emerald-950">{route.revenue.toLocaleString()} <span className="text-xs font-normal">د.ع</span></p>
                         <p className={`text-[10px] font-bold ${route.trend.startsWith('+') ? 'text-emerald-500' : 'text-red-400'}`}>{route.trend} مقارنة بالشهر السابق</p>
                      </div>
                   </div>
                 ))}
              </div>
           </div>
        </div>
     </div>
  );
}

function AgentsTab() {
  const agents = [
    { id: 'a1', name: 'مكتب السنابل للسفر', location: 'بغداد - المنصور', commission: 5, sales: 1250000, isActive: true },
    { id: 'a2', name: 'شركة أطياف السياحية', location: 'أربيل - عنكاوا', commission: 7, sales: 3400000, isActive: true },
    { id: 'a3', name: 'كشك المحطة الموحد', location: 'البصرة', commission: 4, sales: 850000, isActive: false },
  ];

  return (
    <div className="space-y-8">
       <div className="flex justify-between items-center bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm">
          <div>
            <h2 className="text-xl font-black text-emerald-950 font-display">إدارة وكلاء السفر (Agents & POS)</h2>
            <p className="text-sm font-bold text-gray-400 mt-1">منح صلاحيات إصدار التذاكر لمكاتب خارجية مع حساب العمولة التلقائية.</p>
          </div>
          <button className="bg-emerald-950 text-white px-6 py-3 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-emerald-800 transition-colors shadow-lg shadow-emerald-900/20 active:scale-95">
             <Plus className="w-4 h-4" /> إضافة وكيل جديد
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {agents.map(agent => (
            <div key={agent.id} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm relative overflow-hidden group">
               {!agent.isActive && (
                 <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] z-10 flex items-center justify-center">
                    <span className="bg-gray-100 text-gray-500 font-black px-4 py-2 rounded-full text-sm border border-gray-200">موقوف مؤقتاً</span>
                 </div>
               )}
               
               <div className="flex items-start justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                       <Briefcase className="w-6 h-6" />
                    </div>
                    <div>
                       <h3 className="font-bold text-emerald-950 text-lg">{agent.name}</h3>
                       <p className="text-xs font-bold text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3" /> {agent.location}</p>
                    </div>
                  </div>
                  <button className="text-gray-300 hover:text-emerald-600"><Settings className="w-5 h-5" /></button>
               </div>

               <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-50">
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Percent className="w-3 h-3 text-emerald-500"/> نسبة العمولة</p>
                    <p className="font-black text-emerald-950 text-lg">{agent.commission}%</p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">مبيعات الشهر</p>
                    <p className="font-black text-emerald-950 text-lg">{agent.sales.toLocaleString()} <span className="text-xs text-gray-400">د.ع</span></p>
                  </div>
               </div>

               <div className="mt-6 pt-4 border-t border-gray-50 flex gap-2">
                 <button className="flex-1 bg-gray-50 text-gray-500 font-bold py-2 rounded-lg text-xs hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                    سجل المبيعات
                 </button>
                 <button className="flex-1 bg-gray-50 text-gray-500 font-bold py-2 rounded-lg text-xs hover:bg-emerald-50 hover:text-emerald-700 transition-colors">
                    تسوية الحساب
                 </button>
               </div>
            </div>
          ))}
       </div>
    </div>
  );
}
