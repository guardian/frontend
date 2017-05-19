// @flow
import membershipTab from 'membership/membership-tab';
import digitalpackTab from 'membership/digitalpack-tab';

export const init = (): void => {
    membershipTab.init();
    digitalpackTab.init();
};
