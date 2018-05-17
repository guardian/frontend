// @flow
import config from 'lib/config';
import { Message } from 'common/modules/ui/message';
import {
    getAdConsentState,
    setAdConsentState,
    allAdConsents,
} from 'common/modules/commercial/ad-prefs.lib';
import type { AdConsent } from 'common/modules/commercial/ad-prefs.lib';

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
        }" class="site-message--first-pv-consent__button site-message--first-pv-consent__button--link">${
    tpl.choicesButton
}</a>
        <button class="site-message--first-pv-consent__button site-message--first-pv-consent__button--main ${
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

const show = (): void => {
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

const test = {
    onAgree,
    bindableClassNames,
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

export { init, test, banner };
