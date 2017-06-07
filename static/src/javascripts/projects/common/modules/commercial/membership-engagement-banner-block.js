// @flow
import config from 'lib/config';
import flatten from 'lodash/arrays/flatten';

/**
 * A set of front URLs associated with a given region
 * that the engagement banner won't show up against
 * if the appropriate block switch is turned on.
 */
type RegionalFrontURLs = Array<string>;

/**
 * Associate switch names with sets of URLs to block
 */
type SwitchURLMap = { [switchName: string]: RegionalFrontURLs };

const UK: RegionalFrontURLs = ['/uk', '/uk-news'];
const US: RegionalFrontURLs = ['/us', '/us-news'];
const AU: RegionalFrontURLs = ['/au', '/australia-news'];

const defaultSwitchUrls: SwitchURLMap = {
    membershipEngagementBannerBlockUk: UK,
    membershipEngagementBannerBlockUs: US,
    membershipEngagementBannerBlockAu: AU,
};

const allSwitches: Array<string> = ['Uk', 'Us', 'Au'].map(
    region => `membershipEngagementBannerBlock${region}`
);

export const isBlocked = (
    switches: Array<string> = allSwitches,
    switchUrls: SwitchURLMap = defaultSwitchUrls,
    pathname: string = document.location.pathname
): boolean => {
    const blockedUrls: Array<string> = flatten(
        switches.filter(s => !!config.switches[s]).map(s => switchUrls[s])
    );

    return blockedUrls.includes(pathname);
};
