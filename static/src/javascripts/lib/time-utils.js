// @flow

const dateDiffDays = (from: Date, to: Date): number => {
    const oneDayMs = 1000 * 60 * 60 * 24;
    const diffMs = to - from;
    return Math.floor(diffMs / oneDayMs);
};

export { dateDiffDays };
