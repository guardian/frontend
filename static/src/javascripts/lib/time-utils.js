// @flow

// from and to should be Epoch time in milliseconds
const dateDiffDays = (from: number, to: number): number => {
    const oneDayMs = 1000 * 60 * 60 * 24;
    const diffMs = to - from;
    return Math.floor(diffMs / oneDayMs);
};

export { dateDiffDays };
