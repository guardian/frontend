// @flow

import { getUserFromApi } from 'common/modules/identity/api';
import { Message } from 'common/modules/ui/message';

const messageCode: string = 'optin-campaign-jan-18';
const medium: string = new URL(window.location.href).searchParams.get(
    'utm_medium'
);

type ApiUser = {
    statusFields: {
        hasRepermissioned: Boolean,
    },
};

const shouldDisplayOptInBanner = (): Promise<void> =>
    new Promise((accept, reject) => {
        if (medium === null || medium.toLowerCase() !== 'email')
            return reject();
        getUserFromApi((user: ApiUser) => {
            if (user === null || !user.statusFields.hasRepermissioned) accept();
            else reject();
        });
    });

export const optInEngagementBannerInit = (): void => {
    shouldDisplayOptInBanner().then(() => {
        new Message(messageCode).show(
            'You have to update your email settings. Visit My Account to do this'
        );
    });
};
