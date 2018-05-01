// @flow

import { Message } from 'common/modules/ui/message';
import { getCookie } from 'lib/cookies';
import { local } from 'lib/storage';
import config from 'lib/config';
import mediator from 'lib/mediator';
import type {
    Template,
    LinkTargets,
    Feature,
} from './sign-in-engagement-banner/template';
import {
    makeTemplateHtml,
    bindableClassNames,
} from './sign-in-engagement-banner/template';
import iconComment from './sign-in-engagement-banner/icon-comment.svg';
import iconEmail from './sign-in-engagement-banner/icon-email.svg';
import iconPhone from './sign-in-engagement-banner/icon-phone.svg';

const messageCode: string = 'sign-in-30-april';
const signedInCookie: string = 'GU_U';

const ERR_EXPECTED_NO_BANNER = 'ERR_EXPECTED_NO_BANNER';
const ERR_MALFORMED_HTML = 'ERR_MALFORMED_HTML';

const dayInMs = 24 * 60 * 60 * 1000;
const monthInMs = 30 * dayInMs;

const links: LinkTargets = {
    signIn: `${config.get(
        'page.idUrl'
    )}/signin?cmp=sign-in-eb&utm_campaign=sign-in-eb`,
    register: `${config.get(
        'page.idUrl'
    )}/register?cmp=sign-in-eb&utm_campaign=sign-in-eb`,
};

const features: Feature[] = [
    {
        icon: iconPhone.markup,
        mainCopy: 'A consistent experience',
        subCopy: 'across all of your devices',
    },
    {
        icon: iconComment.markup,
        mainCopy: 'Join the conversation',
        subCopy: 'and comment on articles',
    },
    {
        icon: iconEmail.markup,
        mainCopy: 'Get closer to the journalism',
        subCopy: 'by subscribing to editorial emails',
    },
];

const tpl: Template = {
    headerMain: ['Enjoy even', 'more from', 'The Guardian'],
    headerSub: ['Please sign in or register to manage your preferences'],
    signInCta: 'Sign in',
    registerCta: 'Register',
    advantagesCta: 'Why sign in to The Guardian?',
    closeButton: 'Continue without signing in',
    features,
    links,
};

/* Must have visited 4 articles */
const hasReadOver4Articles = (): boolean =>
    (local.get('gu.alreadyVisited') || 0) >= 4;

/* Must be not already signed in */
const isNotSignedIn = (): boolean => getCookie(signedInCookie) === null;

/* Must have visited between 1 month & 24 hours ago */
const isRecurringVisitor = (): boolean => {
    const ga: ?string = getCookie('_ga');
    if (!ga) return false;
    const date: number = parseInt(ga.split('.').pop(), 10) * 1000;
    if (!date || Number.isNaN(date)) return false;
    return Date.now() - date > dayInMs && Date.now() - date < monthInMs;
};

const bannerDoesNotCollide = (): Promise<boolean> =>
    new Promise(show => {
        setTimeout(() => {
            show(true);
        }, 1000);

        mediator.on('modules:onwards:breaking-news:ready', breakingShown => {
            if (!breakingShown) {
                show(true);
            } else {
                show(false);
            }
        });
        mediator.on('membership-message:display', () => {
            show(false);
        });
    });

const hide = (msg: Message) => {
    msg.hide();
};

const canShow = (): Promise<boolean> => {
    const conditions = [
        isNotSignedIn(),
        isRecurringVisitor(),
        hasReadOver4Articles(),
        bannerDoesNotCollide(),
    ];
    return Promise.all(conditions).then(solvedConditions =>
        solvedConditions.every(_ => _ === true)
    );
};

const show = (): void => {
    const msg = new Message(messageCode, {
        cssModifierClass: 'sign-in-message',
        trackDisplay: true,
        permanent: true,
        blocking: true,
        siteMessageComponentName: messageCode,
        customJs: () => {
            const closeButtonEl: ?HTMLElement = document.querySelector(
                `.${bindableClassNames.closeBtn}`
            );
            if (!closeButtonEl) {
                hide(msg);
                throw new Error(ERR_MALFORMED_HTML);
            }
            closeButtonEl.addEventListener('click', (ev: MouseEvent) => {
                ev.preventDefault();
                hide(msg);
            });
        },
    });
    msg.show(makeTemplateHtml(tpl));
};

const signInEngagementBannerInit = (): Promise<void> =>
    canShow()
        .then((shouldDisplay: boolean) => {
            if (!shouldDisplay) {
                throw new Error(ERR_EXPECTED_NO_BANNER);
            }
        })
        .then(() => {
            show();
        })
        .catch(err => {
            if (err.message !== ERR_EXPECTED_NO_BANNER) throw err;
        });

export { signInEngagementBannerInit, canShow, show };
