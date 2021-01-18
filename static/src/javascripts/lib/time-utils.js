// from and to should be Epoch time in milliseconds
const dateDiffDays = (from, to) => {
    const oneDayMs = 1000 * 60 * 60 * 24;
    const diffMs = to - from;
    return Math.floor(diffMs / oneDayMs);
};

const isExpired = (testExpiry) => {
    // new Date(test.expiry) sets the expiry time to 00:00:00
    // Using SetHours allows a test to run until the END of the expiry day
    const startOfToday = new Date().setHours(0, 0, 0, 0);
    return startOfToday > new Date(testExpiry);
};

export { dateDiffDays, isExpired };
