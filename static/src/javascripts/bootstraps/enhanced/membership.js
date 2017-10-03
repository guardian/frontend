// @flow
import membershipTab from 'membership/membership-tab';
import { init as digitalpackTab } from 'membership/digitalpack-tab';

export const init = (): void => {
    membershipTab.init();
    digitalpackTab();
};
