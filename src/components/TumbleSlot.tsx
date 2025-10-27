import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { playSound } from '../utils/sounds';

// Símbolos estilo Gates of Olympus
const SYMBOLS = {
  zeus: { icon: '⚡', value: 50, color: '#FFD700', name: 'Zeus' },
  crown: { icon: '👑', value: 12, color: '#FFD700', name: 'Corona' },
  ring: { icon: '💍', value: 10, color: '#FF1493', name: 'Anillo' },
  chalice: { icon: '🏆', value: 8, color: '#FFD700', name: 'Cáliz' },
  harp: { icon: '🎭', value: 7, color: '#9D4EDD', name: 'Máscara' },
  red: { icon: '🔴', value: 2, color: '#FF0000', name: 'Rojo' },
  purple: { icon: '🟣', value: 1.8, color: '#9D4EDD', name: 'Morado' },
  blue: { icon: '🔵', value: 1.6, color: '#0000FF', name: 'Azul' },
  green: { icon: '🟢', value: 1.4, color: '#00FF00', name: 'Verde' },
  yellow: { icon: '🟡', value: 1.2, color: '#FFFF00', name: 'Amarillo' },
} as const;

type SymbolKey = keyof typeof SYMBOLS | '';

interface GridCell {
  symbol: SymbolKey;
  id: string;
  multiplier?: number;
}

interface WinInfo {
  symbol: SymbolKey;
  count: number;
  positions: number[];
  payout: number;
  multiplier: number;
}

interface Stats {
  totalSpins: number;
  totalWagered: number;
  totalWon: number;
  biggestWin: number;
  biggestMultiplier: number;
}

const STORAGE_KEY = 'tumble_slot_stats';
const ROWS = 5;
const COLS = 6;

// Tabla de pagos por cantidad de símbolos
const PAYOUT_TABLE: { [key: number]: number } = {
  8: 0.25,
  9: 0.5,
  10: 1,
  11: 1.5,
  12: 2,
  13: 5,
  14: 10,
  15: 25,
  16: 50,
  17: 100,
  18: 150,
  19: 200,
  20: 250,
  21: 300,
  22: 400,
  23: 500,
  24: 750,
  25: 1000,
  26: 1500,
  27: 2000,
  28: 2500,
  29: 3000,
  30: 5000,
};

export const TumbleSlot = () => {
  const [grid, setGrid] = useState<GridCell[][]>([]);
  const [isSpinning, setIsSpinning] = useState(false);
  const [balance, setBalance] = useState(10000);
  const [bet, setBet] = useState(100);
  const [lastWin, setLastWin] = useState(0);
  const [totalMultiplier, setTotalMultiplier] = useState(1);
  const [winningPositions, setWinningPositions] = useState<number[]>([]);
  const [freeSpinsCount, setFreeSpinsCount] = useState(0);
  const [inFreeSpins, setInFreeSpins] = useState(false);
  const [stats, setStats] = useState<Stats>({
    totalSpins: 0,
    totalWagered: 0,
    totalWon: 0,
    biggestWin: 0,
    biggestMultiplier: 1,
  });
  const [showPaytable, setShowPaytable] = useState(false);
  const [useAnteBet, setUseAnteBet] = useState(false);

  // Cargar estadísticas
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setStats(parsed.stats || stats);
        setBalance(parsed.balance || 10000);
      } catch (error) {
        console.error('Error loading stats:', error);
      }
    }
    initializeGrid();
  }, []);

  // Guardar estadísticas
  useEffect(() => {
    if (stats.totalSpins > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ stats, balance }));
    }
  }, [stats, balance]);

  // Inicializar grid
  const initializeGrid = () => {
    const newGrid: GridCell[][] = [];
    for (let row = 0; row < ROWS; row++) {
      newGrid[row] = [];
      for (let col = 0; col < COLS; col++) {
        newGrid[row][col] = {
          symbol: getRandomSymbol(),
          id: `${row}-${col}-${Date.now()}-${Math.random()}`,
        };
      }
    }
    setGrid(newGrid);
  };

  // Obtener símbolo aleatorio con ponderación
  const getRandomSymbol = (isFreeSpin: boolean = false): SymbolKey => {
    const symbolKeys = Object.keys(SYMBOLS) as SymbolKey[];
    // En free spins, zeus aparece más frecuentemente
    const weights = isFreeSpin
      ? [8, 5, 5, 6, 7, 10, 11, 12, 13, 14] // Zeus más común en free spins
      : [2, 5, 5, 6, 7, 10, 11, 12, 13, 14]; // Zeus muy raro en juego base

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

  // Generar multiplicador aleatorio
  const getRandomMultiplier = (): number => {
    const multipliers = [2, 3, 4, 5, 6, 8, 10, 12, 15, 20, 25, 50, 100, 250, 500];
    const weights = [30, 25, 20, 15, 12, 10, 8, 6, 5, 4, 3, 2, 1, 0.5, 0.2];
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < multipliers.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return multipliers[i];
      }
    }
    return 2;
  };

  // Calcular apuesta total
  const totalBet = useAnteBet ? bet * 1.25 : bet;

  // Función principal de spin
  const spin = async () => {
    if (isSpinning || balance < totalBet) return;

    setIsSpinning(true);
    setWinningPositions([]);
    setLastWin(0);
    setTotalMultiplier(1);

    // Descontar apuesta (excepto si estamos en free spins)
    if (!inFreeSpins) {
      setBalance((prev) => prev - totalBet);
      setStats((prev) => ({
        ...prev,
        totalSpins: prev.totalSpins + 1,
        totalWagered: prev.totalWagered + totalBet,
      }));
    }

    playSound('spin');

    // Generar nuevo grid con animación de caída
    await generateNewGrid();

    // Verificar scatters para free spins
    if (!inFreeSpins) {
      const scatterCount = countSymbol(grid, 'zeus');
      if (scatterCount >= 4) {
        const spinsToAdd = scatterCount === 4 ? 15 : scatterCount === 5 ? 20 : 30;
        setFreeSpinsCount(spinsToAdd);
        setInFreeSpins(true);
        playSound('win');
      }
    }

    // Procesar cascadas
    await processTumbles();

    setIsSpinning(false);

    // Si estamos en free spins, decrementar contador
    if (inFreeSpins) {
      setFreeSpinsCount((prev) => {
        const newCount = prev - 1;
        if (newCount <= 0) {
          setInFreeSpins(false);
        }
        return newCount;
      });
    }
  };

  // Generar nuevo grid
  const generateNewGrid = async () => {
    const newGrid: GridCell[][] = [];
    for (let row = 0; row < ROWS; row++) {
      newGrid[row] = [];
      for (let col = 0; col < COLS; col++) {
        const hasMultiplier = Math.random() < (inFreeSpins ? 0.3 : 0.15);
        newGrid[row][col] = {
          symbol: getRandomSymbol(inFreeSpins),
          id: `${row}-${col}-${Date.now()}-${Math.random()}`,
          multiplier: hasMultiplier ? getRandomMultiplier() : undefined,
        };
      }
    }
    setGrid(newGrid);
    await new Promise((resolve) => setTimeout(resolve, 500));
  };

  // Contar cuántos símbolos hay en el grid
  const countSymbol = (gridData: GridCell[][], symbol: SymbolKey): number => {
    let count = 0;
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (gridData[row][col].symbol === symbol) {
          count++;
        }
      }
    }
    return count;
  };

  // Encontrar posiciones de un símbolo
  const findSymbolPositions = (
    gridData: GridCell[][],
    symbol: SymbolKey
  ): number[] => {
    const positions: number[] = [];
    for (let row = 0; row < ROWS; row++) {
      for (let col = 0; col < COLS; col++) {
        if (gridData[row][col].symbol === symbol) {
          positions.push(row * COLS + col);
        }
      }
    }
    return positions;
  };

  // Calcular ganancias
  const calculateWins = (gridData: GridCell[][]): WinInfo[] => {
    const wins: WinInfo[] = [];
    const symbolKeys = Object.keys(SYMBOLS) as (keyof typeof SYMBOLS)[];

    for (const symbol of symbolKeys) {
      if (symbol === 'zeus') continue; // Zeus es scatter, no paga en scatter pays

      const count = countSymbol(gridData, symbol);
      if (count >= 8) {
        const positions = findSymbolPositions(gridData, symbol);
        const basePayout = PAYOUT_TABLE[count] || 0;
        const symbolValue = SYMBOLS[symbol].value;

        wins.push({
          symbol,
          count,
          positions,
          payout: bet * basePayout * symbolValue,
          multiplier: 1,
        });
      }
    }

    return wins;
  };

  // Procesar cascadas (tumbles)
  const processTumbles = async () => {
    let currentGrid = [...grid.map((row) => [...row])];
    let totalWinAmount = 0;
    let currentMultiplier = 1;
    let hasWins = true;

    while (hasWins) {
      const wins = calculateWins(currentGrid);

      if (wins.length === 0) {
        hasWins = false;
        break;
      }

      // Calcular multiplicador de esta cascada
      const multiplierPositions: number[] = [];
      for (let row = 0; row < ROWS; row++) {
        for (let col = 0; col < COLS; col++) {
          const cell = currentGrid[row][col];
          if (cell.multiplier && wins.some((w) => w.positions.includes(row * COLS + col))) {
            currentMultiplier *= cell.multiplier;
            multiplierPositions.push(row * COLS + col);
          }
        }
      }

      setTotalMultiplier(currentMultiplier);

      // Calcular pago de esta cascada
      const cascadeWin = wins.reduce((sum, win) => sum + win.payout, 0) * currentMultiplier;
      totalWinAmount += cascadeWin;

      // Mostrar símbolos ganadores
      const allWinningPositions = wins.flatMap((w) => w.positions);
      setWinningPositions(allWinningPositions);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Eliminar símbolos ganadores
      for (const win of wins) {
        for (const pos of win.positions) {
          const row = Math.floor(pos / COLS);
          const col = pos % COLS;
          currentGrid[row][col] = {
            symbol: '' as SymbolKey,
            id: `empty-${row}-${col}-${Date.now()}`,
          };
        }
      }

      setGrid([...currentGrid.map((row) => [...row])]);
      await new Promise((resolve) => setTimeout(resolve, 300));

      // Hacer caer símbolos
      currentGrid = dropSymbols(currentGrid);
      setGrid([...currentGrid.map((row) => [...row])]);
      await new Promise((resolve) => setTimeout(resolve, 500));

      setWinningPositions([]);
    }

    if (totalWinAmount > 0) {
      setLastWin(totalWinAmount);
      setBalance((prev) => prev + totalWinAmount);
      playSound('win');

      setStats((prev) => ({
        ...prev,
        totalWon: prev.totalWon + totalWinAmount,
        biggestWin: Math.max(prev.biggestWin, totalWinAmount),
        biggestMultiplier: Math.max(prev.biggestMultiplier, currentMultiplier),
      }));
    } else {
      playSound('lose');
    }
  };

  // Hacer caer símbolos y rellenar espacios vacíos
  const dropSymbols = (gridData: GridCell[][]): GridCell[][] => {
    const newGrid = [...gridData.map((row) => [...row])];

    // Por cada columna, hacer caer símbolos
    for (let col = 0; col < COLS; col++) {
      // Recolectar símbolos no vacíos de esta columna
      const nonEmptySymbols: GridCell[] = [];
      for (let row = ROWS - 1; row >= 0; row--) {
        if (newGrid[row][col].symbol !== '') {
          nonEmptySymbols.push(newGrid[row][col]);
        }
      }

      // Rellenar columna desde abajo
      let symbolIndex = 0;
      for (let row = ROWS - 1; row >= 0; row--) {
        if (symbolIndex < nonEmptySymbols.length) {
          newGrid[row][col] = nonEmptySymbols[symbolIndex];
          symbolIndex++;
        } else {
          // Generar nuevo símbolo
          const hasMultiplier = Math.random() < (inFreeSpins ? 0.3 : 0.15);
          newGrid[row][col] = {
            symbol: getRandomSymbol(inFreeSpins),
            id: `new-${row}-${col}-${Date.now()}-${Math.random()}`,
            multiplier: hasMultiplier ? getRandomMultiplier() : undefined,
          };
        }
      }
    }

    return newGrid;
  };

  // Comprar free spins
  const buyFreeSpins = () => {
    const cost = bet * 100;
    if (balance < cost || isSpinning) return;

    setBalance((prev) => prev - cost);
    setFreeSpinsCount(15);
    setInFreeSpins(true);
    playSound('win');
  };

  // Manejar teclas
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        spin();
      }
    };
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isSpinning, balance, totalBet, inFreeSpins]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-900 via-purple-800 to-indigo-900 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-t-2xl p-4 shadow-2xl">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <div className="text-3xl font-bold text-white">
                ⚡ Gates of Olympus Style
              </div>
              {inFreeSpins && (
                <div className="text-xl font-bold text-purple-900 animate-pulse">
                  🎉 FREE SPINS: {freeSpinsCount} restantes 🎉
                </div>
              )}
            </div>
            <div className="text-2xl font-bold text-white">
              💰 ${balance.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Controles */}
        <div className="bg-gradient-to-r from-purple-700 to-purple-800 p-4 flex justify-between items-center flex-wrap gap-4">
          <div className="flex gap-4 items-center flex-wrap">
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <div className="text-xs text-white/80">Apuesta</div>
              <select
                value={bet}
                onChange={(e) => setBet(Number(e.target.value))}
                disabled={isSpinning || inFreeSpins}
                className="bg-transparent text-white font-bold text-lg border-none outline-none cursor-pointer"
              >
                {[20, 50, 100, 200, 500, 1000, 2000].map((b) => (
                  <option key={b} value={b} className="text-gray-900">
                    ${b}
                  </option>
                ))}
              </select>
            </div>
            <div className="bg-white/20 rounded-lg px-4 py-2">
              <div className="text-xs text-white/80">Apuesta Total</div>
              <div className="text-white font-bold text-lg">
                ${totalBet.toFixed(2)}
              </div>
            </div>
            <button
              onClick={() => setUseAnteBet(!useAnteBet)}
              disabled={isSpinning || inFreeSpins}
              className={`px-4 py-2 rounded-lg font-bold transition-all ${
                useAnteBet
                  ? 'bg-yellow-500 text-white'
                  : 'bg-white/20 text-white/80'
              }`}
            >
              ANTE BET (25%)
            </button>
          </div>
          <div className="flex gap-2">
            <button
              onClick={buyFreeSpins}
              disabled={isSpinning || balance < bet * 100 || inFreeSpins}
              className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-500 text-white font-bold rounded-lg transition-all"
            >
              💰 COMPRAR BONUS (100x)
            </button>
            <button
              onClick={() => setShowPaytable(!showPaytable)}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg transition-all"
            >
              📋 PAGOS
            </button>
          </div>
        </div>

        {/* Grid del Slot */}
        <div className="bg-gradient-to-b from-indigo-950 to-purple-950 p-8 shadow-2xl relative">
          {/* Multiplicador Total */}
          {totalMultiplier > 1 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute top-4 right-4 bg-yellow-500 text-white font-bold text-2xl px-6 py-3 rounded-full z-10 shadow-2xl"
            >
              x{totalMultiplier}
            </motion.div>
          )}

          <div className="grid grid-cols-6 gap-2 bg-black/30 p-4 rounded-xl">
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const position = rowIndex * COLS + colIndex;
                const isWinning = winningPositions.includes(position);
                const symbol = cell.symbol !== '' ? SYMBOLS[cell.symbol as keyof typeof SYMBOLS] : undefined;

                return (
                  <motion.div
                    key={cell.id}
                    className={`aspect-square bg-gradient-to-br from-purple-400 to-purple-600 rounded-lg flex flex-col items-center justify-center text-4xl md:text-5xl font-bold shadow-lg relative ${
                      isWinning ? 'ring-4 ring-yellow-400' : ''
                    }`}
                    style={{
                      backgroundColor: symbol?.color
                        ? `${symbol.color}33`
                        : undefined,
                    }}
                    animate={
                      isWinning
                        ? {
                            scale: [1, 1.1, 1],
                            rotate: [0, 5, -5, 0],
                          }
                        : {}
                    }
                    transition={{
                      repeat: isWinning ? Infinity : 0,
                      duration: 0.5,
                    }}
                    initial={{ opacity: 0, y: -50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                  >
                    {symbol?.icon || ''}
                    {cell.multiplier && (
                      <div className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg">
                        x{cell.multiplier}
                      </div>
                    )}
                  </motion.div>
                );
              })
            )}
          </div>

          {/* Botón Spin */}
          <div className="mt-6 flex justify-center">
            <button
              onClick={spin}
              disabled={isSpinning || balance < totalBet}
              className={`px-16 py-5 rounded-full text-3xl font-bold transition-all transform ${
                isSpinning || (balance < totalBet && !inFreeSpins)
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:scale-105 hover:shadow-2xl active:scale-95'
              }`}
            >
              {isSpinning ? '⚡ GIRANDO...' : inFreeSpins ? '🎰 FREE SPIN' : '🎰 GIRAR'}
            </button>
          </div>

          {/* Win Display */}
          {lastWin > 0 && (
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="mt-6 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-xl p-6 text-center"
            >
              <div className="text-4xl font-bold text-white">
                🎉 GANASTE ${lastWin.toFixed(2)}! 🎉
              </div>
              {totalMultiplier > 1 && (
                <div className="text-2xl font-bold text-purple-900 mt-2">
                  Multiplicador Total: x{totalMultiplier}
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Estadísticas */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-b-2xl p-4 shadow-2xl">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center text-white">
            <div>
              <div className="text-2xl font-bold">{stats.totalSpins}</div>
              <div className="text-xs opacity-80">Giros</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                ${stats.totalWagered.toFixed(0)}
              </div>
              <div className="text-xs opacity-80">Apostado</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                ${stats.totalWon.toFixed(0)}
              </div>
              <div className="text-xs opacity-80">Ganado</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                ${stats.biggestWin.toFixed(0)}
              </div>
              <div className="text-xs opacity-80">Mayor Ganancia</div>
            </div>
            <div>
              <div className="text-2xl font-bold">x{stats.biggestMultiplier}</div>
              <div className="text-xs opacity-80">Mayor Multi</div>
            </div>
          </div>
        </div>

        {/* Tabla de Pagos */}
        <AnimatePresence>
          {showPaytable && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mt-6 bg-black/80 backdrop-blur-sm rounded-xl p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-2xl font-bold text-yellow-400">
                  📋 TABLA DE PAGOS
                </h3>
                <button
                  onClick={() => setShowPaytable(false)}
                  className="text-white text-2xl hover:text-red-500"
                >
                  ✕
                </button>
              </div>
              <div className="text-white space-y-4">
                <div>
                  <div className="font-bold text-lg mb-2">Sistema Scatter Pays:</div>
                  <div className="text-sm">
                    Los símbolos pagan en cualquier posición. Necesitas 8 o más
                    símbolos iguales para ganar.
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {Object.entries(SYMBOLS).map(([key, symbol]) => (
                    <div
                      key={key}
                      className="bg-white/10 rounded-lg p-3 text-center"
                    >
                      <div className="text-4xl mb-2">{symbol.icon}</div>
                      <div className="text-sm font-bold">{symbol.name}</div>
                      <div className="text-xs">Valor: x{symbol.value}</div>
                    </div>
                  ))}
                </div>
                <div>
                  <div className="font-bold mb-2">Multiplicadores de Pago:</div>
                  <div className="text-xs grid grid-cols-3 gap-2">
                    <div>8 símbolos = x0.25</div>
                    <div>12 símbolos = x2</div>
                    <div>15 símbolos = x25</div>
                    <div>20 símbolos = x250</div>
                    <div>25 símbolos = x1000</div>
                    <div>30 símbolos = x5000</div>
                  </div>
                </div>
                <div>
                  <div className="font-bold mb-2">⚡ SCATTER (Zeus):</div>
                  <div className="text-sm">
                    4+ Zeus activan FREE SPINS. Mayor probabilidad de
                    multiplicadores altos.
                  </div>
                </div>
                <div>
                  <div className="font-bold mb-2">🎲 Multiplicadores:</div>
                  <div className="text-sm">
                    Aparecen aleatoriamente (2x hasta 500x). Se multiplican entre
                    sí en cascadas.
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
