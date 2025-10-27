import { useState, useEffect } from 'react';
import { playSound } from '../utils/sounds';

type CoinSide = 'cara' | 'cruz' | null;

const STORAGE_KEY = 'caracruz_stats';

export const CaraCruz = () => {
  const [isFlipping, setIsFlipping] = useState(false);
  const [result, setResult] = useState<CoinSide>(null);
  const [rotation, setRotation] = useState(0);
  const [caraCount, setCaraCount] = useState(0);
  const [cruzCount, setCruzCount] = useState(0);

  // Cargar datos del localStorage al montar el componente
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { cara, cruz } = JSON.parse(saved);
        setCaraCount(cara || 0);
        setCruzCount(cruz || 0);
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    }
  }, []);

  // Guardar datos en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ cara: caraCount, cruz: cruzCount }));
  }, [caraCount, cruzCount]);

  // Atajos de teclado: Space para lanzar moneda
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.key === ' ') && !isFlipping) {
        e.preventDefault();
        flip();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFlipping]);

  const flip = () => {
    if (isFlipping) return;

    setIsFlipping(true);
    setResult(null);

    playSound('spin');

    // Generar rotación aleatoria (más vueltas para animación más larga)
    const randomRotation = Math.random() * 1440 + 2880;
    const newRotation = rotation + randomRotation;
    setRotation(newRotation);

    setTimeout(() => {
      const normalizedRotation = newRotation % 360;
      // Con backface-visibility: hidden
      // CARA visible: 0-90° y 270-360°
      // CRUZ visible: 90-270°
      const coinResult: CoinSide = (normalizedRotation >= 90 && normalizedRotation < 270) ? 'cruz' : 'cara';
      setResult(coinResult);

      playSound('click');

      // Actualizar contador
      if (coinResult === 'cara') {
        setCaraCount(prev => prev + 1);
      } else if (coinResult === 'cruz') {
        setCruzCount(prev => prev + 1);
      }

      setIsFlipping(false);
    }, 2500);
  };

  const resetCounters = () => {
    setCaraCount(0);
    setCruzCount(0);
    setResult(null);
  };

  const totalFlips = caraCount + cruzCount;
  const caraPercentage = totalFlips > 0 ? ((caraCount / totalFlips) * 100).toFixed(1) : 0;
  const cruzPercentage = totalFlips > 0 ? ((cruzCount / totalFlips) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">Cara o Cruz</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Columna izquierda - Moneda */}
          <div className="lg:col-span-3 flex flex-col items-center" style={{ perspective: '1000px' }}>
            <div className="relative w-64 h-64 mb-8">
              {/* Moneda */}
              <div
                className="relative w-full h-full"
                style={{
                  transformStyle: 'preserve-3d',
                  transform: `rotateY(${rotation}deg)`,
                  transition: isFlipping ? 'transform 2.5s ease-out' : 'none',
                }}
              >
                {/* Cara */}
                <div
                  className="absolute w-full h-full bg-gradient-to-br from-yellow-300 to-amber-500 rounded-full flex items-center justify-center border-8 border-amber-700 shadow-2xl"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                  }}
                >
                  <div className="text-center">
                    <p className="text-5xl font-bold text-amber-900 mb-2">👤</p>
                    <p className="text-2xl font-bold text-amber-900">CARA</p>
                  </div>
                </div>

                {/* Cruz */}
                <div
                  className="absolute w-full h-full bg-gradient-to-br from-slate-300 to-slate-500 rounded-full flex items-center justify-center border-8 border-slate-700 shadow-2xl"
                  style={{
                    backfaceVisibility: 'hidden',
                    WebkitBackfaceVisibility: 'hidden',
                    transform: 'rotateY(180deg)',
                  }}
                >
                  <div className="text-center">
                    <p className="text-5xl font-bold text-slate-900 mb-2">✕</p>
                    <p className="text-2xl font-bold text-slate-900">CRUZ</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={flip}
              disabled={isFlipping}
              className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold text-lg rounded-lg hover:from-blue-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
            >
              {isFlipping ? 'Lanzando...' : '¡Lanzar Moneda!'}
            </button>

            {result && !isFlipping && (
              <div className="mt-8 p-6 bg-white rounded-lg shadow-lg border-2 border-blue-500 text-center">
                <p className="text-gray-600 text-lg mb-2">Resultado:</p>
                <p className="text-5xl font-bold text-blue-600 uppercase">
                  {result}
                </p>
              </div>
            )}
          </div>

          {/* Columna derecha - Estadísticas */}
          <div className="bg-white rounded-lg shadow-lg p-6 h-fit">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Estadísticas</h2>

            {/* Contador total */}
            <div className="mb-6 p-4 bg-blue-100 rounded-lg text-center">
              <p className="text-sm text-gray-600">Total de lanzamientos</p>
              <p className="text-3xl font-bold text-blue-600">{totalFlips}</p>
            </div>

            {/* Contador Cara */}
            <div className="mb-4 p-4 bg-amber-100 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <p className="text-3xl">👤</p>
                  <p className="text-lg font-semibold text-gray-800">CARA</p>
                </div>
                <p className="text-2xl font-bold text-amber-600">{caraCount}</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-amber-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${caraPercentage}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1 text-right">{caraPercentage}%</p>
            </div>

            {/* Contador Cruz */}
            <div className="mb-6 p-4 bg-slate-100 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <p className="text-3xl">✕</p>
                  <p className="text-lg font-semibold text-gray-800">CRUZ</p>
                </div>
                <p className="text-2xl font-bold text-slate-600">{cruzCount}</p>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-slate-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${cruzPercentage}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-600 mt-1 text-right">{cruzPercentage}%</p>
            </div>

            {/* Botón resetear */}
            {totalFlips > 0 && (
              <button
                onClick={resetCounters}
                className="w-full px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
              >
                Reiniciar Contadores
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
