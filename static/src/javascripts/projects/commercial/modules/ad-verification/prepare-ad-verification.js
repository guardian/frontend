// @flow strict
import config from 'lib/config';
import { loadScript } from 'lib/load-script';

const errorHandler = (error: Error) => {
    // Looks like some plugins block ad-verification
    // Avoid barraging Sentry with errors from these pageviews
    console.log('Failed to load Confiant:', error);
};

interface impressionsDfpObject {
    s: string;  // Slot element ID
    ad: string; // Advertiser ID
    c: string;  // Creative ID
    I: string;  // Line item ID
    o: string;  // Order ID
    A: string;  // Ad unit name
    y: string;  // Yield group ID (Exchange Bidder)
}

const confiantRefreshedSlots =[];

const refreshBlockedSlotOnce = (
    blockingType: number,
    blockingId: string,
    isBlocked: boolean,
    wrapperId: string,
    tagId: string,
    impressionsData: {
        preBid: { adId?: string, cpm?: number },
        dfp: impressionsDfpObject,
    }
): Promise<void> => {
    console.log('*** Already refreshed slots: ', confiantRefreshedSlots);
    console.log('*** Callback run for slot ', impressionsData.dfp.s);
    const blockedSlotPath =
        typeof impressionsData !== 'undefined' &&
        typeof impressionsData.dfp !== 'undefined'
            ? impressionsData.dfp.s
            : null;
    console.log("*** Has slot already been refreshed? ", confiantRefreshedSlots.includes(blockedSlotPath))
    // check if ad is blocked and haven't refreshed the slot yet.
    if (isBlocked && !confiantRefreshedSlots.includes(blockedSlotPath) ) {
        console.log('*** Ad slot blocked');
        const slots = window.googletag.pubads().getSlots();
        slots.forEach((currentSlot) => {
            if (blockedSlotPath === currentSlot.getSlotElementId()) {
                console.log('*** Refreshing blocked ad slot ', currentSlot);
                // refresh the blocked slot to get new ad
                window.googletag.pubads().refresh([currentSlot]);
                // mark it as refreshed so it won't refresh multiple time
                confiantRefreshedSlots.push(blockedSlotPath);
            }
        })
    }
    return Promise.resolve();
};

export const init = (): Promise<void> => {
    const host = 'confiant-integrations.global.ssl.fastly.net';
    if (config.get('switches.confiantAdVerification')) {
        return loadScript(
            `//${host}/7oDgiTsq88US4rrBG0_Nxpafkrg/gpt_and_prebid/config.js`,
            { async: true }
        )
            .then(() => {
                window.confiant.settings.devMode= true; // This blocks ads on page
                window.confiant.settings.callback = refreshBlockedSlotOnce;
            })
            .catch(errorHandler);
    }

    return Promise.resolve();
};
