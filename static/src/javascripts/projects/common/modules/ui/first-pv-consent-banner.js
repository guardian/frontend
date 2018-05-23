// @flow
import config from 'lib/config';
import { getCookie } from 'lib/cookies';
import { Message } from 'common/modules/ui/message';
import checkIcon from 'svgs/icon/tick.svg';
import {
    getAdConsentState,
    setAdConsentState,
    allAdConsents,
} from 'common/modules/commercial/ad-prefs.lib';
import { trackNonClickInteraction } from 'common/modules/analytics/google';
import ophan from 'ophan/ng';
import { upAlertViewCount } from 'common/modules/analytics/send-ad-prefs';
import type { AdConsent } from 'common/modules/commercial/ad-prefs.lib';
import type { Banner } from 'common/modules/ui/bannerPicker';

const displayEventKey: string = 'first-pv-consent : display';

type Template = {
    heading: string,
    consentText: string[],
    agreeButton: string,
    choicesButton: string,
    linkToPreferences: string,
};

type BindableClassNames = {
    agree: string,
};

type Links = {
    privacy: string,
    cookies: string,
};

const links: Links = {
    privacy: 'https://www.theguardian.com/help/privacy-policy',
    cookies: 'https://www.theguardian.com/info/cookies',
};
const messageCode: string = 'first-pv-consent';

const template: Template = {
    heading: `Your privacy`,
    consentText: [
        `We use cookies to improve your experience on our site and to show you relevant advertising.`,
        `To find out more, read our updated <a data-link-name="first-pv-consent : to-privacy" href="${
            links.privacy
        }">privacy policy</a> and <a data-link-name="first-pv-consent : to-cookies" href="${
            links.cookies
        }">cookie policy</a>.`,
    ],
    agreeButton: 'OK',
    choicesButton: 'More information',
    linkToPreferences: `${config.get('page.idUrl')}/privacy-settings`,
};

const bindableClassNames: BindableClassNames = {
    agree: 'js-first-pv-consent-agree',
};

const makeHtml = (tpl: Template, classes: BindableClassNames): string => `
    <div class="site-message--first-pv-consent__block site-message--first-pv-consent__block--head">${
        tpl.heading
    }</div>
    <div class="site-message--first-pv-consent__block site-message--first-pv-consent__block--intro">${tpl.consentText
        .map(_ => `<p>${_}</p>`)
        .join('')}</div>
    <div class="site-message--first-pv-consent__block site-message--first-pv-consent__block--actions">
        <button 
            data-link-name="first-pv-consent : agree" 
            class="site-message--first-pv-consent__button site-message--first-pv-consent__button--main ${
                classes.agree
            }"
        >${checkIcon.markup}<span>${tpl.agreeButton}</span></button>
        <a 
            href="${tpl.linkToPreferences}" 
            data-link-name="first-pv-consent : to-prefs" 
            class="site-message--first-pv-consent__link"
        >${tpl.choicesButton}</a>
    </div>
`;

const isInEEA = (): boolean =>
    [
        (getCookie('GU_geo_continent') || 'OTHER').toUpperCase() === 'EU',
        ['NO', 'IS', 'LI'].includes(
            (getCookie('GU_country') || 'OTHER').toUpperCase()
        ),
    ].some(_ => _ === true);

const onAgree = (msg: Message): void => {
    allAdConsents.forEach(_ => {
        setAdConsentState(_, true);
    });
    msg.hide();
};

const hasUnsetAdChoices = (): boolean =>
    allAdConsents.some((_: AdConsent) => getAdConsentState(_) === null);

const canShow = (): Promise<boolean> =>
    Promise.resolve([hasUnsetAdChoices(), isInEEA()].every(_ => _ === true));

const trackInteraction = (interaction: string): void => {
    ophan.record({
        component: 'first-pv-consent',
        action: interaction,
        value: interaction,
    });
    trackNonClickInteraction(interaction);
};

const show = (): void => {
    upAlertViewCount();
    trackInteraction(displayEventKey);

    const msg = new Message(messageCode, {
        important: true,
        permanent: true,
        customJs: () => {
            [
                ...document.querySelectorAll(`.${bindableClassNames.agree}`),
            ].forEach(agreeButtonEl => {
                agreeButtonEl.addEventListener('click', () => onAgree(msg));
            });
        },
    });
    msg.show(makeHtml(template, bindableClassNames));
};

const firstPvConsentBanner: Banner = {
    id: messageCode,
    canShow,
    show,
};

export const _ = {
    onAgree,
    bindableClassNames,
};

export { firstPvConsentBanner };
