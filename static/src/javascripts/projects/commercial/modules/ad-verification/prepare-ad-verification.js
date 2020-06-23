// @flow strict
import config from 'lib/config';
import { loadScript } from 'lib/load-script';
import { refreshAdvert } from 'commercial/modules/dfp/load-advert';
import { getAdvertById } from 'commercial/modules/dfp/get-advert-by-id';

const errorHandler = (error: Error) => {
    // Looks like some plugins block ad-verification
    // Avoid barraging Sentry with errors from these pageviews
    console.log('Failed to load Confiant:', error);
};

interface impressionsDfpObject {
    s: string; // Slot element ID
    ad: string; // Advertiser ID
    c: string; // Creative ID
    I: string; // Line item ID
    o: string; // Order ID
    A: string; // Ad unit name
    y: string; // Yield group ID (Exchange Bidder)
}

const confiantRefreshedSlots = [];

const refreshBlockedSlotOnce = (
    blockingType: number,
    blockingId: string,
    isBlocked: boolean,
    wrapperId: string,
    tagId: string,
    impressionsData: {
        prebid?: { adId?: string, cpm?: number, s: string },
        dfp?: impressionsDfpObject,
    }
): Promise<void> => {
    const prebidSlotElementId =
        typeof impressionsData !== 'undefined' &&
        typeof impressionsData.prebid !== 'undefined'
            ? impressionsData.prebid.s
            : '';
    const dfpSlotElementId =
        typeof impressionsData !== 'undefined' &&
        typeof impressionsData.dfp !== 'undefined'
            ? impressionsData.dfp.s
            : '';
    const blockedSlotPath: string =
        prebidSlotElementId !== '' ? prebidSlotElementId : dfpSlotElementId;
    const blockedSlotPathExists = !!blockedSlotPath;
    // check if ad is blocked and haven't refreshed the slot yet.
    if (
        isBlocked &&
        blockedSlotPathExists &&
        !confiantRefreshedSlots.includes(blockedSlotPath)
    ) {
        const slots = window.googletag.pubads().getSlots();
        slots.forEach(currentSlot => {
            if (blockedSlotPath === currentSlot.getSlotElementId()) {
                // refresh the blocked slot to get new ad
                const advert = getAdvertById(blockedSlotPath);
                if (advert) refreshAdvert(advert);
                // mark it as refreshed so it won't refresh multiple time
                confiantRefreshedSlots.push(blockedSlotPath);
            }
        });
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
                window.confiant.settings.callback = refreshBlockedSlotOnce;
            })
            .catch(errorHandler);
    }

    return Promise.resolve();
};
