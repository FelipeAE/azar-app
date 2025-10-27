import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
export const Modal = ({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Confirmar', cancelText = 'Cancelar', }) => {
    if (!isOpen)
        return null;
    const isDark = document.documentElement.classList.contains('dark');
    return (_jsx("div", { className: "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50", children: _jsxs("div", { className: `${isDark ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-2xl p-6 max-w-sm mx-4`, children: [_jsx("h2", { className: `text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'} mb-2`, children: title }), _jsx("p", { className: `${isDark ? 'text-gray-400' : 'text-gray-600'} mb-6`, children: message }), _jsxs("div", { className: "flex gap-3 justify-end", children: [_jsx("button", { onClick: onCancel, className: `px-4 py-2 ${isDark ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-300 text-gray-800 hover:bg-gray-400'} font-semibold rounded-lg transition-colors`, children: cancelText }), _jsx("button", { onClick: onConfirm, className: "px-4 py-2 bg-red-500 text-white font-semibold rounded-lg hover:bg-red-600 transition-colors", children: confirmText })] })] }) }));
};
