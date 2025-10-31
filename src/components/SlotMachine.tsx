import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound } from '../utils/sounds';

// Símbolos del slot con sus valores y multiplicadores
const SYMBOLS = {
  seven: { icon: '7️⃣', value: 20, color: '#FFD700' },      // Premio Mayor - 7 dorado
  diamond: { icon: '💎', value: 15, color: '#00D4FF' },    // Diamante
  bell: { icon: '🔔', value: 12, color: '#FFD93D' },       // Campana
  cherry: { icon: '🍒', value: 10, color: '#FF1744' },     // Cereza
  lemon: { icon: '🍋', value: 8, color: '#FFE135' },       // Limón
  watermelon: { icon: '🍉', value: 7, color: '#FF006E' },  // Sandía
  grape: { icon: '🍇', value: 6, color: '#9D4EDD' },       // Uvas
  A: { icon: 'A', value: 4, color: '#FF006E' },            // As
  K: { icon: 'K', value: 3, color: '#FF1744' },            // K
  Q: { icon: 'Q', value: 2, color: '#FBC02D' },            // Q
} as const;

type SymbolKey = keyof typeof SYMBOLS;

// Definición de las 25 líneas de pago (índices de posición en la matriz 5x3)
// Cada línea es un array de 5 posiciones [col0, col1, col2, col3, col4]
// donde 0=fila superior, 1=fila media, 2=fila inferior
const PAYLINES = [
  [1, 1, 1, 1, 1], // Línea 1: Media horizontal
  [0, 0, 0, 0, 0], // Línea 2: Superior horizontal
  [2, 2, 2, 2, 2], // Línea 3: Inferior horizontal
  [0, 1, 2, 1, 0], // Línea 4: V
  [2, 1, 0, 1, 2], // Línea 5: V invertida
  [0, 0, 1, 0, 0], // Línea 6
  [2, 2, 1, 2, 2], // Línea 7
  [1, 0, 0, 0, 1], // Línea 8
  [1, 2, 2, 2, 1], // Línea 9
  [1, 0, 1, 0, 1], // Línea 10
  [1, 2, 1, 2, 1], // Línea 11
  [0, 1, 0, 1, 0], // Línea 12
  [2, 1, 2, 1, 2], // Línea 13
  [0, 1, 1, 1, 0], // Línea 14
  [2, 1, 1, 1, 2], // Línea 15
  [1, 1, 0, 1, 1], // Línea 16
  [1, 1, 2, 1, 1], // Línea 17
  [0, 0, 2, 0, 0], // Línea 18
  [2, 2, 0, 2, 2], // Línea 19
  [0, 2, 2, 2, 0], // Línea 20
  [2, 0, 0, 0, 2], // Línea 21
  [1, 0, 2, 0, 1], // Línea 22
  [1, 2, 0, 2, 1], // Línea 23
  [0, 2, 0, 2, 0], // Línea 24
  [2, 0, 2, 0, 2], // Línea 25
];

interface WinningLine {
  lineNumber: number;
  symbol: SymbolKey;
  count: number;
  positions: number[];
  payout: number;
}

interface SlotStats {
  totalSpins: number;
  totalWagered: number;
  totalWon: number;
  biggestWin: number;
}

const STORAGE_KEY = 'slot_machine_stats';

export const SlotMachine = () => {
  // Estado del juego
  const [reels, setReels] = useState<SymbolKey[][]>([[], [], [], [], []]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [balance, setBalance] = useState(1000);
  const [betPerLine, setBetPerLine] = useState(1);
  const [activeLines, setActiveLines] = useState(25);
  const [lastWin, setLastWin] = useState(0);
  const [winningLines, setWinningLines] = useState<WinningLine[]>([]);
  const [showWinAnimation, setShowWinAnimation] = useState(false);
  const [stats, setStats] = useState<SlotStats>({
    totalSpins: 0,
    totalWagered: 0,
    totalWon: 0,
    biggestWin: 0,
  });
  const [autoSpinsRemaining, setAutoSpinsRemaining] = useState(0);
  const [autoSpinsActive, setAutoSpinsActive] = useState(false);
  const [spinSpeed, setSpinSpeed] = useState(1); // 1 = normal, 2 = doble, 3 = triple

  // Cargar estadísticas
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStats(parsed.stats || stats);
        setBalance(parsed.balance || 1000);
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    }
    // Inicializar carretes
    initializeReels();
  }, []);

  // Guardar estadísticas
  useEffect(() => {
    if (stats.totalSpins > 0) {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ stats, balance })
      );
    }
  }, [stats, balance]);

  // Inicializar carretes con símbolos aleatorios
  const initializeReels = () => {
    const newReels: SymbolKey[][] = [];
    for (let i = 0; i < 5; i++) {
      newReels[i] = Array(3)
        .fill(null)
        .map(() => getRandomSymbol());
    }
    setReels(newReels);
  };

  // Obtener símbolo aleatorio con ponderación
  const getRandomSymbol = (): SymbolKey => {
    const symbolKeys = Object.keys(SYMBOLS) as SymbolKey[];
    // Ponderación: símbolos de mayor valor son más raros
    // 7️⃣ es el más raro (1), Q es el más común (20)
    const weights = [1, 2, 3, 5, 7, 9, 11, 14, 18, 20];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < symbolKeys.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return symbolKeys[i];
      }
    }
    return symbolKeys[symbolKeys.length - 1];
  };

  // Calcular apuesta total
  const totalBet = betPerLine * activeLines;

  // Función para girar los carretes
  const spin = async () => {
    if (isSpinning || balance < totalBet) return;

    setIsSpinning(true);
    setWinningLines([]);
    setLastWin(0);
    setShowWinAnimation(false);

    // Descontar apuesta
    setBalance((prev) => prev - totalBet);
    playSound('spin');

    // Actualizar estadísticas
    setStats((prev) => ({
      ...prev,
      totalSpins: prev.totalSpins + 1,
      totalWagered: prev.totalWagered + totalBet,
    }));

    // Simular giro (generar nuevos símbolos)
    // Cada carrete gira durante diferentes tiempos para efecto escalonado
    const delays = [400, 550, 700, 850, 1000].map(d => d / spinSpeed);
    const newReels: SymbolKey[][] = [[], [], [], [], []];

    for (let col = 0; col < 5; col++) {
      await new Promise((resolve) => setTimeout(resolve, delays[col]));
      newReels[col] = Array(3)
        .fill(null)
        .map(() => getRandomSymbol());
      setReels([...newReels]);
    }

    // Esperar a que termine la última animación
    await new Promise((resolve) => setTimeout(resolve, 300 / spinSpeed));

    // Calcular ganancias
    const wins = calculateWins(newReels);
    if (wins.totalPayout > 0) {
      setWinningLines(wins.lines);
      setLastWin(wins.totalPayout);
      setBalance((prev) => prev + wins.totalPayout);
      setShowWinAnimation(true);
      playSound('win');

      // Actualizar estadísticas
      setStats((prev) => ({
        ...prev,
        totalWon: prev.totalWon + wins.totalPayout,
        biggestWin: Math.max(prev.biggestWin, wins.totalPayout),
      }));
    } else {
      playSound('lose');
    }

    setIsSpinning(false);

    // Si hay auto spins activos, decrementar contador
    if (autoSpinsActive && autoSpinsRemaining > 0) {
      const newRemaining = autoSpinsRemaining - 1;
      setAutoSpinsRemaining(newRemaining);
      console.log('✅ SlotMachine spin completado, restantes:', newRemaining);
    }
  };

  // Calcular ganancias en todas las líneas activas
  const calculateWins = (reelsData: SymbolKey[][]) => {
    const lines: WinningLine[] = [];
    let totalPayout = 0;

    for (let i = 0; i < activeLines; i++) {
      const payline = PAYLINES[i];
      const symbols = payline.map((row, col) => reelsData[col][row]);

      // Contar símbolos consecutivos desde la izquierda
      const firstSymbol = symbols[0];
      let count = 1;
      for (let j = 1; j < symbols.length; j++) {
        if (symbols[j] === firstSymbol) {
          count++;
        } else {
          break;
        }
      }

      // Si hay al menos 3 símbolos iguales, es ganador
      if (count >= 3) {
        const symbolValue = SYMBOLS[firstSymbol].value;
        // Multiplicadores especiales para el 7️⃣
        const multipliers = firstSymbol === 'seven'
          ? [0, 0, 10, 50, 200] // 7️⃣: x10, x50, x200
          : [0, 0, 5, 10, 25];  // Otros: x5, x10, x25
        const payout = betPerLine * symbolValue * multipliers[count];

        lines.push({
          lineNumber: i + 1,
          symbol: firstSymbol,
          count,
          positions: payline.slice(0, count).map((row, col) => col * 3 + row),
          payout,
        });

        totalPayout += payout;
      }
    }

    return { lines, totalPayout };
  };

  // Iniciar giros automáticos
  const startAutoSpins = (count: number) => {
    console.log('🎰 SlotMachine iniciando:', { count, balance, totalBet, check: balance >= totalBet * 10 });
    if (isSpinning || balance < totalBet || balance < totalBet * 10) return;
    setAutoSpinsRemaining(count);
    setAutoSpinsActive(true);
    setTimeout(() => spin(), 100);
  };

  // Detener giros automáticos
  const stopAutoSpins = () => {
    setAutoSpinsActive(false);
    setAutoSpinsRemaining(0);
  };

  // Manejar teclas
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.key === 'Enter' || e.key === ' ') && !autoSpinsActive) {
        e.preventDefault();
        spin();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isSpinning, balance, totalBet, autoSpinsActive]);

  // Efecto para continuar auto-spin
  useEffect(() => {
    // No hacer nada si no está activo, está girando, o ya llegó a 0
    if (!autoSpinsActive || isSpinning || autoSpinsRemaining <= 0) {
      if (autoSpinsRemaining === 0 && autoSpinsActive) {
        setAutoSpinsActive(false);
        console.log('🛑 SlotMachine auto-spin completado - llegó a 0');
      }
      return;
    }
    
    console.log('🔄 SlotMachine useEffect:', { autoSpinsRemaining, balance, totalBet, check: balance >= totalBet * 10 });
    
    const canContinue = autoSpinsRemaining > 0 && balance >= totalBet * 10;
    
    if (canContinue) {
      console.log('✅ SlotMachine programando siguiente giro');
      const timer = setTimeout(() => {
        spin();
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      console.log('❌ SlotMachine deteniendo - Balance bajo');
      setAutoSpinsActive(false);
      setAutoSpinsRemaining(0);
      if (balance < totalBet * 10) {
        playSound('lose');
      }
    }
  }, [autoSpinsActive, autoSpinsRemaining, isSpinning, balance, totalBet]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-800 via-green-700 to-green-900 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header con balance y controles */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-t-2xl p-4 shadow-2xl">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="text-2xl font-bold text-white">
              💰 Balance: ${balance.toFixed(2)}
            </div>
            <div className="flex gap-4 items-center flex-wrap">
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <div className="text-xs text-white/80">Apuesta/Línea</div>
                <select
                  value={betPerLine}
                  onChange={(e) => setBetPerLine(Number(e.target.value))}
                  disabled={isSpinning}
                  className="bg-transparent text-white font-bold text-lg border-none outline-none cursor-pointer"
                >
                  {[1, 2, 5, 10, 25, 50].map((bet) => (
                    <option key={bet} value={bet} className="text-gray-900">
                      ${bet}
                    </option>
                  ))}
                </select>
              </div>
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <div className="text-xs text-white/80">Líneas Activas</div>
                <select
                  value={activeLines}
                  onChange={(e) => setActiveLines(Number(e.target.value))}
                  disabled={isSpinning}
                  className="bg-transparent text-white font-bold text-lg border-none outline-none cursor-pointer"
                >
                  {[1, 5, 10, 15, 20, 25].map((lines) => (
                    <option key={lines} value={lines} className="text-gray-900">
                      {lines}
                    </option>
                  ))}
                </select>
              </div>
              <div className="bg-white/20 rounded-lg px-4 py-2">
                <div className="text-xs text-white/80">Apuesta Total</div>
                <div className="text-white font-bold text-lg">${totalBet}</div>
              </div>
            </div>
          </div>
          {/* Controles de Auto Spin */}
          <div className="mt-3 flex justify-center gap-2 flex-wrap">
            {!autoSpinsActive ? (
              <>
                <button
                  onClick={() => startAutoSpins(10)}
                  disabled={isSpinning || balance < totalBet}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 text-white font-bold rounded-lg transition-all text-sm"
                >
                  🔄 10
                </button>
                <button
                  onClick={() => startAutoSpins(20)}
                  disabled={isSpinning || balance < totalBet}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 text-white font-bold rounded-lg transition-all text-sm"
                >
                  🔄 20
                </button>
                <button
                  onClick={() => startAutoSpins(50)}
                  disabled={isSpinning || balance < totalBet}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 text-white font-bold rounded-lg transition-all text-sm"
                >
                  🔄 50
                </button>
                <button
                  onClick={() => startAutoSpins(100)}
                  disabled={isSpinning || balance < totalBet}
                  className="px-3 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-500 text-white font-bold rounded-lg transition-all text-sm"
                >
                  🔄 100
                </button>
              </>
            ) : (
              <button
                onClick={stopAutoSpins}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg transition-all animate-pulse"
              >
                ⏹️ DETENER ({autoSpinsRemaining})
              </button>
            )}
          </div>
        </div>

        {/* Slot Machine */}
        <div className="bg-gradient-to-b from-blue-900 to-blue-950 p-4 shadow-2xl">
          <div className="relative">
            {/* Carretes */}
            <div className="grid grid-cols-5 gap-0.5 bg-black/30 p-0.5 rounded-xl max-w-lg mx-auto">
              {reels.map((reel, colIndex) => (
                <div key={colIndex} className="flex flex-col gap-0.5">
                  {reel.map((symbol, rowIndex) => {
                    const isWinningSymbol = winningLines.some((line) =>
                      line.positions.includes(colIndex * 3 + rowIndex)
                    );
                    return (
                      <motion.div
                        key={`${colIndex}-${rowIndex}`}
                        className={`aspect-square bg-gradient-to-br from-white to-gray-200 rounded flex items-center justify-center text-base md:text-lg font-bold shadow-lg ${
                          isWinningSymbol && showWinAnimation
                            ? 'ring-2 ring-yellow-400'
                            : ''
                        }`}
                        style={{
                          color: SYMBOLS[symbol]?.color || '#000',
                        }}
                        animate={
                          isWinningSymbol && showWinAnimation
                            ? {
                                scale: [1, 1.1, 1],
                                rotate: [0, 5, -5, 0],
                              }
                            : {}
                        }
                        transition={{
                          repeat: showWinAnimation ? Infinity : 0,
                          duration: 0.5,
                        }}
                      >
                        {SYMBOLS[symbol]?.icon || '?'}
                      </motion.div>
                    );
                  })}
                </div>
              ))}
            </div>

            {/* Overlay de spinning */}
            <AnimatePresence>
              {isSpinning && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 bg-black/20 rounded-xl flex items-center justify-center"
                >
                  <div className="text-6xl animate-spin">🎰</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Botón de Spin */}
          <div className="mt-3 flex justify-center flex-col items-center gap-2">
            {/* Control de velocidad */}
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => setSpinSpeed(1)}
                disabled={isSpinning}
                className={`px-3 py-1 rounded-lg font-semibold text-sm transition-all ${
                  spinSpeed === 1
                    ? 'bg-red-600 text-white'
                    : 'bg-white/80 text-gray-700 hover:bg-white'
                } disabled:opacity-50`}
              >
                1x
              </button>
              <button
                onClick={() => setSpinSpeed(2)}
                disabled={isSpinning}
                className={`px-3 py-1 rounded-lg font-semibold text-sm transition-all ${
                  spinSpeed === 2
                    ? 'bg-red-600 text-white'
                    : 'bg-white/80 text-gray-700 hover:bg-white'
                } disabled:opacity-50`}
              >
                2x
              </button>
              <button
                onClick={() => setSpinSpeed(3)}
                disabled={isSpinning}
                className={`px-3 py-1 rounded-lg font-semibold text-sm transition-all ${
                  spinSpeed === 3
                    ? 'bg-red-600 text-white'
                    : 'bg-white/80 text-gray-700 hover:bg-white'
                } disabled:opacity-50`}
              >
                3x
              </button>
            </div>

            {autoSpinsActive && (
              <div className="bg-purple-600 text-white px-4 py-1.5 rounded-full font-bold text-base">
                🔄 AUTO SPINS: {autoSpinsRemaining} restantes
              </div>
            )}
            <button
              onClick={spin}
              disabled={isSpinning || balance < totalBet || autoSpinsActive}
              className={`px-10 py-3 rounded-full text-xl font-bold transition-all transform ${
                isSpinning || balance < totalBet || autoSpinsActive
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:scale-105 hover:shadow-2xl active:scale-95'
              }`}
            >
              {autoSpinsActive ? '🔄 AUTO...' : isSpinning ? '🎰 GIRANDO...' : '🎰 GIRAR'}
            </button>
          </div>

          {/* Información de última ganancia */}
          {lastWin > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-3 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-3 text-center"
            >
              <div className="text-2xl font-bold text-white">
                🎉 ¡GANASTE ${lastWin.toFixed(2)}! 🎉
              </div>
              <div className="mt-2 text-sm text-white/90">
                {winningLines.length} línea{winningLines.length > 1 ? 's' : ''}{' '}
                ganadora{winningLines.length > 1 ? 's' : ''}
              </div>
            </motion.div>
          )}
        </div>

        {/* Estadísticas */}
        <div className="bg-gradient-to-r from-purple-600 to-purple-700 rounded-b-xl p-2 shadow-2xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-white">
            <div>
              <div className="text-lg font-bold">{stats.totalSpins}</div>
              <div className="text-xs opacity-80">Giros Totales</div>
            </div>
            <div>
              <div className="text-lg font-bold">
                ${stats.totalWagered.toFixed(0)}
              </div>
              <div className="text-xs opacity-80">Total Apostado</div>
            </div>
            <div>
              <div className="text-lg font-bold">
                ${stats.totalWon.toFixed(0)}
              </div>
              <div className="text-xs opacity-80">Total Ganado</div>
            </div>
            <div>
              <div className="text-lg font-bold">
                ${stats.biggestWin.toFixed(0)}
              </div>
              <div className="text-xs opacity-80">Mayor Ganancia</div>
            </div>
          </div>
        </div>

        {/* Tabla de Pagos */}
        <div className="mt-6 bg-white/10 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-2xl font-bold text-white mb-4 text-center">
            📋 Tabla de Pagos
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {Object.entries(SYMBOLS).map(([key, symbol]) => (
              <div
                key={key}
                className="bg-white/20 rounded-lg p-3 text-center"
              >
                <div className="text-4xl mb-2">{symbol.icon}</div>
                <div className="text-white text-sm font-bold">
                  x{symbol.value}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-white/80 text-sm text-center space-y-1">
            <div>3 símbolos = x5 | 4 símbolos = x10 | 5 símbolos = x25</div>
            <div className="text-yellow-400 font-bold">
              ⭐ 5 x 7️⃣ = JACKPOT x200 ⭐
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
