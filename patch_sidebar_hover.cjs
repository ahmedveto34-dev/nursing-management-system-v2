const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/text-slate-400 hover:bg-slate-50 hover:text-slate-900/g, 'text-slate-400 hover:bg-slate-800 hover:text-white');
code = code.replace(/text-slate-400 hover:bg-slate-50 rounded-lg/g, 'text-slate-400 hover:bg-slate-800 hover:text-white rounded-lg');
code = code.replace(/text-red-600 hover:bg-red-50/g, 'text-red-400 hover:bg-red-900/50 hover:text-red-300');
code = code.replace(/text-slate-400 bg-slate-50/g, 'text-slate-400 bg-slate-800/50');
code = code.replace(/bg-slate-900 shadow-2xl border-none border-l border-slate-200/g, 'bg-slate-900 shadow-2xl border-none');
code = code.replace(/bg-slate-900 shadow-2xl border-none border-r border-slate-200/g, 'bg-slate-900 shadow-2xl border-none');
code = code.replace(/className={\`w-64 bg-slate-900 shadow-2xl border-none \$\{language === 'ar' \? 'border-l' : 'border-r'\} border-slate-200 flex flex-col hidden md:flex print:hidden\`}/g, 
  'className={`w-64 bg-slate-900 shadow-2xl border-none flex flex-col hidden md:flex print:hidden`}');

fs.writeFileSync('src/App.tsx', code);
