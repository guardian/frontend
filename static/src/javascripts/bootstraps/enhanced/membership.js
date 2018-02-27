// @flow
import { membershipTab } from 'membership/membership-tab';
import { digitalpackTab } from 'membership/digitalpack-tab';
import { recurringContributionTab } from 'membership/contributions-recurring-tab';
import { deleteOldData } from 'common/modules/commercial/user-features';

export const init = (): void => {
    deleteOldData();
    membershipTab();
    digitalpackTab();
    recurringContributionTab();
};
