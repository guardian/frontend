// @flow

import { Message } from 'common/modules/ui/message';
import { getCookie, addCookie } from 'lib/cookies';
import config from 'lib/config';
import mediator from 'lib/mediator';
import { local } from 'lib/storage';
import ophan from 'ophan/ng';
import userPrefs from 'common/modules/user-prefs';
import type { Feature, Template } from './sign-in-eb-template';
import { makeTemplateHtml } from './sign-in-eb-template';

const messageCode: string = 'sign-in-30-april';
const signInCookie: string = 'GU_U';

const ERR_EXPECTED_NO_BANNER = 'ERR_EXPECTED_NO_BANNER';

const getDisplayConditions = (): boolean[] =>
    [
        true
    ];

const shouldDisplayBanner = (): Promise<boolean> =>
    Promise.resolve(
        getDisplayConditions().every(_ => _ === true)
    )

const waitForBannersOrTimeout = (): Promise<void> =>
    new Promise((show, reject) => {
        mediator.on('modules:onwards:breaking-news:ready', breakingShown => {
            if (!breakingShown) {
                show();
            } else {
                reject(new Error(ERR_EXPECTED_NO_BANNER));
            }
        });
        mediator.on('membership-message:display', () => {
            reject(new Error(ERR_EXPECTED_NO_BANNER));
        });
        setTimeout(() => {
            show();
        }, 1000);
    });

const tpl: Template = {
    headerMain: ['Enjoy even','more from','The Guardian'],
    headerSub: ['Please sign in or register to manage your preferences'],
    features: [
        {
            id: 'consistent',
            mainCopy: 'A consistent experience',
            subCopy: 'across all of your devices',
        },
        {
            id: 'comment',
            mainCopy: 'Join the conversation',
            subCopy: 'and comment on articles',
        },
        {
            id: 'email',
            mainCopy: 'Get closer to the journalism',
            subCopy: 'by subscribing to editorial emails',
        },
    ]
}


const signInEngagementBannerInit = (): void => {

    shouldDisplayBanner()
        .then((shouldIt: boolean) => {
            if (shouldIt) {
                return waitForBannersOrTimeout();
            }
            throw new Error(ERR_EXPECTED_NO_BANNER);
        })
        .then(() => {
            const msg = new Message(messageCode, {
                cssModifierClass: 'sign-in-message',
                trackDisplay: true,
                permanent: true,
                blocking: true,
                siteMessageComponentName: messageCode,
                customJs: () => {},
            });
            msg.show(makeTemplateHtml(tpl));
        })
        .catch(err => {
            if (err.message !== ERR_EXPECTED_NO_BANNER) throw err;
        });
};

export { signInEngagementBannerInit };
