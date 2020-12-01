import { init } from 'common/modules/ui/bannerPicker';
import userPrefs_ from 'common/modules/user-prefs';
import fakeOphan from 'ophan/ng';

jest.useFakeTimers();

jest.mock('ophan/ng', () => ({
    record: jest.fn(),
}));

jest.mock('common/modules/user-prefs', () => ({
    get: jest.fn().mockReturnValue([]),
}));

const userPrefs: any = userPrefs_;

beforeEach(() => {
    userPrefs.get.mockClear();
    fakeOphan.record.mockClear();
});

describe('bannerPicker', () => {
    describe('bannerPicker picks correct banner to show', () => {
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

        tests.forEach((test) => {
            it(test.description, () => {
                const resolveList = [];

                const newCheck = () => () =>
                    new Promise((resolve) => {
                        resolveList.push(resolve);
                    });

                const createBanner = (result) => ({
                    id: `banner-${result.bannerIndex}`,
                    canShow: newCheck(),
                    show: jest.fn(),
                });

                // create a list to be populated with banners
                const banners = new Array(test.resultsSeq.length);

                // create a banner for each result and add to banners list
                test.resultsSeq.forEach((result) => {
                    banners[result.bannerIndex] = createBanner(result);
                });

                // pass banners to bannerPicker
                const asyncTest = init(banners);

                // resolve each banners check in the order specified by the result sequence
                test.resultsSeq.forEach((result) => {
                    resolveList[result.bannerIndex](result.value);
                });

                // test whether the banner canShow function has been called
                return asyncTest.then(() => {
                    const trackingObj = {
                        component: 'banner-picker',
                        value: `banner-${test.successfulIndex}`,
                    };
                    expect(fakeOphan.record).toHaveBeenCalledWith(trackingObj);
                    banners.forEach((banner, index) => {
                        if (index === test.successfulIndex) {
                            expect(banner.show).toHaveBeenCalledTimes(1);
                            expect(banner.show).toHaveBeenCalled();
                        } else {
                            expect(banner.show).not.toHaveBeenCalled();
                        }
                    });
                });
            });
        });
    });

    describe('bannerPicker picks correct banner to show when check timesout', () => {
        it('should call show() for banner at index 1 if index 0 timesout', () => {
            const resolveList = [];

            /**
             * this will be assigned the resolve function of
             * onCheckResolved.
             * */
            let triggerTimeout;

            /**
             * the promise returned by onCheckResolved.
             * will resolve when triggerTimeout has been called
             * */
            const onCheckResolved = () =>
                new Promise((resolve) => {
                    triggerTimeout = resolve;
                });

            /**
             * wait for onCheckResolved to resolve then execute all pending timers
             * to force a timeout on the banners[0]
             * */
            onCheckResolved().then(() => {
                jest.runOnlyPendingTimers();
            });

            const newCheck = () => () =>
                new Promise((resolve) => {
                    resolveList.push((result) => {
                        resolve(result);

                        /**
                         * we've just resolved the check for banners[1] call
                         * triggerTimeout to resolve onCheckResolved
                         * and trigger a timeout on banners[0]
                         * */
                        triggerTimeout();
                    });
                });

            const banners = [
                {
                    id: 'banner-0',
                    canShow: newCheck(),
                    show: jest.fn(),
                },
                {
                    id: 'banner-1',
                    canShow: newCheck(),
                    show: jest.fn(),
                },
            ];

            const asyncTest = init(banners);

            // resolve banner[1] check
            resolveList[1](true);

            return asyncTest.then(() => {
                const successTrackingObj = {
                    component: 'banner-picker',
                    value: `banner-1`,
                };

                const timeoutTrackingObj = {
                    component: 'banner-picker-timeout',
                    value: `banner-0`,
                };

                expect(fakeOphan.record).toHaveBeenCalledTimes(2);
                expect(fakeOphan.record).toHaveBeenCalledWith(
                    successTrackingObj
                );
                expect(fakeOphan.record).toHaveBeenCalledWith(
                    timeoutTrackingObj
                );
                expect(banners[0].show).not.toHaveBeenCalled();
                expect(banners[1].show).toHaveBeenCalled();
            });
        });
    });
});
