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
import userPrefs from 'common/modules/user-prefs';
import type { AdConsent } from 'common/modules/commercial/ad-prefs.lib';

import { trackNonClickInteraction } from 'common/modules/analytics/google';
import ophan from 'ophan/ng';

const lifeTimeViewsKey: string = 'first-pv-consent.lifetime-views';
const lifetimeDisplayEventKey: string = 'first-pv-consent : viewed-times :';

type Template = {
    heading: string,
    consentText: string,
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

const template: Template = {
    heading: `Your privacy`,
    consentText: `We use cookies to improve your experience on our site and to show you relevant advertising. 
To find out more, read our updated <a data-link-name="first-pv-consent : to-privacy" href="${
        links.privacy
    }">privacy policy</a> and <a data-link-name="first-pv-consent : to-cookies" href="${
        links.cookies
    }">cookie policy</a>.`,
    agreeButton: 'OK',
    choicesButton: 'More information',
    linkToPreferences: `${config.get('page.idUrl')}/adverts/manage`,
};

const bindableClassNames: BindableClassNames = {
    agree: 'js-first-pv-consent-agree',
};

const makeHtml = (tpl: Template, classes: BindableClassNames): string => `
    <div class="site-message--first-pv-consent__block site-message--first-pv-consent__block--head">${
        tpl.heading
    }</div>
    <div class="site-message--first-pv-consent__block site-message--first-pv-consent__block--intro">${
        tpl.consentText
    }</div>
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
    (getCookie('GU_geo_continent') || 'OTHER').toUpperCase() === 'EU';

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
    userPrefs.set(lifeTimeViewsKey, (userPrefs.get(lifeTimeViewsKey) || 0) + 1);
    trackInteraction(
        `${lifetimeDisplayEventKey} ${userPrefs.get(lifeTimeViewsKey)}`
    );

    const msg = new Message('first-pv-consent', {
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

const banner = {
    id: 'first-pv-consent-banner',
    canShow,
    show,
};

const init = (): Promise<void> =>
    canShow().then(can => {
        if (can) show();
    });

const _ = {
    onAgree,
    bindableClassNames,
};

export { init, _, banner };
