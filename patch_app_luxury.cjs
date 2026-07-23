const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf8');
code = code.replace(/bg-indigo-600/g, 'bg-emerald-600');
code = code.replace(/hover:bg-indigo-700/g, 'hover:bg-emerald-700');
code = code.replace(/text-indigo-600/g, 'text-emerald-500'); // Sidebar text
code = code.replace(/ring-indigo-500/g, 'ring-emerald-500');
code = code.replace(/focus:border-indigo-500/g, 'focus:border-emerald-500');
code = code.replace(/bg-indigo-50/g, 'bg-emerald-600');
code = code.replace(/text-indigo-700/g, 'text-white');
code = code.replace(/bg-gray-50/g, 'bg-slate-50');
code = code.replace(/bg-white/g, 'bg-white');
code = code.replace(/border-gray-200/g, 'border-slate-200');
code = code.replace(/text-gray-900/g, 'text-slate-900');
code = code.replace(/text-gray-600/g, 'text-slate-400');
code = code.replace(/text-gray-500/g, 'text-slate-500');
code = code.replace(/hover:text-gray-900/g, 'hover:text-white');
code = code.replace(/hover:bg-gray-50/g, 'hover:bg-slate-800');
code = code.replace(/text-slate-400 bg-gray-50/g, 'text-slate-400 bg-slate-800'); // mobile header

// Make sidebar dark
code = code.replace(/w-64 bg-white/g, 'w-64 bg-slate-900 shadow-2xl border-none');
code = code.replace(/border-b border-slate-200/g, 'border-b border-slate-800');
code = code.replace(/border-t border-slate-200/g, 'border-t border-slate-800');

// Mobile header dark
code = code.replace(/header className="bg-white/g, 'header className="bg-slate-900');
code = code.replace(/header className="bg-slate-900 border-b border-slate-200/g, 'header className="bg-slate-900 border-b border-slate-800');
code = code.replace(/text-emerald-500/g, 'text-emerald-400'); // make logo brighter on dark

// For mobile buttons
code = code.replace(/activeView === item\.id\n                      \? 'bg-emerald-600 text-white font-semibold'\n                      : 'text-slate-400 bg-gray-50'/g, 
`activeView === item.id
                      ? 'bg-emerald-600 text-white font-semibold'
                      : 'text-slate-400 bg-slate-800'`);

// Revert text color on main content area if it affected it wrong
// Let's actually just be precise

fs.writeFileSync('src/App.tsx', code);

// DashboardView
let dash = fs.readFileSync('src/components/DashboardView.tsx', 'utf8');
dash = dash.replace(/bg-indigo-600/g, 'bg-emerald-600');
dash = dash.replace(/text-indigo-600/g, 'text-emerald-600');
dash = dash.replace(/bg-blue-50/g, 'bg-slate-50');
dash = dash.replace(/text-blue-600/g, 'text-slate-700');
dash = dash.replace(/bg-green-50/g, 'bg-emerald-50');
dash = dash.replace(/text-green-600/g, 'text-emerald-700');
dash = dash.replace(/bg-orange-50/g, 'bg-amber-50');
dash = dash.replace(/text-orange-600/g, 'text-amber-700');
dash = dash.replace(/bg-red-50/g, 'bg-rose-50');
dash = dash.replace(/text-red-600/g, 'text-rose-700');
dash = dash.replace(/bg-yellow-50/g, 'bg-amber-50');
dash = dash.replace(/text-yellow-600/g, 'text-amber-700');
dash = dash.replace(/bg-rose-50/g, 'bg-rose-50');
dash = dash.replace(/text-rose-600/g, 'text-rose-700');
dash = dash.replace(/color="blue"/g, 'color="slate"');
dash = dash.replace(/color="green"/g, 'color="emerald"');
dash = dash.replace(/color="orange"/g, 'color="amber"');
dash = dash.replace(/color="red"/g, 'color="rose"');
dash = dash.replace(/color="yellow"/g, 'color="amber"');
dash = dash.replace(/color="indigo"/g, 'color="emerald"');

fs.writeFileSync('src/components/DashboardView.tsx', dash);
