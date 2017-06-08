// @flow

const daysSince = (date: ?string): number => {
    const oneDay = 24 * 60 * 60 * 1000;

    if (date !== null && date !== undefined) {
        try {
            const ms = Date.parse(date);

            if (isNaN(ms)) return Infinity;
            return (new Date() - ms) / oneDay;
        } catch (e) {
            return Infinity;
        }
    }
    return Infinity;
};

export { daysSince };
