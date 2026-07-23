const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  `import { LayoutDashboard, Users, Activity, AlertTriangle, HeartPulse, LogOut, Globe } from 'lucide-react';`,
  `import { LayoutDashboard, Users, Activity, AlertTriangle, HeartPulse, LogOut, Globe, Archive } from 'lucide-react';`
);

code = code.replace(
  `import AdmissionsView from './components/AdmissionsView';`,
  `import AdmissionsView from './components/AdmissionsView';
import ArchiveView from './components/ArchiveView';`
);

code = code.replace(
  `type View = 'dashboard' | 'admissions' | 'bedsores' | 'infections' | 'falls' | 'cardiac' | 'rrt';`,
  `type View = 'dashboard' | 'admissions' | 'archive' | 'bedsores' | 'infections' | 'falls' | 'cardiac' | 'rrt';`
);

code = code.replace(
  `      case 'admissions': return <AdmissionsView />;`,
  `      case 'admissions': return <AdmissionsView />;
      case 'archive': return <ArchiveView />;`
);

code = code.replace(
  `    { id: 'admissions', label: translate('admissions'), icon: Users },`,
  `    { id: 'admissions', label: translate('admissions'), icon: Users },
    { id: 'archive', label: language === 'ar' ? 'أرشيف الخروج' : 'Discharge Archive', icon: Archive },`
);

fs.writeFileSync('src/App.tsx', code);
