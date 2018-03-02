// @flow

import { getUserFromApi } from 'common/modules/identity/api';
import { Message } from 'common/modules/ui/message';
import { inlineSvg } from 'common/views/svgs';
import config from 'lib/config';
import ophan from 'ophan/ng';
import userPrefs from 'common/modules/user-prefs';

const messageCode: string = 'gdpr-opt-in-jan-18';
const messageHidAtPref: string = `${messageCode}-hid-at`;
const messageCloseBtn = 'js-gdpr-oi-close';
const remindMeLaterInterval = 24 * 60 * 60 * 1000;
const medium: string = new URL(window.location.href).searchParams.get(
    'utm_medium'
);

type ApiUser = {
    statusFields: {
        hasRepermissioned: Boolean,
    },
};

type Link = {
    title: string,
    href: ?string,
    className: ?(string[]),
    name: string,
};

type Template = {
    image: string,
    title: string,
    cta: string,
    links: Link[],
};

const targets = {
    landing: 'https://gu.com/staywithus',
    journey: `${config.get('page.idUrl')}/consents/staywithus`,
};

const template: Template = {
    image: config.get('images.identity.opt-in'),
    title: `We’re changing how we communicate with readers. Let us know what emails you want to receive <strong>before 30 April</strong>.`,
    cta: `Opt in now`,
    links: [
        {
            title: 'Find out more',
            href: targets.landing,
            className: [],
            name: 'gdpr-oi-campaign : alert : to-landing',
        },
        {
            title: 'remind me later',
            className: [messageCloseBtn],
            name: 'gdpr-oi-campaign : alert : close',
        },
    ],
};
const linkHtml = (link): string => `
    <a 
        ${link.href ? `href="${link.href}"` : ''} 
        ${
            link.className.length > 0
                ? `class="${link.className.join(' ')}"`
                : ''
        }
        data-link-name="${link.name}"
    >
        ${link.title}</a>
`;

const templateHtml: string = `
    <div id="site-message__message">
        <div class="site-message__message identity-gdpr-oi-alert">
            <div class="identity-gdpr-oi-alert__logo">
                <img src="${template.image}" alt="Stay with us" />
            </div>
            <div class="identity-gdpr-oi-alert__body">
                <div class="identity-gdpr-oi-alert__text">
                    ${template.title}
                    ${template.links.map(linkHtml).join(' or ')}.
                </div>
                <a class="identity-gdpr-oi-alert__cta" target="_blank" href="${
                    targets.journey
                }" data-link-name="gdpr-oi-campaign : alert : to-consents">
                    ${template.cta}
                    ${inlineSvg('arrowWhiteRight')}
                </a>
            </div>
        </div>
    </div>`;

const shouldDisplayBasedOnRemindMeLaterInterval = (): boolean => {
    const hidAt = userPrefs.get(messageHidAtPref);
    if (!hidAt) return true;
    return Date.now() > hidAt + remindMeLaterInterval;
};

const shouldDisplayBasedOnExperimentFlag = (): boolean =>
    config.get('tests.gdprOptinAlertVariant') === 'variant';

const shouldDisplayBasedOnMedium = (): boolean =>
    medium !== null && medium.toLowerCase() === 'email';

const shouldDisplayOptInBanner = (): Promise<boolean> =>
    new Promise(decision => {
        const shouldDisplay = [
            shouldDisplayBasedOnExperimentFlag(),
            shouldDisplayBasedOnRemindMeLaterInterval(),
            shouldDisplayBasedOnMedium(),
        ];

        if (!shouldDisplay.every(_ => _ === true)) {
            return decision(false);
        }

        getUserFromApi((user: ApiUser) => {
            if (user === null || !user.statusFields.hasRepermissioned)
                decision(true);
            else decision(false);
        });
    });

const hide = (msg: Message) => {
    msg.hide();
    userPrefs.set(messageHidAtPref, Date.now());
};

const optInEngagementBannerInit = (): void => {
    shouldDisplayOptInBanner().then((shouldIt: boolean) => {
        if (shouldIt) {
            const msg = new Message(messageCode, {
                cssModifierClass: 'gdpr-opt-in',
                permanent: true,
                siteMessageComponentName: messageCode,
            });
            const shown = msg.show(templateHtml);
            if (shown) {
                ophan.record({
                    component: 'gdpr-oi-campaign-alert',
                    action: 'gdpr-oi-campaign : alert : show',
                });
                document
                    .querySelector(`.${messageCloseBtn}`)
                    .addEventListener('click', ev => {
                        ev.preventDefault();
                        hide(msg);
                    });
            }
        }
    });
};

export { optInEngagementBannerInit };
