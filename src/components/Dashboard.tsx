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
  return (
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
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">المخطط (Layout)</p>
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
       <button className="bg-gray-100/50 border-4 border-dashed border-gray-200 rounded-[2.5rem] flex flex-col items-center justify-center p-8 text-gray-400 hover:border-emerald-200 hover:text-emerald-600 hover:bg-white transition-all group min-h-[350px]">
          <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center mb-4 group-hover:bg-emerald-50">
             <Plus className="w-8 h-8" />
          </div>
          <span className="font-black text-lg">إضافة مخطط / حافلة</span>
       </button>
    </div>
  );
}

function PosTab() {
  const [selectedCity, setSelectedCity] = useState('');
  
  return (
    <div className="space-y-8">
      <div className="flex gap-8">
        <div className="w-1/3 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex flex-col">
          <h2 className="text-xl font-black text-emerald-950 font-display mb-6">الحجز اليدوي (المكتب)</h2>
          
          <div className="space-y-4 flex-1">
             <div>
               <label className="block text-xs font-bold text-gray-400 mb-2">الوجهة</label>
               <select 
                 className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold text-emerald-950"
                 value={selectedCity}
                 onChange={(e) => setSelectedCity(e.target.value)}
               >
                 <option value="">اختر الوجهة</option>
                 {mockCities.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
               </select>
             </div>
             
             <div>
               <label className="block text-xs font-bold text-gray-400 mb-2">اسم المسافر</label>
               <input type="text" placeholder="أدخل اسم المسافر..." className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold text-emerald-950 placeholder-gray-300" />
             </div>
             
             <div>
               <label className="block text-xs font-bold text-gray-400 mb-2">رقم الجوال (اختياري)</label>
               <input type="tel" placeholder="07XX XXX XXXX" className="w-full bg-gray-50 border-none rounded-xl p-3 text-sm font-bold text-emerald-950 placeholder-gray-300 text-left" dir="ltr" />
             </div>
          </div>
          
          <div className="pt-6 border-t border-gray-100 mt-6 space-y-4">
             <div className="flex justify-between items-center text-emerald-950 font-bold">
               <span>الإجمالي</span>
               <span className="text-2xl font-black">0 <span className="text-sm text-gray-400">د.ع</span></span>
             </div>
             <button className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-600/20 opacity-50 cursor-not-allowed">
               إصدار تذكرة وطباعة
             </button>
          </div>
        </div>

        <div className="flex-1 bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm flex items-center justify-center">
            {selectedCity ? (
               <div className="text-center">
                  <p className="text-gray-500 font-bold mb-4">الرحلات المتاحة إلى <span className="text-emerald-600">{selectedCity}</span></p>
                  <p className="text-sm text-gray-400">يرجى اختيار رحلة ومقعد لإتمام الحجز...</p>
               </div>
            ) : (
                <div className="text-center text-gray-300">
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
  
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm flex flex-col md:flex-row gap-12">
        
        <div className="w-full md:w-1/2 flex flex-col items-center">
           <h2 className="text-2xl font-black text-emerald-950 font-display mb-2">تدقيق التذاكر</h2>
           <p className="text-gray-500 text-sm font-bold mb-8">قم بمسح رمز الـ QR الخاص بالمسافر</p>
           
           <div className="w-64 h-64 bg-gray-900 rounded-3xl relative overflow-hidden mb-6 shadow-xl shadow-gray-900/10 border-4 border-gray-900">
              {/* Fake camera feed / scanner overlay */}
              <div className="absolute inset-x-8 inset-y-8 border-2 border-emerald-500/50 rounded-xl"></div>
              <motion.div 
                animate={{ top: ['10%', '90%', '10%'] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                className="absolute left-8 right-8 h-0.5 bg-emerald-400 shadow-[0_0_8px_2px_#34d399]"
              ></motion.div>
              <div className="absolute bottom-4 left-0 right-0 text-center text-xs font-bold text-white/50 tracking-widest uppercase">
                 Camera Active
              </div>
           </div>
           
           <div className="flex gap-4 w-full">
              <button 
                onClick={() => setScanStatus('SUCCESS')}
                className="flex-1 bg-emerald-50 text-emerald-700 font-bold py-3 rounded-xl border border-emerald-200 hover:bg-emerald-100"
              >
                محاكاة مسح (مقبول)
              </button>
              <button 
                onClick={() => setScanStatus('ERROR')}
                className="flex-1 bg-red-50 text-red-700 font-bold py-3 rounded-xl border border-red-200 hover:bg-red-100"
              >
                محاكاة مسح (مرفوض)
              </button>
           </div>
        </div>

        <div className="w-full md:w-1/2 bg-gray-50 border border-gray-100 rounded-[2rem] p-8 flex flex-col items-center justify-center min-h-[400px]">
           {scanStatus === 'IDLE' && (
             <div className="text-center text-gray-400">
                <QrCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="font-bold text-lg text-gray-500 mb-1">في انتظار المسح...</p>
                <p className="text-sm">قم بتوجيه الكاميرا نحو التذكرة</p>
             </div>
           )}
           
           {scanStatus === 'SUCCESS' && (
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="w-full bg-white p-6 rounded-3xl shadow-sm border border-emerald-100"
             >
                <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                   <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-center font-black text-xl text-emerald-950 mb-6 font-display">تذكرة صالحة</h3>
                
                <div className="space-y-4">
                   <div className="flex justify-between items-center py-2 border-b border-gray-50">
                     <span className="text-xs font-bold text-gray-400">المسافر</span>
                     <span className="font-bold text-gray-900 text-sm">أحمد علي</span>
                   </div>
                   <div className="flex justify-between items-center py-2 border-b border-gray-50">
                     <span className="text-xs font-bold text-gray-400">الرحلة</span>
                     <span className="font-bold text-gray-900 text-sm">بغداد - أربيل</span>
                   </div>
                   <div className="flex justify-between items-center py-2 border-b border-gray-50">
                     <span className="text-xs font-bold text-gray-400">رقم المقعد</span>
                     <span className="font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded text-lg">3</span>
                   </div>
                </div>
                
                <button 
                  onClick={() => setScanStatus('IDLE')}
                  className="w-full mt-8 bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700"
                >
                  تأكيد الصعود التام
                </button>
             </motion.div>
           )}

           {scanStatus === 'ERROR' && (
             <motion.div 
               initial={{ scale: 0.9, opacity: 0 }}
               animate={{ scale: 1, opacity: 1 }}
               className="w-full text-center"
             >
                <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                   <XCircle className="w-10 h-10" />
                </div>
                <h3 className="font-black text-2xl text-red-950 mb-2 font-display">تذكرة غير صالحة</h3>
                <p className="text-red-700 font-bold text-sm mb-8 px-6 bg-red-50 py-3 rounded-xl border border-red-100">
                  التذكرة ممسوحة مسبقاً أو غير موجودة بالنظام
                </p>
                <button 
                  onClick={() => setScanStatus('IDLE')}
                  className="bg-white border-2 border-gray-200 text-gray-600 font-bold px-8 py-3 rounded-xl hover:border-gray-300"
                >
                  مسح تذكرة أخرى
                </button>
             </motion.div>
           )}
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
