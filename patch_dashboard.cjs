const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

code = code.replace(
`    admissions: 0,
    discharges: 0,
    bedsores: 0,
    infections: 0,
    falls: 0,
    cardiac: 0,
    rrt: 0
  });`,
`    admissions: 0,
    discharges: 0,
    bedsores: 0,
    infections: 0,
    falls: 0,
    cardiac: 0,
    rrt: 0,
    patientDays: 0
  });`
);

const calcStatsRegex = /setStats\(\{\s+admissions:.*?,[\s\S]*?rrt:.*?\n\s+\}\);/;

code = code.replace(calcStatsRegex, (match) => {
  return `let totalDays = 0;
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
      });`;
});

// Add patientDays StatCard and update print classes
code = code.replace(
  `<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">`,
  `<style>
        {\`
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
        \`}
      </style>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 print-grid">`
);

code = code.replace(
  `        <StatCard title={translate('totalRRT')} value={stats.rrt} icon={Activity} color="blue" />`,
  `        <StatCard title={translate('totalRRT')} value={stats.rrt} icon={Activity} color="blue" />
        <StatCard title="أيام إقامة المرضى" value={stats.patientDays} icon={Users} color="indigo" />`
);

// update StatCard
code = code.replace(
  `function StatCard({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: string }) {`,
  `function StatCard({ title, value, icon: Icon, color }: { title: string, value: number, icon: any, color: string }) {`
);

code = code.replace(
  `    rose: 'bg-rose-50 text-rose-600',`,
  `    rose: 'bg-rose-50 text-rose-600',
    indigo: 'bg-indigo-50 text-indigo-600',`
);

code = code.replace(
  `<div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm print:shadow-none print:border-gray-300 flex items-center gap-4">`,
  `<div className="print-card bg-white p-6 rounded-2xl border border-gray-100 shadow-sm print:shadow-none print:border-gray-300 flex items-center gap-4">`
);

code = code.replace(
  `<div className={\`p-4 rounded-xl \${colorClasses}\`}>`,
  `<div className={\`print-icon p-4 rounded-xl \${colorClasses}\`}>`
);

code = code.replace(
  `<p className="text-gray-500 text-sm font-medium">{title}</p>`,
  `<p className="print-text text-gray-500 text-sm font-medium">{title}</p>`
);

code = code.replace(
  `<p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>`,
  `<p className="print-value text-3xl font-bold text-gray-900 mt-1">{value}</p>`
);

code = code.replace(
  `      <div className="mt-12 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm print:shadow-none print:border-gray-300">`,
  `      <div className="print-footer mt-12 p-6 bg-white rounded-2xl border border-gray-100 shadow-sm print:shadow-none print:border-gray-300">`
);

fs.writeFileSync('src/components/DashboardView.tsx', code);
