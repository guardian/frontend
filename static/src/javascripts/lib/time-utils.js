// @flow

// TODO: remove
// const daysSince = (date: ?string): number => {
//     const oneDay = 24 * 60 * 60 * 1000;
//
//     if (date !== null && date !== undefined) {
//         try {
//             const ms = Date.parse(date);
//
//             if (Number.isNaN(ms)) return Infinity;
//             return (new Date() - ms) / oneDay;
//         } catch (e) {
//             return Infinity;
//         }
//     }
//     return Infinity;
// };

const dateDiffDays = (from: Date, to: Date): number => {
    const diffMs = to - from;
    const oneDayMs = 24 * 60 * 60 * 1000;
    return Math.floor(diffMs / oneDayMs)
};

export { dateDiffDays };
