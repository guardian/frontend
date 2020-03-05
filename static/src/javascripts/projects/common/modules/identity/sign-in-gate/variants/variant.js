// @flow
import mediator from 'lib/mediator';
import type { CurrentABTest, SignInGateVariant } from '../types';
import { component, componentName } from '../component';
import {
    hasUserDismissedGate,
    isNPageOrHigherPageView,
    isLoggedIn,
    isInvalidArticleType,
    isInvalidSection,
    addOpinionBgColour,
    addClickHandler,
    setUserDismissedGate,
    showGate,
} from '../helper';

const variant = 'variant';

const htmlTemplate: ({
    signInUrl: string,
    guUrl: string,
}) => string = ({ signInUrl, guUrl }) => `
<div class="signin-gate">
    <div class="signin-gate__content">
        <div class="signin-gate__header">
            <h1 class="signin-gate__header--text">Register for free and continue reading</h1>
        </div>
        <div class="signin-gate__benefits syndication--bottom">
            <p class="signin-gate__benefits--text">
                The Guardian’s independent journalism is still free to read
            </p>
        </div>
        <div class="signin-gate__paragraph syndication--bottom">
            <p class="signin-gate__paragraph--text">
                Registering lets us understand you better. This means that we can build better products and start to personalise the adverts you see so we can charge more from advertisers in the future.
            </p>
        </div>
        <div class="signin-gate__buttons">
            <a class="signin-gate__button signin-gate__button--primary js-signin-gate__register-button" href="${signInUrl}">
                Register for free
            </a>
            <a class="signin-gate__dismiss js-signin-gate__dismiss" href="#maincontent">Not Now</a>
        </div>
        <div class="signin-gate__padding-bottom signin-gate__buttons">
            Already registered, contributed, or subscribed?&nbsp;<a class="signin-gate__link js-signin-gate__sign-in signin-gate__link-no-ptm signin-gate__center-424" href="${signInUrl}">Sign in</a>
        </div>
        <div class="signin-gate__buttons">
            <a class="signin-gate__link js-signin-gate__why" href="${guUrl}/membership/2019/dec/20/signing-in-to-the-guardian">Why register & how does it help?</a>
        </div>
        <div class="signin-gate__buttons">
            <a class="signin-gate__link js-signin-gate__how" href="${guUrl}/info/2014/nov/03/why-your-data-matters-to-us-full-text">How will my information & data be used?</a>
        </div>
        <div class="signin-gate__buttons">
            <a class="signin-gate__link js-signin-gate__help" href="${guUrl}/help/identity-faq">Get help with registering or signing in</a>
        </div>
    </div>
</div>
`;

const canShow: (name?: string) => boolean = (name = '') =>
    !hasUserDismissedGate({
        componentName,
        name,
        variant,
    }) &&
    isNPageOrHigherPageView(2) &&
    !isLoggedIn() &&
    !isInvalidArticleType() &&
    !isInvalidSection();

const show: ({
    abTest: CurrentABTest,
    guUrl: string,
    signInUrl: string,
}) => boolean = ({ abTest, guUrl, signInUrl }) =>
    showGate({
        template: htmlTemplate({
            signInUrl,
            guUrl,
        }),
        handler: ({ articleBody, shadowArticleBody }) => {
            // check if comment, and add comment/opinion bg colour
            addOpinionBgColour({
                element: shadowArticleBody,
                selector: '.signin-gate__first-paragraph-overlay',
            });

            // add click handler for the dismiss of the gate
            addClickHandler({
                element: shadowArticleBody,
                selector: '.js-signin-gate__dismiss',
                abTest,
                component,
                value: 'not-now',
                callback: () => {
                    // show the current body. Remove the shadow one
                    articleBody.style.display = 'block';
                    shadowArticleBody.remove();

                    // Tell other things the article has been redisplayed
                    mediator.emit('page:article:redisplayed');

                    // user pref dismissed gate
                    setUserDismissedGate({
                        componentName,
                        name: abTest.name,
                        variant: abTest.variant,
                    });
                },
            });

            // add click handler for sign in link click
            addClickHandler({
                element: shadowArticleBody,
                selector: '.js-signin-gate__register-button',
                abTest,
                component,
                value: 'register-link',
            });

            // add click handler for sign in link click
            addClickHandler({
                element: shadowArticleBody,
                selector: '.js-signin-gate__sign-in',
                abTest,
                component,
                value: 'sign-in-link',
            });

            // add click handler for the why sign in link
            addClickHandler({
                element: shadowArticleBody,
                selector: '.js-signin-gate__why',
                abTest,
                component,
                value: 'why-link',
            });

            // add click handler for the how info used link
            addClickHandler({
                element: shadowArticleBody,
                selector: '.js-signin-gate__how',
                abTest,
                component,
                value: 'how-link',
            });

            // add click handler for the help link
            addClickHandler({
                element: shadowArticleBody,
                selector: '.js-signin-gate__help',
                abTest,
                component,
                value: 'help-link',
            });
        },
    });

export const signInGateVariant: SignInGateVariant = {
    name: variant,
    canShow,
    show,
};
