// @flow
type Feature = {
    id: string,
    mainCopy: string,
    subCopy: string,
};

type Template = {
    headerMain: string[],
    headerSub: string[],
    signInCta: string,
    registerCta: string,
    advantagesCta: string,
    closeButton: string,
    features: Feature[],
};

const wrapLineBreakingString = (text: string[], className: string): string =>
    text
        .map(
            (line, index) =>
                `<span class="${className}">${line}${
                    index === text.length ? '' : ' '
                }</span><wbr>
    `
        )
        .join('');

const makeTemplateHtml = (tpl: Template) => `
<div id="site-message__message" class="site-message--sign-in-container">
    <section class="site-message__message site-message__message--sign-in">
        <div class="site-message--sign-in__header">
            <h2 class="site-message--sign-in__header-msg site-message--sign-in__header-msg--main">${wrapLineBreakingString(
                tpl.headerMain,
                'site-message--sign-in__header-msg-line'
            )}</h2>
            <br/>
            <p class="site-message--sign-in__header-msg site-message--sign-in__header-msg--sub">${wrapLineBreakingString(
                tpl.headerSub,
                'site-message--sign-in__header-msg-line'
            )}</p>
        </div>
        <ul class="site-message--sign-in__body">
            ${tpl.features
                .map(
                    (feature: Feature) =>
                        `
                    <li class="site-message--sign-in__feature site-message--sign-in__feature--${
                        feature.id
                    }">
                        <strong>${feature.mainCopy}</strong>
                        ${feature.subCopy}
                    </li>
                    `
                )
                .join('')}
        </ul>
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

export type { Template, Feature };
export { makeTemplateHtml };
