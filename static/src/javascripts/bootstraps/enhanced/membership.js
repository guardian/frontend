// @flow
import { membershipTab } from 'membership/membership-tab';
import { digitalpackTab } from 'membership/digitalpack-tab';
import { recurringContributionTab } from 'membership/contributions-recurring-tab';

export const init = (): void => {
    membershipTab();
    digitalpackTab();
    recurringContributionTab();
};
