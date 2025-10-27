import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { playSound } from '../utils/sounds';

type Choice = 'piedra' | 'papel' | 'tijera' | null;
type Result = 'ganaste' | 'perdiste' | 'empate' | null;

interface Stats {
  wins: number;
  losses: number;
  draws: number;
}

interface GameHistory {
  playerChoice: Choice;
  computerChoice: Choice;
  result: Result;
}

const STORAGE_KEY = 'ppt_stats';

const CHOICES = [
  { id: 'piedra', label: 'Piedra', emoji: '✊', color: 'from-slate-400 to-slate-600' },
  { id: 'papel', label: 'Papel', emoji: '✋', color: 'from-orange-400 to-orange-600' },
  { id: 'tijera', label: 'Tijera', emoji: '✌️', color: 'from-pink-400 to-pink-600' },
];

export const PiedraPapelTijera = () => {
  const [playerChoice, setPlayerChoice] = useState<Choice>(null);
  const [computerChoice, setComputerChoice] = useState<Choice>(null);
  const [result, setResult] = useState<Result>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stats, setStats] = useState<Stats>({ wins: 0, losses: 0, draws: 0 });
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // Cargar datos del localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const { stats: savedStats, history: savedHistory } = JSON.parse(saved);
        setStats(savedStats || { wins: 0, losses: 0, draws: 0 });
        setHistory(savedHistory || []);
      } catch (error) {
        console.error('Error loading PPT stats:', error);
      }
    }
  }, []);

  // Guardar datos
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ stats, history }));
  }, [stats, history]);

  const getWinner = (player: Choice, computer: Choice): Result => {
    if (player === computer) return 'empate';
    if (
      (player === 'piedra' && computer === 'tijera') ||
      (player === 'papel' && computer === 'piedra') ||
      (player === 'tijera' && computer === 'papel')
    ) {
      return 'ganaste';
    }
    return 'perdiste';
  };

  const play = (choice: Choice) => {
    if (isPlaying) return;

    setIsPlaying(true);
    setPlayerChoice(choice);
    setComputerChoice(null);
    setResult(null);

    playSound('spin');

    // Simular pensamiento de la IA
    setTimeout(() => {
      const randomChoice = CHOICES[Math.floor(Math.random() * 3)].id as Choice;
      setComputerChoice(randomChoice);

      setTimeout(() => {
        const gameResult = getWinner(choice, randomChoice);
        setResult(gameResult);
        gameResult === 'ganaste' ? playSound('win') : gameResult === 'empate' ? playSound('click') : playSound('lose');

        // Actualizar estadísticas
        setStats((prev) => ({
          ...prev,
          wins: gameResult === 'ganaste' ? prev.wins + 1 : prev.wins,
          losses: gameResult === 'perdiste' ? prev.losses + 1 : prev.losses,
          draws: gameResult === 'empate' ? prev.draws + 1 : prev.draws,
        }));

        // Agregar al historial
        setHistory((prev) => [
          { playerChoice: choice, computerChoice: randomChoice, result: gameResult },
          ...prev.slice(0, 9),
        ]);

        setIsPlaying(false);
      }, 500);
    }, 1000);
  };

  const resetStats = () => {
    setStats({ wins: 0, losses: 0, draws: 0 });
    setHistory([]);
    setPlayerChoice(null);
    setComputerChoice(null);
    setResult(null);
    setShowConfirmModal(false);
  };

  const total = stats.wins + stats.losses + stats.draws;

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-gray-800">✊ Piedra, Papel o Tijera</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Columna izquierda - Juego */}
          <div className="lg:col-span-3 flex flex-col items-center">
            {/* Opciones */}
            <div className="mb-8">
              <p className="text-center text-gray-600 mb-4">Elige tu opción:</p>
              <div className="flex gap-4 justify-center flex-wrap">
                {CHOICES.map((choice) => (
                  <button
                    key={choice.id}
                    onClick={() => play(choice.id as Choice)}
                    disabled={isPlaying}
                    className={`px-6 py-4 rounded-lg font-bold text-white text-lg transition-all transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r ${choice.color}`}
                  >
                    <div className="text-4xl mb-2">{choice.emoji}</div>
                    {choice.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Resultado del juego */}
            {playerChoice && computerChoice && (
              <div className="mb-8 w-full max-w-2xl">
                <div className="grid grid-cols-3 gap-4 mb-6">
                  {/* Tú */}
                  <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                    <p className="text-sm text-gray-600 mb-2">Tú</p>
                    <div className="text-6xl mb-2">
                      {CHOICES.find((c) => c.id === playerChoice)?.emoji}
                    </div>
                    <p className="font-bold text-gray-800">
                      {CHOICES.find((c) => c.id === playerChoice)?.label}
                    </p>
                  </div>

                  {/* VS */}
                  <div className="flex items-center justify-center">
                    <p className="text-2xl font-bold text-gray-400">VS</p>
                  </div>

                  {/* Computadora */}
                  <div className="bg-white rounded-lg shadow-lg p-6 text-center">
                    <p className="text-sm text-gray-600 mb-2">IA</p>
                    <div className="text-6xl mb-2">
                      {CHOICES.find((c) => c.id === computerChoice)?.emoji}
                    </div>
                    <p className="font-bold text-gray-800">
                      {CHOICES.find((c) => c.id === computerChoice)?.label}
                    </p>
                  </div>
                </div>

                {/* Resultado */}
                {result && (
                  <div className={`text-center p-6 rounded-lg font-bold text-2xl text-white ${
                    result === 'ganaste'
                      ? 'bg-gradient-to-r from-green-500 to-teal-500'
                      : result === 'perdiste'
                      ? 'bg-gradient-to-r from-red-500 to-pink-500'
                      : 'bg-gradient-to-r from-yellow-500 to-amber-500'
                  }`}>
                    {result === 'ganaste' && '🎉 ¡GANASTE!'}
                    {result === 'perdiste' && '😢 Perdiste'}
                    {result === 'empate' && '🤝 Empate'}
                  </div>
                )}
              </div>
            )}

            {isPlaying && (
              <div className="text-center">
                <p className="text-lg font-bold text-gray-600">La IA está pensando...</p>
              </div>
            )}
          </div>

          {/* Columna derecha - Estadísticas */}
          <div className="space-y-4">
            {/* Estadísticas */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Estadísticas</h2>

              <div className="mb-4 p-3 bg-blue-100 rounded-lg text-center">
                <p className="text-sm text-gray-600">Juegos totales</p>
                <p className="text-3xl font-bold text-blue-600">{total}</p>
              </div>

              <div className="space-y-2 mb-4">
                <div className="bg-green-100 p-3 rounded flex justify-between items-center">
                  <span className="font-semibold">Ganados</span>
                  <span className="text-xl font-bold text-green-600">{stats.wins}</span>
                </div>
                <div className="bg-red-100 p-3 rounded flex justify-between items-center">
                  <span className="font-semibold">Perdidos</span>
                  <span className="text-xl font-bold text-red-600">{stats.losses}</span>
                </div>
                <div className="bg-yellow-100 p-3 rounded flex justify-between items-center">
                  <span className="font-semibold">Empates</span>
                  <span className="text-xl font-bold text-yellow-600">{stats.draws}</span>
                </div>
              </div>

              {total > 0 && (
                <>
                  <div className="mb-4 p-3 bg-purple-100 rounded text-center">
                    <p className="text-sm text-gray-600">Tasa de victoria</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {((stats.wins / total) * 100).toFixed(1)}%
                    </p>
                  </div>

                  <button
                    onClick={() => setShowConfirmModal(true)}
                    className="w-full px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors"
                  >
                    Reiniciar
                  </button>
                </>
              )}
            </div>

            {/* Historial */}
            {history.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Últimas jugadas</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {history.map((game, idx) => (
                    <div key={idx} className="text-sm flex justify-between items-center bg-gray-100 p-2 rounded">
                      <span>
                        {CHOICES.find((c) => c.id === game.playerChoice)?.emoji} vs{' '}
                        {CHOICES.find((c) => c.id === game.computerChoice)?.emoji}
                      </span>
                      <span
                        className={`font-bold ${
                          game.result === 'ganaste'
                            ? 'text-green-600'
                            : game.result === 'perdiste'
                            ? 'text-red-600'
                            : 'text-yellow-600'
                        }`}
                      >
                        {game.result === 'ganaste' && '✓'}
                        {game.result === 'perdiste' && '✗'}
                        {game.result === 'empate' && '='}
                      </span>
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
