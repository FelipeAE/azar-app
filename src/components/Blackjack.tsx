import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { playSound } from '../utils/sounds';

interface Card {
  suit: string;
  value: string;
  numericValue: number;
}

interface Stats {
  totalGames: number;
  wins: number;
  losses: number;
  ties: number;
  profit: number;
}

interface GameHistory {
  result: string;
  playerScore: number;
  dealerScore: number;
  profit: number;
  timestamp: string;
}

const SUITS = ['♠', '♣', '♥', '♦'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
const STORAGE_KEY = 'blackjack_stats';

export const Blackjack = () => {
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [gameState, setGameState] = useState<'betting' | 'playing' | 'result'>('betting');
  const [result, setResult] = useState<string>('');
  const [playerScore, setPlayerScore] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);
  const [stats, setStats] = useState<Stats>({ totalGames: 0, wins: 0, losses: 0, ties: 0, profit: 0 });
  const [history, setHistory] = useState<GameHistory[]>([]);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [dealerRevealed, setDealerRevealed] = useState(false);
  const [bet, setBet] = useState(10);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const { stats: savedStats, history: savedHistory } = JSON.parse(saved);
      setStats(savedStats);
      setHistory(savedHistory);
    }
    initializeDeck();
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ stats, history }));
  }, [stats, history]);

  const createDeck = (): Card[] => {
    const newDeck: Card[] = [];
    SUITS.forEach((suit) => {
      VALUES.forEach((value) => {
        let numericValue = 0;
        if (value === 'A') numericValue = 11;
        else if (['J', 'Q', 'K'].includes(value)) numericValue = 10;
        else numericValue = parseInt(value);

        newDeck.push({ suit, value, numericValue });
      });
    });
    return newDeck.sort(() => Math.random() - 0.5);
  };

  const initializeDeck = () => {
    setDeck(createDeck());
  };

  const calculateScore = (hand: Card[]): number => {
    let score = 0;
    let aces = 0;

    hand.forEach((card) => {
      if (card.value === 'A') {
        aces += 1;
        score += 11;
      } else {
        score += card.numericValue;
      }
    });

    while (score > 21 && aces > 0) {
      score -= 10;
      aces -= 1;
    }

    return score;
  };

  const startGame = () => {
    const newDeck = [...deck];
    const player: Card[] = [];
    const dealer: Card[] = [];

    player.push(newDeck.pop()!);
    dealer.push(newDeck.pop()!);
    player.push(newDeck.pop()!);
    dealer.push(newDeck.pop()!);

    setDeck(newDeck);
    setPlayerHand(player);
    setDealerHand(dealer);
    setGameState('playing');
    setDealerRevealed(false);
    setResult('');
    playSound('spin');

    setPlayerScore(calculateScore(player));
  };

  const hit = () => {
    const newCard = deck.pop();
    if (!newCard) return;

    const newHand = [...playerHand, newCard];
    setPlayerHand(newHand);
    const newScore = calculateScore(newHand);
    setPlayerScore(newScore);
    setDeck([...deck]);

    if (newScore > 21) {
      endGame(newHand, dealerHand, true);
    }
  };

  const stand = () => {
    setDealerRevealed(true);
    dealerTurn(dealerHand);
  };

  const dealerTurn = (hand: Card[]) => {
    let dealerCards = [...hand];
    let dealerCurrentScore = calculateScore(dealerCards);

    const dealerAutomatic = () => {
      while (dealerCurrentScore < 17 && deck.length > 0) {
        const newCard = deck.pop();
        if (newCard) {
          dealerCards.push(newCard);
          dealerCurrentScore = calculateScore(dealerCards);
        }
      }
      setDealerHand(dealerCards);
      setDealerScore(dealerCurrentScore);
      endGame(playerHand, dealerCards, false);
    };

    setTimeout(dealerAutomatic, 1000);
  };

  const endGame = (pHand: Card[], dHand: Card[], playerBusted: boolean) => {
    const pScore = calculateScore(pHand);
    const dScore = calculateScore(dHand);

    setDealerScore(dScore);
    setDealerRevealed(true);

    let gameResult = '';
    let isWin = false;
    let isTie = false;
    let profit = 0;

    if (playerBusted || pScore > 21) {
      gameResult = 'Perdiste - ¡Reventaste!';
      profit = -bet;
    } else if (dScore > 21) {
      gameResult = '¡Ganaste! Dealer reventó';
      isWin = true;
      profit = bet;
    } else if (pScore > dScore) {
      gameResult = '¡Ganaste!';
      isWin = true;
      profit = bet;
    } else if (dScore > pScore) {
      gameResult = 'Perdiste';
      profit = -bet;
    } else {
      gameResult = 'Empate';
      isTie = true;
      profit = 0;
    }

    setResult(gameResult);
    setGameState('result');

    setStats((prev) => ({
      totalGames: prev.totalGames + 1,
      wins: isWin ? prev.wins + 1 : prev.wins,
      losses: !isWin && !isTie ? prev.losses + 1 : prev.losses,
      ties: isTie ? prev.ties + 1 : prev.ties,
      profit: prev.profit + profit,
    }));

    const now = new Date();
    const timeStr = now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' });
    setHistory((prev) => [
      { result: gameResult, playerScore: pScore, dealerScore: dScore, profit, timestamp: timeStr },
      ...prev.slice(0, 19),
    ]);

    if (isWin) {
      playSound('win');
    } else if (isTie) {
      playSound('spin');
    } else {
      playSound('lose');
    }
  };

  const resetStats = () => {
    setStats({ totalGames: 0, wins: 0, losses: 0, ties: 0, profit: 0 });
    setHistory([]);
    setShowConfirmModal(false);
  };

  const winRate = stats.totalGames > 0 ? ((stats.wins / stats.totalGames) * 100).toFixed(1) : 0;

  const renderCard = (card: Card | null, faceDown: boolean = false) => {
    if (!card) return null;

    return (
      <div className={`w-24 h-32 rounded-lg flex items-center justify-center text-2xl font-bold border-2 ${
        faceDown
          ? 'bg-blue-600 border-blue-800'
          : card.suit === '♥' || card.suit === '♦'
          ? 'bg-white border-red-500 text-red-600'
          : 'bg-white border-black text-black'
      }`}>
        {!faceDown && (
          <div className="text-center">
            <div>{card.value}</div>
            <div className="text-3xl">{card.suit}</div>
          </div>
        )}
        {faceDown && '?'}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 to-green-700 p-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-white">♠️ Blackjack</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Juego */}
          <div className="lg:col-span-2 space-y-6">
            {/* Dealer */}
            <div className="bg-green-800 rounded-xl p-6 text-white">
              <h2 className="text-2xl font-bold mb-4">Dealer</h2>
              <div className="flex gap-4 mb-4">
                {dealerHand.map((card, index) => (
                  <div key={index}>
                    {renderCard(card, gameState === 'playing' && index === 1 && !dealerRevealed)}
                  </div>
                ))}
              </div>
              {dealerRevealed && <p className="text-xl font-bold">Score: {dealerScore}</p>}
            </div>

            {/* Jugador */}
            <div className="bg-green-800 rounded-xl p-6 text-white">
              <h2 className="text-2xl font-bold mb-4">Tu Mano</h2>
              <div className="flex gap-4 mb-4">
                {playerHand.map((card, index) => (
                  <div key={index}>{renderCard(card)}</div>
                ))}
              </div>
              <p className="text-xl font-bold">Score: {playerScore}</p>
            </div>

            {/* Acciones */}
            <div className="space-y-3">
              {gameState === 'betting' && (
                <div>
                  <div className="flex gap-4 items-center mb-4">
                    <label className="text-white font-bold">Apuesta:</label>
                    <input
                      type="number"
                      min="1"
                      max="1000"
                      value={bet}
                      onChange={(e) => setBet(parseInt(e.target.value) || 10)}
                      className="px-4 py-2 rounded-lg w-20"
                    />
                  </div>
                  <button
                    onClick={startGame}
                    className="w-full px-6 py-3 bg-yellow-500 text-black font-bold rounded-lg hover:bg-yellow-600 transition-all"
                  >
                    Comenzar Juego
                  </button>
                </div>
              )}

              {gameState === 'playing' && (
                <div className="flex gap-3">
                  <button
                    onClick={hit}
                    className="flex-1 px-6 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-all"
                  >
                    Pedir Carta
                  </button>
                  <button
                    onClick={stand}
                    className="flex-1 px-6 py-3 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-all"
                  >
                    Plantarse
                  </button>
                </div>
              )}

              {gameState === 'result' && (
                <div>
                  <div className="bg-white rounded-lg p-4 mb-4 text-center">
                    <p className={`text-3xl font-bold ${
                      result.includes('Ganaste') ? 'text-green-600' : result.includes('Empate') ? 'text-blue-600' : 'text-red-600'
                    }`}>
                      {result}
                    </p>
                  </div>
                  <button
                    onClick={() => setGameState('betting')}
                    className="w-full px-6 py-3 bg-green-500 text-white font-bold rounded-lg hover:bg-green-600 transition-all"
                  >
                    Jugar de Nuevo
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Estadísticas */}
          <div className="space-y-4">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">Estadísticas</h2>

              <div className="mb-4 p-3 bg-blue-100 rounded-lg text-center">
                <p className="text-sm text-gray-600">Juegos totales</p>
                <p className="text-3xl font-bold text-blue-600">{stats.totalGames}</p>
              </div>

              <div className="space-y-2 mb-4">
                <div className="bg-green-100 p-3 rounded-lg flex justify-between items-center">
                  <span className="font-semibold">Ganados</span>
                  <span className="text-xl font-bold text-green-600">{stats.wins}</span>
                </div>
                <div className="bg-red-100 p-3 rounded-lg flex justify-between items-center">
                  <span className="font-semibold">Perdidos</span>
                  <span className="text-xl font-bold text-red-600">{stats.losses}</span>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg flex justify-between items-center">
                  <span className="font-semibold">Empates</span>
                  <span className="text-xl font-bold text-blue-600">{stats.ties}</span>
                </div>
                <div className={`${stats.profit >= 0 ? 'bg-green-100' : 'bg-red-100'} p-3 rounded-lg flex justify-between items-center`}>
                  <span className="font-semibold">Ganancia</span>
                  <span className={`text-xl font-bold ${stats.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    ${stats.profit}
                  </span>
                </div>
              </div>

              {stats.totalGames > 0 && (
                <button
                  onClick={() => setShowConfirmModal(true)}
                  className="w-full px-4 py-2 bg-red-500 text-white font-bold rounded-lg hover:bg-red-600 transition-all"
                >
                  Reiniciar
                </button>
              )}
            </div>

            {/* Historial */}
            {history.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-3">Últimos juegos</h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {history.map((game, idx) => (
                    <div key={idx} className="bg-gray-100 p-2 rounded-lg text-xs flex justify-between items-center">
                      <span>
                        {game.playerScore} vs {game.dealerScore}
                        {game.profit > 0 ? ' ✅' : game.profit < 0 ? ' ❌' : ' 🟦'}
                      </span>
                      <span className="text-gray-500">{game.timestamp}</span>
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
        title="Confirmar reinicio"
        message="¿Estás seguro de que quieres reiniciar todas las estadísticas?"
        onConfirm={resetStats}
        onCancel={() => setShowConfirmModal(false)}
      />
    </div>
  );
};
