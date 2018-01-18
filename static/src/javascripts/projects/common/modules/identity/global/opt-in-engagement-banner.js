// @flow

import { getUserFromApi } from 'common/modules/identity/api';
import { Message } from 'common/modules/ui/message';

const messageCode = 'optin-campaign-jan-18';

export const optInEngagementBannerInit = (): void => {
    getUserFromApi(user => {
        console.log(user);
        if(!user.statusFields.hasRepermissioned) {
            new Message(messageCode).show('You have to update your email settings. Visit My Account to do this')
        }
    });
}
