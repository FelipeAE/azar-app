import { useState, useEffect } from 'react';
import { playSound } from '../utils/sounds';

interface RuletaOption {
  id: number;
  label: string;
  color: string;
}

const COLORS = [
  '#FF6B6B', '#FFA500', '#FFD93D', '#6BCB77',
  '#4D96FF', '#9D4EDD', '#FF006E', '#00BBF9',
  '#FFB703', '#FB5607', '#8338EC', '#FFBE0B',
  '#FF1744', '#00E676', '#1976D2', '#FBC02D',
];

const DEFAULT_OPTIONS: RuletaOption[] = [
  { id: 1, label: '1', color: '#FF6B6B' },
  { id: 2, label: '2', color: '#FFA500' },
  { id: 3, label: '3', color: '#FFD93D' },
  { id: 4, label: '4', color: '#6BCB77' },
  { id: 5, label: '5', color: '#4D96FF' },
  { id: 6, label: '6', color: '#9D4EDD' },
  { id: 7, label: '7', color: '#FF006E' },
  { id: 8, label: '8', color: '#00BBF9' },
  { id: 9, label: '9', color: '#FFB703' },
  { id: 10, label: '10', color: '#FB5607' },
  { id: 11, label: '11', color: '#8338EC' },
  { id: 12, label: '12', color: '#FFBE0B' },
];

const STORAGE_KEY = 'ruleta_options';

export const Ruleta = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedOption, setSelectedOption] = useState<RuletaOption | null>(null);
  const [rotation, setRotation] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [options, setOptions] = useState<RuletaOption[]>(DEFAULT_OPTIONS);

  // Cargar opciones del localStorage al montar
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsedOptions = JSON.parse(saved);
        if (Array.isArray(parsedOptions) && parsedOptions.length > 0) {
          setOptions(parsedOptions);
        }
      } catch (error) {
        console.error('Error loading ruleta options:', error);
      }
    }
  }, []);

  // Guardar opciones cuando cambien
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(options));
  }, [options]);

  // Atajos de teclado: Enter para girar ruleta
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isSpinning && options.length > 0) {
        e.preventDefault();
        spin();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isSpinning, options.length]);

  const segmentAngle = 360 / options.length;

  const addOption = () => {
    if (inputValue.trim() === '') return;

    const newOption: RuletaOption = {
      id: Math.max(...options.map(o => o.id), 0) + 1,
      label: inputValue.trim(),
      color: COLORS[options.length % COLORS.length],
    };

    setOptions([...options, newOption]);
    setInputValue('');
    setSelectedOption(null);
  };

  const removeOption = (id: number) => {
    if (options.length <= 2) {
      alert('Debes tener al menos 2 opciones');
      return;
    }
    setOptions(options.filter(o => o.id !== id));
    setSelectedOption(null);
  };

  const clearAll = () => {
    if (window.confirm('¿Estás seguro de que quieres eliminar todas las opciones?')) {
      setOptions([]);
      setInputValue('');
      setSelectedOption(null);
    }
  };

  const spin = () => {
    if (isSpinning || options.length === 0) return;

    setIsSpinning(true);

    playSound('spin');

    // Generar rotación aleatoria (al menos 5 vueltas)
    const randomRotation = Math.random() * 360 + 1800;
    const newRotation = rotation + randomRotation;
    setRotation(newRotation);

    setTimeout(() => {
      // Calcular qué opción quedó en la parte superior
      const normalizedRotation = newRotation % 360;
      const selectedIndex = Math.floor((360 - normalizedRotation) / segmentAngle) % options.length;
      setSelectedOption(options[selectedIndex]);
      playSound('click');
      setIsSpinning(false);
    }, 3500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">La Ruleta Aleatoria</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Columna izquierda - Ruleta */}
          <div className="lg:col-span-3 flex flex-col items-center">
            <div className="relative w-96 h-96 mb-8">
              {/* Flecha indicadora */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-2 z-10">
                <div className="w-0 h-0 border-l-6 border-r-6 border-t-8 border-l-transparent border-r-transparent border-t-red-500"></div>
              </div>

              {/* Ruleta */}
              <svg
                viewBox="0 0 400 400"
                className="w-full h-full"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: 'transform 3.5s ease-out',
                  transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                }}
              >
                {options.map((option, index) => {
                  const startAngle = (index * segmentAngle * Math.PI) / 180;
                  const endAngle = ((index + 1) * segmentAngle * Math.PI) / 180;
                  const radius = 150;

                  const x1 = 200 + radius * Math.cos(startAngle);
                  const y1 = 200 + radius * Math.sin(startAngle);
                  const x2 = 200 + radius * Math.cos(endAngle);
                  const y2 = 200 + radius * Math.sin(endAngle);

                  const largeArc = segmentAngle > 180 ? 1 : 0;

                  const pathData = `M 200 200 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

                  const labelAngle = startAngle + (endAngle - startAngle) / 2;
                  const labelRadius = 100;
                  const labelX = 200 + labelRadius * Math.cos(labelAngle);
                  const labelY = 200 + labelRadius * Math.sin(labelAngle);

                  return (
                    <g key={option.id}>
                      <path
                        d={pathData}
                        fill={option.color}
                        stroke="white"
                        strokeWidth="2"
                      />
                      <text
                        x={labelX}
                        y={labelY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize={options.length > 8 ? "16" : "24"}
                        fontWeight="bold"
                        fill="white"
                        style={{ pointerEvents: 'none' }}
                      >
                        {option.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            <button
              onClick={spin}
              disabled={isSpinning || options.length === 0}
              className="px-8 py-4 bg-gradient-to-r from-pink-500 to-rose-500 text-white font-bold text-lg rounded-lg hover:from-pink-600 hover:to-rose-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
            >
              {isSpinning ? 'Girando...' : '¡Girar la Ruleta!'}
            </button>

            {selectedOption && !isSpinning && (
              <div className="mt-8 p-6 bg-white rounded-lg shadow-lg border-2 border-pink-500 text-center">
                <p className="text-gray-600 text-lg mb-2">Resultado:</p>
                <p
                  className="text-5xl font-bold"
                  style={{ color: selectedOption.color }}
                >
                  {selectedOption.label}
                </p>
              </div>
            )}
          </div>

          {/* Columna derecha - Panel de entrada */}
          <div className="bg-white rounded-lg shadow-lg p-6 h-fit">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Opciones</h2>

            {/* Input */}
            <div className="mb-4">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addOption()}
                placeholder="Ingresa una opción..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 mb-2"
              />
              <button
                onClick={addOption}
                className="w-full px-4 py-2 bg-purple-500 text-white font-semibold rounded-lg hover:bg-purple-600 transition-colors"
              >
                Agregar
              </button>
            </div>

            {/* Lista de opciones */}
            <div className="max-h-96 overflow-y-auto">
              <div className="space-y-2">
                {options.map((option) => (
                  <div
                    key={option.id}
                    className="flex items-center justify-between bg-gray-100 p-3 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    <div className="flex items-center gap-3 flex-1">
                      <div
                        className="w-4 h-4 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: option.color }}
                      ></div>
                      <span className="text-gray-800 font-medium truncate">
                        {option.label}
                      </span>
                    </div>
                    <button
                      onClick={() => removeOption(option.id)}
                      className="text-red-500 hover:text-red-700 font-bold ml-2"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
              {options.length === 0 && (
                <p className="text-center text-gray-400 py-4">
                  No hay opciones aún
                </p>
              )}
            </div>

            {/* Contador */}
            <div className="mt-4 p-3 bg-purple-100 rounded-lg text-center">
              <p className="text-sm text-gray-600">Total de opciones:</p>
              <p className="text-2xl font-bold text-purple-600">{options.length}</p>
            </div>

            {/* Botón limpiar */}
            {options.length > 0 && (
              <button
                onClick={clearAll}
                className="w-full mt-4 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
              >
                Limpiar Todo
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
