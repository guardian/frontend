// @flow

const daysSince = (date: String): number => {
    const oneDay = 24 * 60 * 60 * 1000;

    try {
        const ms = Date.parse(date);

        if (isNaN(ms)) return Infinity;
        return (new Date() - ms) / oneDay;
    } catch (e) {
        return Infinity;
    }
};

export { daysSince };
