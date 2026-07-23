const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetHeader = `<header className="bg-white border-b border-gray-200 p-4 flex justify-between items-center md:hidden print:hidden">`;
const replacementHeader = `<header className="bg-white border-b border-gray-200 p-4 flex flex-col gap-4 md:hidden print:hidden">
          <div className="flex justify-between items-center w-full">
            <div className="flex items-center gap-2 text-indigo-600">
              <HeartPulse className="w-6 h-6" />
              <span className="font-bold">{translate('appTitle')}</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleLanguage} className="text-gray-500 p-2">
                <Globe className="w-5 h-5" />
              </button>
              <button onClick={handleLogout} className="text-gray-500 p-2">
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
          <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id as View)}
                  className={\`flex items-center gap-2 px-3 py-2 rounded-lg whitespace-nowrap transition-all \${
                    activeView === item.id
                      ? 'bg-indigo-50 text-indigo-700 font-semibold'
                      : 'text-gray-600 bg-gray-50'
                  }\`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{item.label}</span>
                </button>
              );
            })}
          </div>
        </header>`;

code = code.replace(targetHeader + `
          <div className="flex items-center gap-2 text-indigo-600">
            <HeartPulse className="w-6 h-6" />
            <span className="font-bold">{translate('appTitle')}</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleLanguage} className="text-gray-500 p-2">
              <Globe className="w-5 h-5" />
            </button>
            <button onClick={handleLogout} className="text-gray-500 p-2">
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </header>`, replacementHeader);

fs.writeFileSync('src/App.tsx', code);
