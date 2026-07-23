import React, { useEffect, useState } from 'react';
import { getAdmissions, getBedsores, getInfections, getFalls, getCardiac, getRRT } from '../lib/api';
import { Printer, Users, Activity, AlertTriangle, HeartPulse } from 'lucide-react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useLanguage } from '../lib/LanguageContext';

export default function DashboardView() {
  const [stats, setStats] = useState({
    admissions: 0,
    discharges: 0,
    bedsores: 0,
    infections: 0,
    falls: 0,
    cardiac: 0,
    rrt: 0,
    patientDays: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { translate, language } = useLanguage();

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      // Let it throw if it fails, so we can catch the message
      const [admissions, bedsores, infections, falls, cardiac, rrt] = await Promise.all([
        getAdmissions(),
        getBedsores(),
        getInfections(),
        getFalls(),
        getCardiac(),
        getRRT()
      ]);

      const currentMonth = new Date().getMonth();
      const isCurrentMonth = (dateStr: string) => new Date(dateStr).getMonth() === currentMonth;

      const currentMonthAdmissions = admissions.filter((a: any) => isCurrentMonth(a.date));
      
      let totalDays = 0;
      currentMonthAdmissions.forEach((a: any) => {
        const admDateStr = a.admissionDate || a.date;
        const disDateStr = a.dischargeDate;
        if (admDateStr) {
          try {
            const admDate = new Date(admDateStr.replace(' ', 'T'));
            const disDate = disDateStr ? new Date(disDateStr.replace(' ', 'T')) : new Date();
            const days = Math.floor((disDate.getTime() - admDate.getTime()) / (1000 * 60 * 60 * 24));
            if (days > 0) {
              totalDays += days;
            } else if (days === 0 && disDateStr) {
               // if discharged same day, count as 1 or 0? Usually 1 day for admissions that discharge same day.
               totalDays += 1;
            }
          } catch(e) {}
        }
      });

      setStats({
        admissions: currentMonthAdmissions.filter((a: any) => a.type === 'دخول' || a.type === 'Admission' || a.status === 'دخول').length,
        discharges: currentMonthAdmissions.filter((a: any) => a.dischargeDate || a.type === 'خروج' || a.type === 'Discharge').length,
        bedsores: bedsores.filter((b: any) => isCurrentMonth(b.date)).length,
        infections: infections.filter((i: any) => isCurrentMonth(i.date)).length,
        falls: falls.filter((f: any) => isCurrentMonth(f.date)).length,
        cardiac: cardiac.filter((c: any) => isCurrentMonth(c.date)).length,
        rrt: rrt.filter((r: any) => isCurrentMonth(r.date)).length,
        patientDays: totalDays
      });
    } catch (e: any) {
      console.error("Failed to load stats", e);
      setError(e.message || 'Error loading stats');
    } finally {
      setLoading(false);
    }
  };

  const currentMonthName = format(new Date(), 'MMMM yyyy', { locale: language === 'ar' ? ar : enUS });

  if (loading) {
    return <div className="p-8 text-center text-gray-500">{translate('loading')}</div>;
  }

  return (
    <div className="space-y-6 print:space-y-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{translate('monthlyReport')}</h2>
          <p className="text-gray-500 mt-1">{translate('clinicalSummary')} {currentMonthName}</p>
        </div>
        <button 
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition print:hidden"
        >
          <Printer className="w-5 h-5" />
          {translate('printReport')}
        </button>
      </div>

      <style>
        {`
          @media print {
            @page { size: A4 portrait; margin: 10mm; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .print-grid { display: grid !important; grid-template-columns: repeat(4, 1fr) !important; gap: 0.5rem !important; }
            .print-card { padding: 0.75rem !important; margin-bottom: 0 !important; }
            .print-icon { width: 1.5rem !important; height: 1.5rem !important; padding: 0.25rem !important; }
            .print-text { font-size: 0.75rem !important; }
            .print-value { font-size: 1.25rem !important; margin-top: 0 !important; }
            .print-title { font-size: 1.25rem !important; margin-bottom: 0.5rem !important; }
            .print-header { margin-bottom: 1rem !important; }
            .print-footer { margin-top: 2rem !important; padding: 1rem !important; }
          }
        `}
      </style>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print-grid">
        <StatCard title={translate('totalAdmissions')} value={stats.admissions} icon={Users} color="blue" />
        <StatCard title={translate('totalDischarges')} value={stats.discharges} icon={Users} color="green" />
        <StatCard title={translate('acquiredBedsores')} value={stats.bedsores} icon={Activity} color="orange" />
        <StatCard title={translate('acquiredInfections')} value={stats.infections} icon={AlertTriangle} color="red" />
        <StatCard title={translate('totalFalls')} value={stats.falls} icon={AlertTriangle} color="yellow" />
        <StatCard title={translate('codeBlueCases')} value={stats.cardiac} icon={HeartPulse} color="rose" />
        <StatCard title={translate('totalRRT')} value={stats.rrt} icon={Activity} color="blue" />
        <StatCard title={translate('patientDays') || "أيام إقامة المرضى"} value={stats.patientDays} icon={Users} color="indigo" />
      </div>

      <div className="print-footer mt-12 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm print:shadow-none print:border-gray-300">
        <h3 className="text-lg font-bold mb-4">{translate('managementApproval')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 mt-8">
          <div>
            <p className="text-gray-600 mb-8">{translate('nursingDirectorSignature')}</p>
            <div className="border-b border-gray-400 w-48"></div>
          </div>
          <div>
            <p className="text-gray-600 mb-8">{translate('date')}</p>
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
    indigo: 'bg-indigo-50 text-indigo-600',
  }[color];

  return (
    <div className="print-card bg-white p-6 rounded-2xl border border-gray-100 shadow-sm print:shadow-none print:border-gray-300 flex items-center gap-4">
      <div className={`print-icon p-4 rounded-xl ${colorClasses}`}>
        <Icon className="w-8 h-8" />
      </div>
      <div>
        <p className="print-text text-gray-500 text-sm font-medium">{title}</p>
        <p className="print-value text-3xl font-bold text-gray-900 mt-1">{value}</p>
      </div>
    </div>
  );
}
