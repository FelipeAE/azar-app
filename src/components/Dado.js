import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Modal } from './Modal';
import { playSound } from '../utils/sounds';
const STORAGE_KEY = 'dado_stats';
export const Dado = () => {
    const [isRolling, setIsRolling] = useState(false);
    const [result, setResult] = useState(null);
    const [rotation, setRotation] = useState({ x: 0, y: 0 });
    const [stats, setStats] = useState({
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
    });
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [history, setHistory] = useState([]);
    // Cargar datos del localStorage
    useEffect(() => {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
            try {
                const { stats: savedStats, history: savedHistory } = JSON.parse(saved);
                setStats(savedStats || {});
                setHistory(savedHistory || []);
            }
            catch (error) {
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
        const handleKeyPress = (e) => {
            if ((e.code === 'Space' || e.key === ' ') && !isRolling) {
                e.preventDefault();
                roll();
            }
        };
        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, [isRolling]);
    const roll = () => {
        if (isRolling)
            return;
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
                [randomResult]: prev[randomResult] + 1,
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
    return (_jsxs("div", { className: "min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 p-4", children: [_jsxs("div", { className: "max-w-7xl mx-auto", children: [_jsx("h1", { className: "text-4xl font-bold mb-8 text-gray-800", children: "\uD83C\uDFB2 Lanzar Dado" }), _jsxs("div", { className: "grid grid-cols-1 lg:grid-cols-4 gap-8", children: [_jsxs("div", { className: "lg:col-span-3 flex flex-col items-center", children: [_jsx("div", { style: { perspective: '1000px', width: '300px', height: '300px' }, className: "flex items-center justify-center", children: _jsxs("div", { className: "w-48 h-48 bg-gradient-to-br from-red-400 to-red-600 rounded-lg shadow-2xl flex items-center justify-center relative", style: {
                                                transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) rotateZ(${rotation.y * 0.5}deg) scale(1.1)`,
                                                transformStyle: 'preserve-3d',
                                                transition: 'transform 0.05s ease-out',
                                            }, children: [_jsx("div", { className: "text-8xl font-bold text-white drop-shadow-lg", children: result || '?' }), _jsx("div", { className: "absolute inset-0 rounded-lg pointer-events-none", style: {
                                                        boxShadow: `0 20px 40px rgba(0,0,0,0.3), inset 0 -2px 8px rgba(0,0,0,0.2)`,
                                                    } })] }) }), _jsx("button", { onClick: roll, disabled: isRolling, className: "mt-8 px-8 py-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold text-lg rounded-lg hover:from-indigo-600 hover:to-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-105 active:scale-95", children: isRolling ? 'Lanzando...' : '¡Lanzar Dado!' }), _jsx("p", { className: "mt-4 text-sm text-gray-600", children: "Presiona ESPACIO para lanzar" }), result && !isRolling && (_jsxs("div", { className: "mt-8 p-6 bg-white rounded-lg shadow-lg border-2 border-indigo-500 text-center", children: [_jsx("p", { className: "text-gray-600 text-lg mb-2", children: "Resultado:" }), _jsx("p", { className: "text-6xl font-bold text-indigo-600", children: result })] }))] }), _jsxs("div", { className: "space-y-4", children: [_jsxs("div", { className: "bg-white rounded-lg shadow-lg p-6", children: [_jsx("h2", { className: "text-2xl font-bold text-gray-800 mb-4", children: "Estad\u00EDsticas" }), _jsxs("div", { className: "mb-4 p-3 bg-indigo-100 rounded-lg text-center", children: [_jsx("p", { className: "text-sm text-gray-600", children: "Total de lanzamientos" }), _jsx("p", { className: "text-3xl font-bold text-indigo-600", children: totalRolls })] }), _jsx("div", { className: "space-y-2", children: [1, 2, 3, 4, 5, 6].map((num) => (_jsxs("div", { className: "flex items-center justify-between bg-gray-100 p-2 rounded", children: [_jsxs("span", { className: "font-semibold", children: ["N\u00BA ", num] }), _jsx("span", { className: "font-bold text-indigo-600", children: stats[num] })] }, num))) }), totalRolls > 0 && (_jsx("button", { onClick: () => setShowConfirmModal(true), className: "w-full mt-4 px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors", children: "Reiniciar" }))] }), history.length > 0 && (_jsxs("div", { className: "bg-white rounded-lg shadow-lg p-6", children: [_jsx("h3", { className: "text-lg font-bold text-gray-800 mb-3", children: "\u00DAltimas jugadas" }), _jsx("div", { className: "flex gap-2 flex-wrap", children: history.map((val, idx) => (_jsx("div", { className: "w-10 h-10 bg-indigo-500 text-white rounded flex items-center justify-center font-bold", children: val }, idx))) })] }))] })] })] }), _jsx(Modal, { isOpen: showConfirmModal, title: "Reiniciar Estad\u00EDsticas", message: "\u00BFEst\u00E1s seguro de que quieres eliminar todas las estad\u00EDsticas?", onConfirm: resetStats, onCancel: () => setShowConfirmModal(false), confirmText: "S\u00ED, reiniciar", cancelText: "Cancelar" })] }));
};
