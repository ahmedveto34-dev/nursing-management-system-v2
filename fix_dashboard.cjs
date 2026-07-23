const fs = require('fs');
const path = 'src/components/DashboardView.tsx';
let code = fs.readFileSync(path, 'utf8');

const lines = code.split('\n');
const startIdx = lines.findIndex(l => l.includes('const currentMonth = new Date().getMonth();'));
const endIdx = lines.findIndex(l => l.includes('patientDays: totalDays'));

if (startIdx !== -1 && endIdx !== -1) {
  const newLines = `      const now = new Date();
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
        patientDays: totalDays`;
  
  lines.splice(startIdx, endIdx - startIdx + 1, newLines);
  fs.writeFileSync(path, lines.join('\n'));
  console.log("Fixed successfully");
} else {
  console.log("Could not find bounds", startIdx, endIdx);
}
