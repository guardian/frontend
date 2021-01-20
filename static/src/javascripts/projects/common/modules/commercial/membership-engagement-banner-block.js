import config from 'lib/config';
import { getSync } from 'lib/geolocation';
import flattenDeep from 'lodash/flattenDeep';

/**
 * A set of front URLs associated with a given region
 * that the engagement banner won't show up against
 * if the appropriate block switch is turned on.
 */

/**
 * Blocking incorporates URLs and the user's geolocation
 */

/**
 * Associate switch names with blocking configurations
 */

const defaultSwitchConfig = {
    membershipEngagementBannerBlockUk: {
        urls: ['/uk', '/uk-news'],
        geolocation: 'GB',
    },

    membershipEngagementBannerBlockUs: {
        urls: ['/us', '/us-news'],
        geolocation: 'US',
    },

    membershipEngagementBannerBlockAu: {
        urls: ['/au', '/australia-news'],
        geolocation: 'AU',
    },
};

const allSwitches = ['Uk', 'Us', 'Au'].map(
    region => `membershipEngagementBannerBlock${region}`
);

export const isBlocked = (
    switches = allSwitches,
    switchBlockConfig = defaultSwitchConfig,
    pathname = document.location.pathname,
    geolocation = getSync()
) => {
    // the enabled block configurations that apply to the provided geolocation
    const activeBlockConfigs = switches
        .filter(switchName => !!config.get(`switches.${switchName}`))
        .map(switchName => switchBlockConfig[switchName])
        .filter(conf => conf.geolocation === geolocation);

    const blockedUrls = flattenDeep(
        activeBlockConfigs.map(conf => conf.urls)
    );

    return blockedUrls.includes(pathname);
};
