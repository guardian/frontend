// @flow

const getDaysLeftInCampaign = (endDate: number): number => {
    const currentDate: number = new Date().getTime();
    const timeLeft: number = endDate - currentDate;

    return Math.floor(timeLeft / (1000 * 60 * 60 * 24));
};

export const getDaysLeftBeforeEOY2019 = (): number =>
    getDaysLeftInCampaign(new Date('Dec 31, 2019 23:59:59').getTime());

export const daysLeftCopy = (daysLeft: number): string => {
    switch (daysLeft) {
        case 0:
            return `It's the last day to contribute in 2019`;
        case 1:
            return '1 day left to contribute in 2019';
        default:
            return `${daysLeft} days left to contribute in 2019`;
    }
};
