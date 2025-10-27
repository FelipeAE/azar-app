import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { playSound } from '../utils/sounds';

interface DiceStats {
  [key: number]: number;
}

const STORAGE_KEY = 'dado_stats';

export const Dado = () => {
  const [isRolling, setIsRolling] = useState(false);
  const [result, setResult] = useState<number | null>(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [stats, setStats] = useState<DiceStats>({
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
  });
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [history, setHistory] = useState<number[]>([]);

  // Cargar datos del localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { stats: savedStats, history: savedHistory } = JSON.parse(saved);
        setStats(savedStats || {});
        setHistory(savedHistory || []);
      } catch (error) {
        console.error('Error loading dado stats:', error);
      }
    }
  }, []);

  // Guardar datos en localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ stats, history }));
  }, [stats, history]);

  // Atajos de teclado: Space para lanzar dado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.code === 'Space' || e.key === ' ') && !isRolling) {
        e.preventDefault();
        roll();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isRolling]);

  const roll = () => {
    if (isRolling) return;

    setIsRolling(true);
    setResult(null);

    // Reproducir sonido de lanzamiento
    playSound('roll');

    // Animación de giro con múltiples rotaciones (más rápido)
    for (let i = 0; i < 20; i++) {
      setTimeout(() => {
        setRotation({
          x: Math.random() * 360,
          y: Math.random() * 360,
        });
      }, i * 50);
    }

    setTimeout(() => {
      const randomResult = Math.floor(Math.random() * 6) + 1;
      setResult(randomResult);
      setStats((prev) => ({
        ...prev,
        [randomResult]: prev[randomResult as keyof DiceStats] + 1,
      }));
      setHistory((prev) => [randomResult, ...prev.slice(0, 9)]);
      playSound('win');
      setIsRolling(false);
    }, 1000);
  };

  const resetStats = () => {
    setStats({
      1: 0,
      2: 0,
      3: 0,
      4: 0,
      5: 0,
      6: 0,
    });
    setHistory([]);
    setResult(null);
    setShowConfirmModal(false);
  };

  const totalRolls = Object.values(stats).reduce((a, b) => a + b, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">🎲 Lanzar Dado</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Columna izquierda - Dado */}
          <div className="lg:col-span-3 flex flex-col items-center">
            {/* Dado 3D */}
            <div style={{ perspective: '1000px', width: '300px', height: '300px' }} className="flex items-center justify-center">
              <div
                className="w-48 h-48 bg-gradient-to-br from-red-400 to-red-600 rounded-lg shadow-2xl flex items-center justify-center relative"
                style={{
                  transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.y * 0.5}deg) scale(1.1)`,
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.05s ease-out',
                }}
              >
                <div className="text-8xl font-bold text-white drop-shadow-lg">{result || '?'}</div>
                {/* Sombra dinámica */}
                <div
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  style={{
                    boxShadow: `0 20px 40px rgba(0,0,0,0.3), inset 0 -2px 8px rgba(0,0,0,0.2)`,
                  }}
                ></div>
              </div>
            </div>

            <button
              onClick={roll}
              disabled={isRolling}
              className="mt-8 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-lg rounded-lg hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95"
            >
              {isRolling ? 'Lanzando...' : '¡Lanzar Dado!'}
            </button>

            <p className="mt-4 text-sm text-gray-600">
              Presiona ESPACIO para lanzar
            </p>

            {result && !isRolling && (
              <div className="mt-8 p-6 bg-white rounded-lg shadow-lg border-2 border-indigo-500 text-center">
                <p className="text-gray-600 text-lg mb-2">Resultado:</p>
                <p className="text-6xl font-bold text-indigo-600">{result}</p>
              </div>
            )}
          </div>

          {/* Columna derecha - Estadísticas e Historial */}
          <div className="space-y-4">
            {/* Estadísticas */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Estadísticas</h2>

              <div className="mb-4 p-3 bg-indigo-100 rounded-lg text-center">
                <p className="text-sm text-gray-600">Total de lanzamientos</p>
                <p className="text-3xl font-bold text-indigo-600">{totalRolls}</p>
              </div>

              <div className="space-y-2">
                {[1, 2, 3, 4, 5, 6].map((num) => (
                  <div key={num} className="flex items-center justify-between bg-gray-100 p-2 rounded">
                    <span className="font-semibold">Nº {num}</span>
                    <span className="font-bold text-indigo-600">{stats[num as keyof DiceStats]}</span>
                  </div>
                ))}
              </div>

              {totalRolls > 0 && (
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="w-full mt-4 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                >
                  Reiniciar
                </button>
              )}
            </div>

            {/* Historial */}
            {history.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Últimas jugadas</h3>
                <div className="flex gap-2 flex-wrap">
                  {history.map((val, idx) => (
                    <div
                      key={idx}
                      className="w-10 h-10 bg-indigo-500 text-white rounded flex items-center justify-center font-bold"
                    >
                      {val}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showConfirmModal}
        title="Reiniciar Estadísticas"
        message="¿Estás seguro de que quieres eliminar todas las estadísticas?"
        onConfirm={resetStats}
        onCancel={() => setShowConfirmModal(false)}
        confirmText="Sí, reiniciar"
        cancelText="Cancelar"
      />
    </div>
  );
};
