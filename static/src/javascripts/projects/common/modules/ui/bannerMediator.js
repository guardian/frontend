// @flow
import breakingNewsBanner from 'common/modules/ui/banners/breakingNews';

type Banner = {
    canShow: () => Promise<boolean>,
    show: () => void,
};

let banners: Array<Banner> = [breakingNewsBanner];

let results: Array<'pending' | boolean> = new Array(banners.length).fill(
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

const init = (): Promise<void> =>
    new Promise(resolve => {
        banners.forEach((banner, index) => {
            const pushToResults = (result: boolean): void => {
                results[index] = result;

                const successfulBannerIndex = getSuccessfulBannerIndex();

                if (successfulBannerIndex !== -1) {
                    banners[successfulBannerIndex].show();
                }

                if (!results.includes('pending')) {
                    resolve();
                }
            };

            let hasTimedOut = false;

            // checks that take longer than 2500ms are forced to fail
            const timeout = setTimeout(() => {
                hasTimedOut = true;
                pushToResults(false);
            }, 2500);

            banner.canShow().then(result => {
                if (!hasTimedOut) {
                    clearTimeout(timeout);
                    pushToResults(result);
                }
            });
        });
    });

// used for testing purposes
const resetChecks = (bannerList: Array<Banner>): void => {
    banners = bannerList;
    results = new Array(banners.length).fill('pending', 0);
};

export { init };

export const _ = {
    resetChecks,
};
