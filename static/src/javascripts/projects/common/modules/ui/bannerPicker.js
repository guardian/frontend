// @flow
import ophan from 'ophan/ng';

export type Banner = {
    id: string,
    canShow: () => Promise<boolean>,
    show: () => Promise<boolean>,
};

const init = (banners: Array<Banner>): Promise<void> => {
    const results: Array<'pending' | boolean> = new Array(banners.length).fill(
        'pending',
        0
    );

    const getSuccessfulBannerIndex = (): number => {
        const firstCheckPassedIndex = results.findIndex(item => item === true);

        // if no check has passed firstCheckPassedIndex equals -1
        // if first check has passed firstCheckPassedIndex equals 0
        if (firstCheckPassedIndex <= 0) {
            return firstCheckPassedIndex;
        }

        // if firstCheckPassedIndex greater than 0 then get higher priority checks from array that are pending
        const pendingHigherPriorityCheckIndex = results
            .slice(0, firstCheckPassedIndex)
            .findIndex(item => item === 'pending');

        // if there are no higher priority checks pending return firstCheckPassedIndex
        if (pendingHigherPriorityCheckIndex === -1) {
            return firstCheckPassedIndex;
        }

        return -1;
    };

    return new Promise(resolve => {
        const TIME_LIMIT = 2000;
        let bannerPicked = false;

        banners.forEach((banner, index) => {
            const pushToResults = (result: boolean): void => {
                results[index] = result;

                const successfulBannerIndex = getSuccessfulBannerIndex();

                if (!bannerPicked && successfulBannerIndex !== -1) {
                    const successfulBanner = banners[successfulBannerIndex];
                    successfulBanner.show();

                    bannerPicked = true;

                    const trackingObj = {
                        component: 'banner-picker',
                        value: successfulBanner.id,
                    };

                    ophan.record(trackingObj);
                }

                if (!results.includes('pending')) {
                    resolve();
                }
            };

            let hasTimedOut = false;

            // checks that take longer than TIME_LIMIT are forced to fail
            const timeout = setTimeout(() => {
                hasTimedOut = true;

                pushToResults(false);

                const trackingObj = {
                    component: 'banner-picker-timeout',
                    value: banner.id,
                };

                ophan.record(trackingObj);
            }, TIME_LIMIT);

            banner.canShow().then(result => {
                if (!hasTimedOut) {
                    clearTimeout(timeout);
                    pushToResults(result);
                }
            });
        });
    });
};

export { init };
