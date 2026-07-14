import React, { useEffect, useState } from 'react';
import { getAdmissions, getBedsores, getInfections, getFalls, getCardiac } from '../lib/api';
import { Printer, Users, Activity, AlertTriangle, HeartPulse } from 'lucide-react';
import { format } from 'date-fns';
import { ar } from 'date-fns/locale';

export default function DashboardView() {
  const [stats, setStats] = useState({
    admissions: 0,
    discharges: 0,
    bedsores: 0,
    infections: 0,
    falls: 0,
    cardiac: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // Let it throw if it fails, so we can catch the message
      const [admissions, bedsores, infections, falls, cardiac] = await Promise.all([
        getAdmissions(),
        getBedsores(),
        getInfections(),
        getFalls(),
        getCardiac()
      ]);

      const currentMonth = new Date().getMonth();
      const isCurrentMonth = (dateStr: string) => new Date(dateStr).getMonth() === currentMonth;

      const currentMonthAdmissions = admissions.filter((a: any) => isCurrentMonth(a.date));
      
      setStats({
        admissions: currentMonthAdmissions.filter((a: any) => a.type === 'دخول').length,
        discharges: currentMonthAdmissions.filter((a: any) => a.type === 'خروج').length,
        bedsores: bedsores.filter((b: any) => isCurrentMonth(b.date)).length,
        infections: infections.filter((i: any) => isCurrentMonth(i.date)).length,
        falls: falls.filter((f: any) => isCurrentMonth(f.date)).length,
        cardiac: cardiac.filter((c: any) => isCurrentMonth(c.date)).length,
      });
    } catch (e: any) {
      console.error("Failed to load stats", e);
      setError(e.message || 'حدث خطأ غير معروف أثناء الاتصال بقاعدة البيانات');
    } finally {
      setLoading(false);
    }
  };

  const currentMonthName = format(new Date(), 'MMMM yyyy', { locale: ar });

  if (loading) {
    return <div className="p-8 text-center text-gray-500">جاري تحميل الإحصائيات...</div>;
  }

  return (
    <div className="space-y-6 print:space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">التقرير الشهري</h2>
          <p className="text-gray-500 mt-1">ملخص المؤشرات السريرية لشهر {currentMonthName}</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition print:hidden"
        >
          <Printer className="w-5 h-5" />
          طباعة التقرير
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatCard title="إجمالي حالات الدخول" value={stats.admissions} icon={Users} color="blue" />
        <StatCard title="إجمالي حالات الخروج" value={stats.discharges} icon={Users} color="green" />
        <StatCard title="حالات قرح الفراش المكتسبة" value={stats.bedsores} icon={Activity} color="orange" />
        <StatCard title="حالات العدوى المكتسبة" value={stats.infections} icon={AlertTriangle} color="red" />
        <StatCard title="حالات السقوط" value={stats.falls} icon={AlertTriangle} color="yellow" />
        <StatCard title="حالات الكود بلو" value={stats.cardiac} icon={HeartPulse} color="rose" />
      </div>

      <div className="mt-12 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm print:shadow-none print:border-gray-300">
        <h3 className="text-lg font-bold mb-4">اعتماد الإدارة</h3>
        <div className="grid grid-cols-2 gap-8 mt-8">
          <div>
            <p className="text-gray-600 mb-8">توقيع مديرة التمريض:</p>
            <div className="border-b border-gray-400 w-48"></div>
          </div>
          <div>
            <p className="text-gray-600 mb-8">التاريخ:</p>
            <div className="border-b border-gray-400 w-48"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: string }) {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    orange: 'bg-orange-50 text-orange-600',
    red: 'bg-red-50 text-red-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    rose: 'bg-rose-50 text-rose-600',
  }[color];

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm print:shadow-none print:border-gray-300 flex items-center gap-4">
      <div className={`p-4 rounded-xl ${colorClasses}`}>
        <Icon className="w-8 h-8" />
      </div>
      <div>
        <p className="text-gray-500 text-sm font-medium">{title}</p>
        <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
}
