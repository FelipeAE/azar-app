import { useState, useEffect } from 'react';
import { Ruleta } from './components/Ruleta';
import { CaraCruz } from './components/CaraCruz';
import { Dado } from './components/Dado';
import { PiedraPapelTijera } from './components/PiedraPapelTijera';
import { Blackjack } from './components/Blackjack';

type Tab = 'ruleta' | 'cara-cruz' | 'dado' | 'ppt' | 'blackjack';

function App() {
  const [activeTab, setActiveTab] = useState<Tab>('ruleta');
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Cargar tema del localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme_mode');
    if (savedTheme === 'dark') {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  // Guardar tema en localStorage
  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme_mode', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme_mode', 'light');
    }
  };

  const TABS = [
    { id: 'ruleta', label: '🎡 Ruleta', color: 'purple' },
    { id: 'cara-cruz', label: '🪙 Cara o Cruz', color: 'blue' },
    { id: 'dado', label: '🎲 Dado', color: 'indigo' },
    { id: 'ppt', label: '✊ Piedra Papel Tijera', color: 'green' },
    { id: 'blackjack', label: '♠️ Blackjack', color: 'red' },
  ];

  return (
    <div className={isDarkMode ? 'dark' : ''}>
      <div className={isDarkMode ? 'bg-gray-900 min-h-screen' : 'bg-gray-50 min-h-screen'}>
        {/* Navbar */}
        <nav className={`${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} shadow-lg sticky top-0 z-50 border-b`}>
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <h1 className={`text-2xl font-bold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
                🎰 Azar App
              </h1>

              {/* Tabs - Responsive */}
              <div className="flex gap-2 overflow-x-auto">
                {TABS.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as Tab)}
                    className={`px-3 py-2 whitespace-nowrap font-semibold rounded-lg transition-all text-sm sm:text-base ${
                      activeTab === tab.id
                        ? `bg-${tab.color}-500 text-white shadow-lg`
                        : isDarkMode
                        ? 'text-gray-300 hover:bg-gray-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Botón tema */}
              <button
                onClick={toggleTheme}
                className={`ml-4 px-3 py-2 rounded-lg transition-all ${
                  isDarkMode ? 'bg-gray-700 text-yellow-400' : 'bg-gray-200 text-gray-800'
                }`}
                title={isDarkMode ? 'Modo claro' : 'Modo oscuro'}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </button>
            </div>
          </div>
        </nav>

        {/* Contenido */}
        <div className="w-full">
          {activeTab === 'ruleta' && <Ruleta />}
          {activeTab === 'cara-cruz' && <CaraCruz />}
          {activeTab === 'dado' && <Dado />}
          {activeTab === 'ppt' && <PiedraPapelTijera />}
          {activeTab === 'blackjack' && <Blackjack />}
        </div>
      </div>
    </div>
  );
}

export default App;
