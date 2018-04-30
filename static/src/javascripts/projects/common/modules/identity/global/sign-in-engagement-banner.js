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

type Feature = {
    id: string,
    mainCopy: string,
    subCopy: string
};

type Template = {
    headerMain: string[],
    headerSub: string[],
    signInCta: string,
    registerCta: string,
    advantagesCta: string,
    closeButton: string,
    features: Feature[]
};

const tpl: Template = {
    headerMain: ['Enjoy even','more from','The Guardian'],
    headerSub: ['Please sign in or register to manage your preferences'],
}

const wrapLineBreakingString = (text: string[], className: string): string =>
    text.map((line,index) =>
        `<span class="${className}">${line}${index===text.length?'':' '}</span><wbr>
    `).join('');

const html = `
                <div id="site-message__message" class="site-message--sign-in-container">
                    <section class="site-message__message site-message__message--sign-in">
                        <div class="site-message--sign-in__header">
                            <h2 class="site-message--sign-in__header-msg site-message--sign-in__header-msg--main">${wrapLineBreakingString(tpl.headerMain,'site-message--sign-in__header-msg-line')}</h2>
                            <br/>
                            <p class="site-message--sign-in__header-msg site-message--sign-in__header-msg--sub">${wrapLineBreakingString(tpl.headerSub,'site-message--sign-in__header-msg-line')}</p>
                        </div>
                        <div class="site-message--sign-in__body">
                            <ul>
                                <li>A more personalised Guardian</li>
                                <li>Comment on the crosswords</li>
                                <li>Get our award-winning newsletters</li>
                            </ul> 
                        </div>
                        <div class="site-message--sign-in__buttons">
                            <a href="#" class="site-message--sign-in-cta site-message--sign-in-cta--main">
                                Sign in
                            </a>
                            <a href="#" class="site-message--sign-in-cta site-message--sign-in-cta--secondary">
                                Register
                            </a>
                        </div>
                        <a href="#" class="site-message--sign-in__why">
                            Why sign in to The Guardian?
                        </a>
                        <button class="site-message--sign-in__dismiss">Close this</button>
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
                cssModifierClass: 'sign-in-message',
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
