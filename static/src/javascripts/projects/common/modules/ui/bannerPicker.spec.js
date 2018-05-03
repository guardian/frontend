// @flow
import { init } from 'common/modules/ui/bannerPicker';

describe('bannerMediator picks correct banner to show', () => {
    // resultsSeq is the order banner's checks will resolve in the test
    const tests = [
        {
            description:
                'should call show() for successful bannerIndex 0 when no other checks in list',
            resultsSeq: [
                {
                    bannerIndex: 0,
                    value: true,
                },
            ],
            successfulIndex: 0,
        },
        {
            description:
                'should call show() for successful bannerIndex 1 when bannerIndex 0 fails',
            resultsSeq: [
                {
                    bannerIndex: 0,
                    value: false,
                },
                {
                    bannerIndex: 1,
                    value: true,
                },
            ],
            successfulIndex: 1,
        },
        {
            description:
                'should call show() for successful bannerIndex 0 even if bannerIndex 1 passes',
            resultsSeq: [
                {
                    bannerIndex: 0,
                    value: true,
                },
                {
                    bannerIndex: 1,
                    value: true,
                },
            ],
            successfulIndex: 0,
        },
        {
            description:
                'should call show() for successful bannerIndex 1 when bannerIndex 1 fails',
            resultsSeq: [
                {
                    bannerIndex: 0,
                    value: false,
                },
                {
                    bannerIndex: 1,
                    value: true,
                },
            ],
            successfulIndex: 1,
        },
        {
            description:
                'should call show() for successful bannerIndex 0 even if bannerIndex 1 passes first',
            resultsSeq: [
                {
                    bannerIndex: 1,
                    value: true,
                },
                {
                    bannerIndex: 0,
                    value: true,
                },
            ],
            successfulIndex: 0,
        },
        {
            description:
                'should call show() for successful bannerIndex 2 when higher priority bannerIndexes 0 & 1 fail',
            resultsSeq: [
                {
                    bannerIndex: 1,
                    value: false,
                },
                {
                    bannerIndex: 3,
                    value: true,
                },
                {
                    bannerIndex: 2,
                    value: true,
                },
                {
                    bannerIndex: 0,
                    value: false,
                },
            ],
            successfulIndex: 2,
        },
    ];

    tests.forEach(test => {
        it(test.description, () => {
            const resolveList = [];

            const newCheck = () => () =>
                new Promise(resolve => {
                    resolveList.push(resolve);
                });

            const createBanner = result => ({
                index: result.bannerIndex,
                canShow: newCheck(),
                show: jest.fn(),
            });

            // create a list to be populated with banners
            const banners = new Array(test.resultsSeq.length);

            // create a banner for each result and add to bannerList
            test.resultsSeq.forEach(result => {
                banners[result.bannerIndex] = createBanner(result);
            });

            // pass banners to bannerPicker
            const asyncTest = init(banners);

            // resolve each banners check in the order specified by the result sequence
            test.resultsSeq.forEach(result => {
                resolveList[result.bannerIndex](result.value);
            });

            // test whether the banner canShow function has been called
            return asyncTest.then(() => {
                banners.forEach((banner, index) => {
                    if (index === test.successfulIndex) {
                        expect(banner.show).toHaveBeenCalled();
                    } else {
                        expect(banner.show).not.toHaveBeenCalled();
                    }
                });
            });
        });
    });
});

describe('bannerMediator picks correct banner to show when check timesout', () => {
    it('should call show() for banner at index 1 if index 0 timesout', () => {
        const resolveList = [];

        const newCheck = () => () =>
            new Promise(resolve => {
                resolveList.push(resolve);
            });

        const banners = [
            {
                canShow: newCheck(),
                show: jest.fn(),
            },
            {
                canShow: newCheck(),
                show: jest.fn(),
            },
        ];

        const asyncTest = init(banners);

        /**
         * after resolving the canShow check for bannerIndex 1
         * call jest.runOnlyPendingTimers, this will execute the timeout
         * on bannerIndex 0, in affect simulating bannerIndex 0's canShow
         * taking too long to resolve
         * */
        banners[1].canShow().then(() => {
            jest.runOnlyPendingTimers();
        });

        // resolve bannerIndex 1 canshow check
        resolveList[1](true);

        return asyncTest.then(() => {
            banners.forEach((banner, index) => {
                if (index === 1) {
                    expect(banner.show).toHaveBeenCalled();
                } else {
                    expect(banner.show).not.toHaveBeenCalled();
                }
            });
        });
    });
});
