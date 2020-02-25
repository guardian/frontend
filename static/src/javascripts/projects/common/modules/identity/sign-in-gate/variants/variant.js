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
    addPillarColour,
    addClickHandler,
    setUserDismissedGate,
    setTemplate,
} from '../helper';

const name = 'variant';

const htmlTemplate: ({
    signInUrl: string,
    guUrl: string,
}) => string = ({ signInUrl, guUrl }) => `
<div class="signin-gate">
    <div class="signin-gate__content">
        <div class="signin-gate__header">
            <h1 class="signin-gate__header--text">Sign in and continue<br />reading for free - VARIANT</h1>
        </div>
        <div class="signin-gate__benefits syndication--bottom">
            <p class="signin-gate__benefits--text">
                Help keep our independent, progressive journalism alive and thriving by taking a couple of simple steps to sign in
            </p>
        </div>
        <div class="signin-gate__buttons">
            <a class="signin-gate__button signin-gate__button--primary js-signin-gate__button" href="${signInUrl}">
                Sign in
            </a>
            <a class="signin-gate__why js-signin-gate__why" href="${guUrl}/help/identity-faq">Why sign in?</a>
            <a class="signin-gate__dismiss js-signin-gate__dismiss" href="#maincontent">Not Now</a>
        </div>
    </div>
</div>
`;

const canShow: () => boolean = () =>
    !hasUserDismissedGate({
        componentName,
        componentId: component.id,
        variant: 'name',
    }) &&
    isNPageOrHigherPageView(2) &&
    !isLoggedIn() &&
    !isInvalidArticleType() &&
    !isInvalidSection();

const show: ({
    abTest: CurrentABTest,
    guUrl: string,
    signInUrl: string,
}) => boolean = ({ abTest, guUrl, signInUrl }) => {
    // get the whole article body
    const articleBody = document.querySelector('.js-article__body');

    if (articleBody) {
        // get the first paragraph of the article
        const articleBodyFirstChild = articleBody.firstElementChild;
        if (articleBodyFirstChild) {
            // container div to hold our "shadow" article dom while we create it
            const shadowArticleBody = document.createElement('div');
            // add the article body classes to the "shadow"
            shadowArticleBody.className = articleBody.className;

            // set the new article body to be first paragraph with transparent overlay, with the sign in gate component
            shadowArticleBody.innerHTML = setTemplate({
                child: articleBodyFirstChild,
                template: htmlTemplate({
                    signInUrl,
                    guUrl,
                }),
            });

            // check if comment, and add comment/opinion bg colour
            addOpinionBgColour({
                element: shadowArticleBody,
                selector: '.signin-gate__first-paragraph-overlay',
            });

            // check page type/pillar to change text colour of the sign in gate
            addPillarColour({
                element: shadowArticleBody,
                selector: '.signin-gate__benefits--text',
            });

            // add click handler for the dismiss of the gate
            addClickHandler({
                element: shadowArticleBody,
                selector: '.js-signin-gate__dismiss',
                abTest,
                component,
                value: 'dismiss',
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

            // add click handler for sign in button click
            addClickHandler({
                element: shadowArticleBody,
                selector: '.js-signin-gate__button',
                abTest,
                component,
                value: 'signin_button',
            });

            // add click handler for the why sign in link
            addClickHandler({
                element: shadowArticleBody,
                selector: '.js-signin-gate__why',
                abTest,
                component,
                value: 'why_sign_in',
            });

            // Hide the article Body. Append the shadow one.
            articleBody.style.display = 'none';
            if (articleBody.parentNode) {
                articleBody.parentNode.appendChild(shadowArticleBody);
            }
        }
    }

    return true;
};

export const signInGateVariant: SignInGateVariant = {
    name,
    canShow,
    show,
};
