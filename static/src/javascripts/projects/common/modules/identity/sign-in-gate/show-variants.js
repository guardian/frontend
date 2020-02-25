// @flow
import mediator from 'lib/mediator';
import { makeTemplate } from './template';
import {
    setUserDismissedGate,
    addClickHandler,
    addOpinionBgColour,
    addPillarColour,
} from './helper';
import type { CurrentABTest } from './types';

// get the html of the whole gate, by getting the html template of the variant, and adding that
// to the first paragraph child which is hidden by the fade in
const setTemplate: ({
    child: Element,
    variant: string,
    signInUrl: string,
    guUrl: string,
}) => string = ({ child, variant, signInUrl, guUrl }) => `
    <div class="signin-gate__first-paragraph-container">
        ${child.outerHTML}
        <div class="signin-gate__first-paragraph-overlay"></div>
    </div>
    ${makeTemplate({
        signInUrl,
        guUrl,
        abVariant: variant,
    })}
`;

// 'show' method for the 'variant' variant
export const variant: ({
    signInUrl: string,
    guUrl: string,
    component: OphanComponent,
    abTest: CurrentABTest,
    componentName: string,
}) => void = ({ signInUrl, guUrl, component, abTest, componentName }) => {
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
                guUrl,
                signInUrl,
                variant: abTest.variant,
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
};

// 'show' method for the 'control' variant
export const control: ({
    signInUrl: string,
    guUrl: string,
    component: OphanComponent,
    abTest: CurrentABTest,
    componentName: string,
}) => void = ({ signInUrl, guUrl, component, abTest, componentName }) => {
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
                guUrl,
                signInUrl,
                variant: abTest.variant,
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
};
