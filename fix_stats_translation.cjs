const fs = require('fs');
let code = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');

code = code.replace(
  `        <StatCard title="أيام إقامة المرضى" value={stats.patientDays} icon={Users} color="indigo" />`,
  `        <StatCard title={translate('patientDays') || "أيام إقامة المرضى"} value={stats.patientDays} icon={Users} color="indigo" />`
);

fs.writeFileSync('src/components/DashboardView.tsx', code);
