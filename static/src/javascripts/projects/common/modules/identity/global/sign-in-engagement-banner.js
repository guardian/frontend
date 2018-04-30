// @flow

import { Message } from 'common/modules/ui/message';
import { getCookie, addCookie } from 'lib/cookies';
import config from 'lib/config';
import mediator from 'lib/mediator';
import { local } from 'lib/storage';
import ophan from 'ophan/ng';
import userPrefs from 'common/modules/user-prefs';

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

const html = `
                <div id="site-message__message" class="site-message--sign-in-container">
                    <section class="site-message__message site-message--sign-in">
                        <div class="site-message--sign-in__header">
                            <h2>Sign in to The Guardian to continue</h2>
                        </div>
                        <div class="site-message--sign-in__body">
                            <p>Enjoy the following exclusive features:</p>
                            <ul>
                                <li>A more personalised Guardian</li>
                                <li>Comment on the crosswords</li>
                                <li>Get our award-winning newsletters</li>
                            </ul> 
                        </div>
                    </section>
                </div>
            `;

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
                cssModifierClass: 'sign-in',
                trackDisplay: true,
                permanent: true,
                blocking: true,
                siteMessageComponentName: messageCode,
                customJs: () => {},
            });
            msg.show(html);
        })
        .catch(err => {
            if (err.message !== ERR_EXPECTED_NO_BANNER) throw err;
        });
};

export { signInEngagementBannerInit };
