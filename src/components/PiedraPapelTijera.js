import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { playSound } from '../utils/sounds';
const STORAGE_KEY = 'ppt_stats';
const CHOICES = [
    { id: 'piedra', label: 'Piedra', emoji: '✊', color: 'from-slate-400 to-slate-600' },
    { id: 'papel', label: 'Papel', emoji: '✋', color: 'from-orange-400 to-orange-600' },
    { id: 'tijera', label: 'Tijera', emoji: '✌️', color: 'from-pink-400 to-pink-600' },
];
export const PiedraPapelTijera = () => {
    const [playerChoice, setPlayerChoice] = useState(null);
    const [computerChoice, setComputerChoice] = useState(null);
    const [result, setResult] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [stats, setStats] = useState({ wins: 0, losses: 0, draws: 0 });
    const [history, setHistory] = useState([]);
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    // Cargar datos del localStorage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const { stats: savedStats, history: savedHistory } = JSON.parse(saved);
                setStats(savedStats || { wins: 0, losses: 0, draws: 0 });
                setHistory(savedHistory || []);
            }
            catch (error) {
                console.error('Error loading PPT stats:', error);
            }
        }
    }, []);
    // Guardar datos
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ stats, history }));
    }, [stats, history]);
    const getWinner = (player, computer) => {
        if (player === computer)
            return 'empate';
        if ((player === 'piedra' && computer === 'tijera') ||
            (player === 'papel' && computer === 'piedra') ||
            (player === 'tijera' && computer === 'papel')) {
            return 'ganaste';
        }
        return 'perdiste';
    };
    const play = (choice) => {
        if (isPlaying)
            return;
        setIsPlaying(true);
        setPlayerChoice(choice);
        setComputerChoice(null);
        setResult(null);
        playSound('spin');
        // Simular pensamiento de la IA
        setTimeout(() => {
            const randomChoice = CHOICES[Math.floor(Math.random() * 3)].id;
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
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-green-50 to-teal-50 p-4", children: [_jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsx("h1", { className: "text-4xl font-bold mb-8 text-gray-800", children: "\u270A Piedra, Papel o Tijera" }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-8", children: [_jsxs("div", { className: "lg:col-span-3 flex flex-col items-center", children: [_jsxs("div", { className: "mb-8", children: [_jsx("p", { className: "text-center text-gray-600 mb-4", children: "Elige tu opci\u00F3n:" }), _jsx("div", { className: "flex gap-4 justify-center flex-wrap", children: CHOICES.map((choice) => (_jsxs("button", { onClick: () => play(choice.id), disabled: isPlaying, className: `px-6 py-4 rounded-lg font-bold text-white text-lg transition-all transform hover:scale-110 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r ${choice.color}`, children: [_jsx("div", { className: "text-4xl mb-2", children: choice.emoji }), choice.label] }, choice.id))) })] }), playerChoice && computerChoice && (_jsxs("div", { className: "mb-8 w-full max-w-2xl", children: [_jsxs("div", { className: "grid grid-cols-3 gap-4 mb-6", children: [_jsxs("div", { className: "bg-white rounded-lg shadow-lg p-6 text-center", children: [_jsx("p", { className: "text-sm text-gray-600 mb-2", children: "T\u00FA" }), _jsx("div", { className: "text-6xl mb-2", children: CHOICES.find((c) => c.id === playerChoice)?.emoji }), _jsx("p", { className: "font-bold text-gray-800", children: CHOICES.find((c) => c.id === playerChoice)?.label })] }), _jsx("div", { className: "flex items-center justify-center", children: _jsx("p", { className: "text-2xl font-bold text-gray-400", children: "VS" }) }), _jsxs("div", { className: "bg-white rounded-lg shadow-lg p-6 text-center", children: [_jsx("p", { className: "text-sm text-gray-600 mb-2", children: "IA" }), _jsx("div", { className: "text-6xl mb-2", children: CHOICES.find((c) => c.id === computerChoice)?.emoji }), _jsx("p", { className: "font-bold text-gray-800", children: CHOICES.find((c) => c.id === computerChoice)?.label })] })] }), result && (_jsxs("div", { className: `text-center p-6 rounded-lg font-bold text-2xl text-white ${result === 'ganaste'
                                                    ? 'bg-gradient-to-r from-green-500 to-teal-500'
                                                    : result === 'perdiste'
                                                        ? 'bg-gradient-to-r from-red-500 to-pink-500'
                                                        : 'bg-gradient-to-r from-yellow-500 to-amber-500'}`, children: [result === 'ganaste' && '🎉 ¡GANASTE!', result === 'perdiste' && '😢 Perdiste', result === 'empate' && '🤝 Empate'] }))] })), isPlaying && (_jsx("div", { className: "text-center", children: _jsx("p", { className: "text-lg font-bold text-gray-600", children: "La IA est\u00E1 pensando..." }) }))] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-white rounded-lg shadow-lg p-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-4", children: "Estad\u00EDsticas" }), _jsxs("div", { className: "mb-4 p-3 bg-blue-100 rounded-lg text-center", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Juegos totales" }), _jsx("p", { className: "text-3xl font-bold text-blue-600", children: total })] }), _jsxs("div", { className: "space-y-2 mb-4", children: [_jsxs("div", { className: "bg-green-100 p-3 rounded flex justify-between items-center", children: [_jsx("span", { className: "font-semibold", children: "Ganados" }), _jsx("span", { className: "text-xl font-bold text-green-600", children: stats.wins })] }), _jsxs("div", { className: "bg-red-100 p-3 rounded flex justify-between items-center", children: [_jsx("span", { className: "font-semibold", children: "Perdidos" }), _jsx("span", { className: "text-xl font-bold text-red-600", children: stats.losses })] }), _jsxs("div", { className: "bg-yellow-100 p-3 rounded flex justify-between items-center", children: [_jsx("span", { className: "font-semibold", children: "Empates" }), _jsx("span", { className: "text-xl font-bold text-yellow-600", children: stats.draws })] })] }), total > 0 && (_jsxs(_Fragment, { children: [_jsxs("div", { className: "mb-4 p-3 bg-purple-100 rounded text-center", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Tasa de victoria" }), _jsxs("p", { className: "text-2xl font-bold text-purple-600", children: [((stats.wins / total) * 100).toFixed(1), "%"] })] }), _jsx("button", { onClick: () => setShowConfirmModal(true), className: "w-full px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors", children: "Reiniciar" })] }))] }), history.length > 0 && (_jsxs("div", { className: "bg-white rounded-lg shadow-lg p-6", children: [_jsx("h3", { className: "text-lg font-bold text-gray-800 mb-3", children: "\u00DAltimas jugadas" }), _jsx("div", { className: "space-y-2 max-h-64 overflow-y-auto", children: history.map((game, idx) => (_jsxs("div", { className: "text-sm flex justify-between items-center bg-gray-100 p-2 rounded", children: [_jsxs("span", { children: [CHOICES.find((c) => c.id === game.playerChoice)?.emoji, " vs", ' ', CHOICES.find((c) => c.id === game.computerChoice)?.emoji] }), _jsxs("span", { className: `font-bold ${game.result === 'ganaste'
                                                                ? 'text-green-600'
                                                                : game.result === 'perdiste'
                                                                    ? 'text-red-600'
                                                                    : 'text-yellow-600'}`, children: [game.result === 'ganaste' && '✓', game.result === 'perdiste' && '✗', game.result === 'empate' && '='] })] }, idx))) })] }))] })] })] }), _jsx(Modal, { isOpen: showConfirmModal, title: "Reiniciar Estad\u00EDsticas", message: "\u00BFEst\u00E1s seguro de que quieres eliminar todas las estad\u00EDsticas?", onConfirm: resetStats, onCancel: () => setShowConfirmModal(false), confirmText: "S\u00ED, reiniciar", cancelText: "Cancelar" })] }));
};
