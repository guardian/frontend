// @flow
import config from 'lib/config';
import { Message } from 'common/modules/ui/message';

const linkToPreferences = `${config.get('page.idUrl')}/adverts/manage`;

const text = {
    consent: `Welcome to The Guardian. We use cookies & <a href="${
        linkToPreferences
    }">third party tracking</a> & other technologies.`,
    agreeButton: 'I agree',
    choicesButton: 'More choices',
};

const bindableClassNames = {
    agree: 'js-third-party-consent-agree',
    choices: 'js-third-party-consent-choices',
};

const templateHtml = `
    <div class="site-message--third-party-consent__block site-message--third-party-consent__intro">${
        text.consent
    }</div>
    <div class="site-message--third-party-consent__block site-message--third-party-consent__actions">
        <a href="#" class="site-message--third-party-consent__button site-message--third-party-consent__button--link ${
            bindableClassNames.choices
        }">${text.choicesButton}</a>
        <button class="site-message--third-party-consent__button site-message--third-party-consent__button--main ${
            bindableClassNames.agree
        }">${text.agreeButton}</button>
    </div>
`;

const onAgree = msg => {
    alert('thanks!');
    msg.hide();
};

const canShow: Promise<boolean> = () => Promise.resolve(true);

const show = (): boolean => {
    const msg = new Message('third-party-consent', {
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
    msg.show(templateHtml);
    return true;
};

const init = (): Promise<void> =>
    canShow().then(can => {
        if (can) show();
    });

export { init };
