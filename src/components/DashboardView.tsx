import React, { useEffect, useState, useMemo } from 'react';
import { getAdmissions, getBedsores, getInfections, getFalls, getCardiac, getRRT } from '../lib/api';
import { Printer, Users, Activity, AlertTriangle, HeartPulse, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { ar, enUS } from 'date-fns/locale';
import { useLanguage } from '../lib/LanguageContext';

export default function DashboardView() {
  const [rawData, setRawData] = useState<{
    admissions: any[];
    bedsores: any[];
    infections: any[];
    falls: any[];
    cardiac: any[];
    rrt: any[];
  } | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { translate, language } = useLanguage();
  
  const [selectedMonthStr, setSelectedMonthStr] = useState(format(new Date(), 'yyyy-MM'));

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [admissions, bedsores, infections, falls, cardiac, rrt] = await Promise.all([
        getAdmissions(),
        getBedsores(),
        getInfections(),
        getFalls(),
        getCardiac(),
        getRRT()
      ]);
      setRawData({ admissions, bedsores, infections, falls, cardiac, rrt });
    } catch (e: any) {
      console.error("Failed to load data", e);
      setError(e.message || 'Error loading data');
    } finally {
      setLoading(false);
    }
  };

  const parseDateRobust = (dateStr: string) => {
    if (!dateStr) return new Date(NaN);
    
    let normalizedStr = String(dateStr);
    const arabicNumbers = [/٠/g, /١/g, /٢/g, /٣/g, /٤/g, /٥/g, /٦/g, /٧/g, /٨/g, /٩/g];
    for (let i = 0; i < 10; i++) {
      normalizedStr = normalizedStr.replace(arabicNumbers[i], i.toString());
    }
    
    let d = new Date(normalizedStr);
    if (!isNaN(d.getTime())) return d;
    
    if (normalizedStr.includes('-') && normalizedStr.includes(' ')) {
      d = new Date(normalizedStr.replace(' ', 'T'));
      if (!isNaN(d.getTime())) return d;
    }
    
    const parts = normalizedStr.split(/[\/\-\s]/);
    if (parts.length >= 3) {
       const day = parseInt(parts[0], 10);
       const month = parseInt(parts[1], 10) - 1;
       const year = parseInt(parts[2], 10);
       
       if (day <= 31 && month >= 0 && month <= 11 && year > 2000) {
         let d2 = new Date(year, month, day);
         if (!isNaN(d2.getTime())) return d2;
       }
       
       const yearFirst = parseInt(parts[0], 10);
       const monthFirst = parseInt(parts[1], 10) - 1;
       const dayFirst = parseInt(parts[2], 10);
       
       if (yearFirst > 2000 && monthFirst >= 0 && monthFirst <= 11 && dayFirst <= 31) {
         let d3 = new Date(yearFirst, monthFirst, dayFirst);
         if (!isNaN(d3.getTime())) return d3;
       }
    }
    return new Date(NaN);
  };

  const stats = useMemo(() => {
    if (!rawData) return null;
    
    const [yearStr, monthStr] = selectedMonthStr.split('-');
    const currentYear = parseInt(yearStr, 10);
    const currentMonth = parseInt(monthStr, 10) - 1; // 0-indexed

    const isCurrentMonth = (dateStr: string) => {
      const d = parseDateRobust(dateStr);
      if (isNaN(d.getTime())) return false;
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    };
    
    const isAdmission = (a: any) => {
      const type = String(a.type || '').trim();
      const status = String(a.status || '').trim();
      return type === 'دخول' || type === 'Admission' || status === 'دخول' || (!type && !status) || (a.admissionDate && !type && !status);
    };
    
    const isDischarge = (a: any) => {
      const type = String(a.type || '').trim();
      const status = String(a.status || '').trim();
      return !!a.dischargeDate || type === 'خروج' || type === 'Discharge' || status === 'خروج';
    };

    const isCurrentMonthOrEmpty = (dateStr: string) => {
      if (!dateStr || String(dateStr).trim() === '') return true;
      return isCurrentMonth(dateStr);
    };

    const monthAdmissions = rawData.admissions.filter((a: any) => isAdmission(a) && isCurrentMonthOrEmpty(a.admissionDate || a.date));
    const monthDischarges = rawData.admissions.filter((a: any) => isDischarge(a) && isCurrentMonthOrEmpty(a.dischargeDate || a.date));
    
    const monthBedsores = rawData.bedsores.filter((a: any) => isCurrentMonthOrEmpty(a.date));
    const monthInfections = rawData.infections.filter((a: any) => isCurrentMonthOrEmpty(a.date));
    const monthFalls = rawData.falls.filter((a: any) => isCurrentMonthOrEmpty(a.date));
    const monthCardiac = rawData.cardiac.filter((a: any) => isCurrentMonthOrEmpty(a.date));
    const monthRRT = rawData.rrt.filter((a: any) => isCurrentMonthOrEmpty(a.date));

    const monthStart = new Date(currentYear, currentMonth, 1).getTime();
    const monthEnd = new Date(currentYear, currentMonth + 1, 0, 23, 59, 59).getTime();

    let totalDays = 0;
    const now = new Date();
    
    rawData.admissions.filter(isAdmission).forEach((a: any) => {
      const admDateStr = a.admissionDate || a.date;
      const disDateStr = a.dischargeDate;
      if (admDateStr) {
        try {
          const d = parseDateRobust(admDateStr);
          if (isNaN(d.getTime())) return;
          const admDate = d.getTime();
          
          let disDate = now.getTime();
          if (disDateStr) {
            const d2 = parseDateRobust(disDateStr);
            if (!isNaN(d2.getTime())) {
              disDate = d2.getTime();
            }
          }
          
          // Calculate overlap with current month
          const overlapStart = Math.max(admDate, monthStart);
          const overlapEnd = Math.min(disDate, monthEnd);
          
          if (overlapEnd >= overlapStart) {
             const days = Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24));
             if (days > 0) {
               totalDays += days;
             } else if (days === 0 && disDateStr && overlapStart >= monthStart && overlapEnd <= monthEnd) {
               totalDays += 1;
             }
          }
        } catch(e) {}
      }
    });
    
    return {
      admissions: monthAdmissions.length,
      discharges: monthDischarges.length,
      bedsores: monthBedsores.length,
      infections: monthInfections.length,
      falls: monthFalls.length,
      cardiac: monthCardiac.length,
      rrt: monthRRT.length,
      patientDays: totalDays
    };
  }, [rawData, selectedMonthStr]);

  const currentMonthName = format(new Date(selectedMonthStr + '-01'), 'MMMM yyyy', { locale: language === 'ar' ? ar : enUS });

  if (loading) {
    return <div className="p-8 text-center text-gray-500">{translate('loading')}</div>;
  }
  
  if (!stats) return null;

  return (
    <div className="space-y-6 print:space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{translate('monthlyReport') || 'التقرير الشهري'}</h2>
          <p className="text-gray-500 mt-1">{translate('clinicalSummary')} {currentMonthName}</p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto print:hidden">
          <div className="relative flex-1 sm:flex-none sm:w-48">
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
              <Calendar className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="month"
              value={selectedMonthStr}
              onChange={(e) => setSelectedMonthStr(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-lg shadow-sm bg-white"
            />
          </div>
          <button 
            onClick={() => window.print()}
            className="flex items-center justify-center gap-2 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition min-w-[100px]"
          >
            <Printer className="w-5 h-5" />
            {translate('printReport')}
          </button>
        </div>
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
            .print-footer { margin-top: 2rem !important; padding: 1rem !important; display: block !important; }
            .print\:hidden { display: none !important; }
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
    slate: 'bg-slate-50 text-slate-700',
    emerald: 'bg-emerald-50 text-emerald-700',
    amber: 'bg-amber-50 text-amber-700',
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
