// @flow
import ophan from 'ophan/ng';
import userPrefs from 'common/modules/user-prefs';

export type Banner = {
    id: string,
    canShow: () => Promise<boolean>,
    show: () => void,
};

const init = (bannerSets: Array<Array<Banner>>): Promise<void> => {
    const results: Array<'pending' | boolean> = new Array(
        bannerSets.length
    ).fill('pending', 0);

    const getSuccessfulBannerSetIndex = (): number => {
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
        const messageStates = userPrefs.get('messages');
        let bannerSetPicked = false;

        bannerSets.forEach((bannerSet, index) => {
            const pushToResults = (result: boolean): void => {
                results[index] = result;

                const successfulBannerSetIndex = getSuccessfulBannerSetIndex();

                if (!bannerSetPicked && successfulBannerSetIndex !== -1) {
                    const successfulBannerSet =
                        bannerSets[successfulBannerSetIndex];
                    successfulBannerSet.forEach(banner => banner.show());

                    bannerSetPicked = true;

                    const trackingObj = {
                        component: 'banner-picker',
                        value: successfulBannerSet
                            .map(banner => banner.id)
                            .join('|'),
                    };

                    ophan.record(trackingObj);
                }

                if (!results.includes('pending')) {
                    resolve();
                }
            };

            const hasUserAcknowledgedAnyBannerInSet = (): boolean =>
                messageStates &&
                bannerSet.some(banner => messageStates.includes(banner.id));

            /**
             * if the banner has been seen and dismissed
             * we don't want to show it. Previously this rule was
             * enforced in the show() of Message.js
             * */
            if (hasUserAcknowledgedAnyBannerInSet()) {
                pushToResults(false);
            } else {
                let hasTimedOut = false;

                // checks that take longer than TIME_LIMIT are forced to fail
                const timeout = setTimeout(() => {
                    hasTimedOut = true;

                    pushToResults(false);

                    const trackingObj = {
                        component: 'banner-picker-timeout',
                        value: bannerSet.map(banner => banner.id).join('|'),
                    };

                    ophan.record(trackingObj);
                }, TIME_LIMIT);

                Promise.all(bannerSet.map(banner => banner.canShow())).then(
                    canShowArray => {
                        if (!hasTimedOut) {
                            clearTimeout(timeout);
                            pushToResults(
                                canShowArray.every(canShow => canShow)
                            );
                        }
                    }
                );
            }
        });
    });
};

export { init };
