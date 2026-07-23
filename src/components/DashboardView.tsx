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

      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const isCurrentMonth = (dateStr: string) => {
        if (!dateStr) return false;
        const d = new Date(dateStr.replace(' ', 'T'));
        if (isNaN(d.getTime())) return false;
        return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
      };
      
      const currentMonthAdmissions = admissions.filter((a: any) => isCurrentMonth(a.admissionDate || a.date));
      const currentMonthDischarges = admissions.filter((a: any) => a.dischargeDate && isCurrentMonth(a.dischargeDate));
      
      const monthStart = new Date(currentYear, currentMonth, 1).getTime();
      const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).getTime();

      let totalDays = 0;
      admissions.forEach((a: any) => {
        const admDateStr = a.admissionDate || a.date;
        const disDateStr = a.dischargeDate;
        if (admDateStr) {
          try {
            const d = new Date(admDateStr.replace(' ', 'T'));
            if (isNaN(d.getTime())) return;
            const admDate = d.getTime();
            
            let disDate = now.getTime();
            if (disDateStr) {
              const d2 = new Date(disDateStr.replace(' ', 'T'));
              if (!isNaN(d2.getTime())) {
                disDate = d2.getTime();
              }
            }
            
            // Calculate overlap with current month
            const overlapStart = Math.max(admDate, monthStart);
            const overlapEnd = Math.min(disDate, monthEnd);
            
            if (overlapEnd >= overlapStart) {
               // Convert overlap to days
               const days = Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24));
               if (days > 0) {
                 totalDays += days;
               } else if (days === 0 && disDateStr && overlapStart >= monthStart && overlapEnd <= monthEnd) {
                 // Discharged same day during this month
                 totalDays += 1;
               }
            }
          } catch(e) {}
        }
      });

      setStats({
        admissions: currentMonthAdmissions.length,
        discharges: currentMonthDischarges.length,
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
        <StatCard title={translate('totalAdmissions')} value={stats.admissions} icon={Users} color="slate" />
        <StatCard title={translate('totalDischarges')} value={stats.discharges} icon={Users} color="emerald" />
        <StatCard title={translate('acquiredBedsores')} value={stats.bedsores} icon={Activity} color="amber" />
        <StatCard title={translate('acquiredInfections')} value={stats.infections} icon={AlertTriangle} color="rose" />
        <StatCard title={translate('totalFalls')} value={stats.falls} icon={AlertTriangle} color="amber" />
        <StatCard title={translate('codeBlueCases')} value={stats.cardiac} icon={HeartPulse} color="rose" />
        <StatCard title={translate('totalRRT')} value={stats.rrt} icon={Activity} color="slate" />
        <StatCard title={translate('patientDays') || "أيام إقامة المرضى"} value={stats.patientDays} icon={Users} color="emerald" />
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
    blue: 'bg-slate-50 text-slate-700',
    green: 'bg-emerald-50 text-emerald-700',
    orange: 'bg-amber-50 text-amber-700',
    red: 'bg-rose-50 text-rose-700',
    yellow: 'bg-amber-50 text-amber-700',
    rose: 'bg-rose-50 text-rose-700',
    indigo: 'bg-indigo-50 text-emerald-600',
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
