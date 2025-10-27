import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Modal } from './Modal';
import { playSound } from '../utils/sounds';

type BetType = 'rojo' | 'negro' | 'verde' | 'numero' | null;

interface WheelNumber {
  num: number;
  color: 'rojo' | 'negro' | 'verde';
}

interface Stats {
  totalSpins: number;
  wins: number;
  losses: number;
  profit: number;
}

interface GameHistory {
  number: number;
  color: 'rojo' | 'negro' | 'verde';
  timestamp: string;
}

const STORAGE_KEY = 'ruleta_casino_stats';

// Números de ruleta casino (0-36)
const WHEEL_NUMBERS: WheelNumber[] = [
  { num: 0, color: 'verde' },
  ...Array.from({ length: 36 }, (_, i) => ({
    num: i + 1,
    color: (i + 1) % 2 === 0 ? 'rojo' : 'negro',
  })),
];

export const RuletaSimplificada = () => {
  const [isSpinning, setIsSpinning] = useState(false);
  const [result, setResult] = useState<WheelNumber | null>(null);
  const [rotation, setRotation] = useState(0);
  const [selectedBet, setSelectedBet] = useState<BetType>(null);
  const [betNumber, setBetNumber] = useState<number | null>(null);
  const [stats, setStats] = useState<Stats>({ totalSpins: 0, wins: 0, losses: 0, profit: 0 });
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [lastResult, setLastResult] = useState<string>('');

  // Cargar datos
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { stats: savedStats, history: savedHistory } = JSON.parse(saved);
        setStats(savedStats || { totalSpins: 0, wins: 0, losses: 0, profit: 0 });
        setHistory(savedHistory || []);
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    }
  }, []);

  // Guardar datos
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ stats, history }));
  }, [stats, history]);

  // Atajos de teclado
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && !isSpinning && selectedBet) {
        e.preventDefault();
        spin();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isSpinning, selectedBet, betNumber]);

  const spin = () => {
    if (isSpinning || !selectedBet) return;

    setIsSpinning(true);
    playSound('spin');

    // Generar ángulo de rotación aleatorio
    const randomAngle = Math.random() * 360;

    // Agregar rotaciones completas para la animación (10 giros + rotación final)
    const fullSpins = 3600; // 10 giros completos
    const newRotation = rotation + fullSpins + randomAngle;
    setRotation(newRotation);

    setTimeout(() => {
      // Calcular cuál número quedó en la flecha basándose en la rotación final
      const normalizedRotation = newRotation % 360;
      const segmentAngle = 360 / 37;
      const numberIndex = Math.round((360 - normalizedRotation) / segmentAngle) % 37;
      const wheelResult = WHEEL_NUMBERS[numberIndex];

      setResult(wheelResult);

      // Validar apuesta
      let isWin = false;
      if (selectedBet === 'rojo' && wheelResult.color === 'rojo') isWin = true;
      if (selectedBet === 'negro' && wheelResult.color === 'negro') isWin = true;
      if (selectedBet === 'verde' && wheelResult.color === 'verde') isWin = true;
      if (selectedBet === 'numero' && wheelResult.num === betNumber) isWin = true;

      // Actualizar estadísticas
      setStats((prev) => ({
        totalSpins: prev.totalSpins + 1,
        wins: isWin ? prev.wins + 1 : prev.wins,
        losses: !isWin ? prev.losses + 1 : prev.losses,
        profit: isWin ? prev.profit + 100 : prev.profit - 10,
      }));

      // Agregar al historial
      const now = new Date();
      const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
      setHistory((prev) => [
        { number: wheelResult.num, color: wheelResult.color, timestamp: timeStr },
        ...prev.slice(0, 19),
      ]);

      setLastResult(isWin ? '¡GANASTE! 🎉' : 'Perdiste 😢');
      isWin ? playSound('win') : playSound('lose');
      setIsSpinning(false);
    }, 2500);
  };

  const resetStats = () => {
    setStats({ totalSpins: 0, wins: 0, losses: 0, profit: 0 });
    setHistory([]);
    setResult(null);
    setSelectedBet(null);
    setBetNumber(null);
    setShowConfirmModal(false);
  };

  const winRate = stats.totalSpins > 0 ? ((stats.wins / stats.totalSpins) * 100).toFixed(1) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-50 p-3">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">🎰 Ruleta de Casino</h1>

        <div className="grid grid-cols-1 lg:grid-cols-6 gap-3">
          {/* Columna izquierda - Ruleta */}
          <div className="lg:col-span-2 flex flex-col items-center justify-start pt-12">
            {/* Ruleta visual estilo casino */}
            <div className="relative w-96 h-96 mb-6 flex items-center justify-center">
              {/* Flecha indicadora apuntando hacia abajo */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
                <div className="text-4xl">⬇️</div>
              </div>

              {/* Ruleta */}
              <svg
                viewBox="0 0 400 400"
                className="w-full h-full"
                style={{
                  transform: `rotate(${rotation}deg)`,
                  transition: isSpinning ? 'transform 2.5s ease-out' : 'none',
                  transitionTimingFunction: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                }}
              >
                {/* Números de ruleta */}
                {WHEEL_NUMBERS.map((item, index) => {
                  const startAngle = (index * 360) / 37;
                  const segmentSize = 360 / 37;
                  const midAngle = startAngle + segmentSize / 2;
                  const radius = 150;

                  const x1 = 200 + radius * Math.cos((startAngle * Math.PI) / 180);
                  const y1 = 200 + radius * Math.sin((startAngle * Math.PI) / 180);
                  const x2 = 200 + radius * Math.cos(((startAngle + segmentSize) * Math.PI) / 180);
                  const y2 = 200 + radius * Math.sin(((startAngle + segmentSize) * Math.PI) / 180);

                  const labelRadius = 110;
                  const labelX = 200 + labelRadius * Math.cos((midAngle * Math.PI) / 180);
                  const labelY = 200 + labelRadius * Math.sin((midAngle * Math.PI) / 180);

                  const color =
                    item.color === 'rojo'
                      ? '#DC2626'
                      : item.color === 'negro'
                      ? '#1F2937'
                      : '#22C55E';

                  const largeArc = segmentSize > 180 ? 1 : 0;
                  const pathData = `M 200 200 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2} Z`;

                  return (
                    <g key={item.num}>
                      <path d={pathData} fill={color} stroke="white" strokeWidth="1.5" />
                      <text
                        x={labelX}
                        y={labelY}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        fontSize="14"
                        fontWeight="bold"
                        fill="white"
                        style={{ pointerEvents: 'none' }}
                      >
                        {item.num}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>

          {/* Columna derecha - Apuestas y controles */}
          <div className="lg:col-span-3 flex flex-col justify-start">
            {/* Opciones de apuesta */}
            <div className="mb-3 w-full">
              <p className="text-center text-gray-700 font-bold mb-2 text-sm">Elige tu apuesta:</p>

              {/* Apuestas por color */}
              <div className="flex gap-2 justify-center mb-3 flex-wrap">
                {[
                  { id: 'rojo', label: 'Rojo', emoji: '🔴', color: 'from-red-400 to-red-600' },
                  { id: 'negro', label: 'Negro', emoji: '⚫', color: 'from-gray-700 to-gray-900' },
                  { id: 'verde', label: 'Verde (0)', emoji: '🟢', color: 'from-green-400 to-green-600' },
                ].map((bet) => (
                  <button
                    key={bet.id}
                    onClick={() => {
                      setSelectedBet(bet.id as BetType);
                      setBetNumber(null);
                    }}
                    disabled={isSpinning}
                    className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                      selectedBet === bet.id
                        ? `bg-gradient-to-r ${bet.color} text-white border-3 border-white scale-105`
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-gray-500'
                    } disabled:opacity-50`}
                  >
                    {bet.emoji} {bet.label}
                  </button>
                ))}
              </div>

              {/* Apuesta por número */}
              <div className="bg-white rounded-lg p-2 border-2 border-gray-300 max-h-48 overflow-y-auto">
                <p className="text-xs font-semibold text-gray-700 mb-2">O apuesta a un número:</p>
                <div className="grid grid-cols-9 gap-1">
                  {Array.from({ length: 36 }, (_, i) => i + 1).map((num) => (
                    <button
                      key={num}
                      onClick={() => {
                        setSelectedBet('numero');
                        setBetNumber(num);
                      }}
                      disabled={isSpinning}
                      className={`py-1 px-0.5 rounded font-bold text-xs transition-all ${
                        selectedBet === 'numero' && betNumber === num
                          ? 'bg-blue-500 text-white border border-white'
                          : 'bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200'
                      } disabled:opacity-50`}
                    >
                      {num}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Botón girar */}
            <button
              onClick={spin}
              disabled={isSpinning || !selectedBet}
              className="w-full px-4 py-2 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold rounded-lg hover:from-yellow-600 hover:to-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95 mb-2 text-sm"
            >
              {isSpinning ? 'Girando...' : '¡Girar!'}
            </button>

            {result && !isSpinning && (
              <div className="p-3 bg-white rounded-lg shadow-lg border-3 border-yellow-500 text-center w-full">
                <p className="text-xs text-gray-600 mb-1">Resultado:</p>
                <div className="flex items-center justify-center gap-2 mb-2">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold text-white"
                    style={{
                      backgroundColor:
                        result.color === 'rojo'
                          ? '#DC2626'
                          : result.color === 'negro'
                          ? '#1F2937'
                          : '#22C55E',
                    }}
                  >
                    {result.num}
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-800">{result.num}</p>
                    <p className="text-xs font-bold text-gray-600">{result.color.toUpperCase()}</p>
                  </div>
                </div>
                <p className="text-sm font-bold">{lastResult}</p>
              </div>
            )}
          </div>

          {/* Columna derecha - Estadísticas */}
          <div className="lg:col-span-1 space-y-3">
            {/* Estadísticas */}
            <div className="bg-white rounded-lg shadow-lg p-4">
              <h2 className="text-lg font-bold text-gray-800 mb-2">Estadísticas</h2>

              <div className="mb-2 p-2 bg-blue-100 rounded-lg text-center">
                <p className="text-xs text-gray-600">Giros totales</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalSpins}</p>
              </div>

              <div className="space-y-1 mb-3">
                <div className="bg-green-100 p-2 rounded flex justify-between items-center text-sm">
                  <span className="font-semibold">Ganados</span>
                  <span className="font-bold text-green-600">{stats.wins}</span>
                </div>
                <div className="bg-red-100 p-2 rounded flex justify-between items-center text-sm">
                  <span className="font-semibold">Perdidos</span>
                  <span className="font-bold text-red-600">{stats.losses}</span>
                </div>
                <div className="bg-purple-100 p-2 rounded flex justify-between items-center text-sm">
                  <span className="font-semibold">Tasa</span>
                  <span className="font-bold text-purple-600">{winRate}%</span>
                </div>
                <div className={`${stats.profit >= 0 ? 'bg-green-100' : 'bg-red-100'} p-2 rounded flex justify-between items-center text-sm`}>
                  <span className="font-semibold">Ganancia</span>
                  <span className={`font-bold ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${stats.profit}
                  </span>
                </div>
              </div>

              {stats.totalSpins > 0 && (
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="w-full px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                >
                  Reiniciar
                </button>
              )}
            </div>

            {/* Historial */}
            {history.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-3">
                <h3 className="text-sm font-bold text-gray-800 mb-2">Últimas jugadas</h3>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {history.map((game, idx) => {
                    const colorEmoji =
                      game.color === 'rojo' ? '🔴' : game.color === 'negro' ? '⚫' : '🟢';
                    return (
                      <div key={idx} className="bg-gray-100 p-1 rounded text-xs flex justify-between items-center">
                        <span>
                          {colorEmoji} #{game.number}
                        </span>
                        <span className="text-gray-500 text-xs">{game.timestamp}</span>
                      </div>
                    );
                  })}
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
