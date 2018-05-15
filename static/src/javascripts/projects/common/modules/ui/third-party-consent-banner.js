// @flow
import { getCookie, addCookie } from 'lib/cookies';
import { Message } from 'common/modules/ui/message';

const canShow: Promise<boolean> = () => Promise.resolve(true);

const text = {
    consent: 'We use cookies & ads & all that jazz.'
};

const bindableClassNames = {
    agree: 'js-third-party-consent-agree',
    choices: 'js-third-party-consent-choices',
};

const templateHtml = `
    <div>${text.consent}</div>
    <button class="${bindableClassNames.agree}">I agree</button>
    <a href="#" class="${bindableClassNames.choices}">More choices</a>
`;

const onAgree = (msg) => {
    alert('thanks!');
    msg.hide();
}

const show = (): boolean => {
    const msg = new Message('third-party-consent', {
        important: true,
        permanent: true,
        customJs: () => {
            [...document.querySelectorAll('.'+bindableClassNames.agree)].forEach(agreeButtonEl => {
                agreeButtonEl.addEventListener('click',()=>onAgree(msg));
            })
        }
    });
    msg.show(templateHtml);
    return true;
};

const init = (): Promise<void> => canShow().then(can => {can ? show() : null});

export {init}
