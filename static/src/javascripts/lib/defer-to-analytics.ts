const deferToAnalytics = (afterAnalytics: () => void): void => {
    afterAnalytics();
};

export default deferToAnalytics;
