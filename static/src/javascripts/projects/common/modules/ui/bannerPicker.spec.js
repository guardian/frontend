// @flow
import { init, _ } from 'common/modules/ui/bannerPicker';

const shortTrueCheck = () =>
    new Promise(resolve => {
        setTimeout(() => {
            resolve(true);
        }, 200);
    });
const shortFalseCheck = () =>
    new Promise(resolve => {
        setTimeout(() => {
            resolve(false);
        }, 200);
    });
const longFalseCheck = () =>
    new Promise(resolve => {
        setTimeout(() => {
            resolve(false);
        }, 2000);
    });
const longTrueCheck = () =>
    new Promise(resolve => {
        setTimeout(() => {
            resolve(true);
        }, 2000);
    });
const extraLongTrueCheck = () =>
    new Promise(resolve => {
        setTimeout(() => {
            resolve(true);
        }, 3000);
    });
const extraLongFalseCheck = () =>
    new Promise(resolve => {
        setTimeout(() => {
            resolve(false);
        }, 3000);
    });

describe('bannerMediator picks correct banner to show', () => {
    const tests = [
        {
            checks: [shortTrueCheck],
            successfulIndex: 0,
        },
        {
            checks: [shortFalseCheck, shortTrueCheck],
            successfulIndex: 1,
        },
        {
            checks: [longFalseCheck, shortTrueCheck],
            successfulIndex: 1,
        },
        {
            checks: [longTrueCheck, shortTrueCheck],
            successfulIndex: 0,
        },
        {
            checks: [
                longFalseCheck,
                shortFalseCheck,
                longTrueCheck,
                shortTrueCheck,
            ],
            successfulIndex: 2,
        },
        {
            checks: [extraLongTrueCheck, shortTrueCheck],
            successfulIndex: 1,
        },
        {
            checks: [extraLongTrueCheck, longFalseCheck, shortTrueCheck],
            successfulIndex: 2,
        },
        {
            checks: [
                extraLongFalseCheck,
                longTrueCheck,
                shortTrueCheck,
                extraLongTrueCheck,
            ],
            successfulIndex: 1,
        },
    ];

    const createBanner = canShow => ({ canShow, show: jest.fn() });

    tests.forEach(test => {
        it(`calls show() for banner at index ${test.successfulIndex}`, () => {
            const bannerList = test.checks.map(createBanner);

            _.resetChecks(bannerList);

            return init().then(() => {
                bannerList.forEach((check, index) => {
                    if (index === test.successfulIndex) {
                        expect(bannerList[index].show).toHaveBeenCalled();
                    } else {
                        expect(bannerList[index].show).not.toHaveBeenCalled();
                    }
                });
            });
        });
    });
});
