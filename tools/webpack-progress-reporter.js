const ProgressPlugin = require('webpack/lib/ProgressPlugin');

module.exports = observer => new ProgressPlugin((progress, msg, ...details) => {
    const [a, b] = details;
    const state = a && b ? `[${a}, ${b}]` : '';
    return observer.next(`${Math.round(progress * 100)}% ${msg} ${state}`);
});
