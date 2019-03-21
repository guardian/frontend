// @flow
import config from 'lib/config';
import { getSync } from 'lib/geolocation';
import flattenDeep from 'lodash/flattenDeep';

/**
 * A set of front URLs associated with a given region
 * that the engagement banner won't show up against
 * if the appropriate block switch is turned on.
 */
type RegionalFrontURLs = Array<string>;

/**
 * Blocking incorporates URLs and the user's geolocation
 */
type BlockConfig = {
    urls: RegionalFrontURLs,
    geolocation: string,
};

/**
 * Associate switch names with blocking configurations
 */
type SwitchBlockConfig = {
    [switchName: string]: BlockConfig,
};

const defaultSwitchConfig: SwitchBlockConfig = {
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

const allSwitches: Array<string> = ['Uk', 'Us', 'Au'].map(
    region => `membershipEngagementBannerBlock${region}`
);

export const isBlocked = (
    switches: Array<string> = allSwitches,
    switchBlockConfig: SwitchBlockConfig = defaultSwitchConfig,
    pathname: string = document.location.pathname,
    geolocation: string = getSync()
): boolean => {
    // the enabled block configurations that apply to the provided geolocation
    const activeBlockConfigs: Array<BlockConfig> = switches
        .filter(switchName => !!config.get(`switches.${switchName}`))
        .map(switchName => switchBlockConfig[switchName])
        .filter(conf => conf.geolocation === geolocation);

    const blockedUrls: Array<string> = flattenDeep(
        activeBlockConfigs.map(conf => conf.urls)
    );

    return blockedUrls.includes(pathname);
};
