// @flow
import config from 'lib/config';
import { Message } from 'common/modules/ui/message';
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
const displayEventKey: string = 'first-pv-consent : display';
const lifetimeDisplayEventKey: string = 'first-pv-consent : viewed-times :';

type Template = {
    consentText: string,
    agreeButton: string,
    choicesButton: string,
    linkToPreferences: string,
};

type BindableClassNames = {
    agree: string,
};

const template: Template = {
    consentText: `Do you agree to the use of cookies on our website and the sharing of data with our partners to see ads that are more relevant to you? You can learn more in our updated privacy policy and cookie policy, effective 25 May 2018.`,
    agreeButton: 'I agree',
    choicesButton: 'Show me more options',
    linkToPreferences: `${config.get('page.idUrl')}/adverts/manage`,
};

const bindableClassNames: BindableClassNames = {
    agree: 'js-first-pv-consent-agree',
};

const makeHtml = (tpl: Template, classes: BindableClassNames): string => `
    <div class="site-message--first-pv-consent__block site-message--first-pv-consent__intro">${
        tpl.consentText
    }</div>
    <div class="site-message--first-pv-consent__block site-message--first-pv-consent__actions">
        <a href="${
            tpl.linkToPreferences
        }" data-link-name="first-pv-consent : to-prefs" class="site-message--first-pv-consent__button site-message--first-pv-consent__button--link">${
    tpl.choicesButton
}</a>
        <button data-link-name="first-pv-consent : agree" class="site-message--first-pv-consent__button site-message--first-pv-consent__button--main ${
            classes.agree
        }">${tpl.agreeButton}</button>
    </div>
`;

const onAgree = (msg: Message): void => {
    allAdConsents.forEach(_ => {
        setAdConsentState(_, true);
    });
    msg.hide();
};

const hasUnsetAdChoices = (): boolean =>
    allAdConsents.some((_: AdConsent) => getAdConsentState(_) === null);

const canShow = (): Promise<boolean> =>
    Promise.resolve([hasUnsetAdChoices()].every(_ => _ === true));

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

    [
        displayEventKey,
        `${lifetimeDisplayEventKey} ${userPrefs.get(lifeTimeViewsKey)}`,
    ].forEach(trackInteraction);

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
