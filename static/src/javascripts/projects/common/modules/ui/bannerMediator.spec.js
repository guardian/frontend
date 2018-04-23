// @flow
import { init, _ } from 'common/modules/ui/bannerMediator';

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
        }, 199);
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
    ];

    const createBanner = check => ({ check, show: jest.fn() });

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
