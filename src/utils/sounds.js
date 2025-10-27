// Sonidos usando Web Audio API
export const playSound = (type) => {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    switch (type) {
        case 'spin':
            // Sonido de giro
            playSpinSound(audioContext);
            break;
        case 'win':
            // Sonido de victoria
            playWinSound(audioContext);
            break;
        case 'lose':
            // Sonido de pérdida
            playLoseSound(audioContext);
            break;
        case 'click':
            // Sonido de click
            playClickSound(audioContext);
            break;
        case 'roll':
            // Sonido de dado
            playRollSound(audioContext);
            break;
    }
};
const playSpinSound = (ctx) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(200, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.5);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
    osc.start(now);
    osc.stop(now + 0.5);
};
const playWinSound = (ctx) => {
    const now = ctx.currentTime;
    const notes = [523.25, 659.25, 783.99]; // C, E, G
    notes.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, now + index * 0.1);
        gain.gain.setValueAtTime(0.3, now + index * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + index * 0.1 + 0.3);
        osc.start(now + index * 0.1);
        osc.stop(now + index * 0.1 + 0.3);
    });
};
const playLoseSound = (ctx) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(200, now + 0.3);
    gain.gain.setValueAtTime(0.3, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);
    osc.start(now);
    osc.stop(now + 0.3);
};
const playClickSound = (ctx) => {
    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.setValueAtTime(800, now);
    gain.gain.setValueAtTime(0.2, now);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
    osc.start(now);
    osc.stop(now + 0.1);
};
const playRollSound = (ctx) => {
    const now = ctx.currentTime;
    for (let i = 0; i < 5; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(300 + i * 100, now + i * 0.1);
        gain.gain.setValueAtTime(0.2, now + i * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.15);
        osc.start(now + i * 0.1);
        osc.stop(now + i * 0.1 + 0.15);
    }
};
