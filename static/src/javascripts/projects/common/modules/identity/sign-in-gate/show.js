// @flow
import config from 'lib/config';
import { getCookie } from 'lib/cookies';
import { constructQuery } from 'lib/url';
import mediator from 'lib/mediator';
import { submitViewEvent } from './component-event-helper';
import { makeTemplate } from './template';
import {
    setUserDismissedGate,
    addClickHandler,
    addOpinionBgColour,
    addPillarColour,
} from './helper';
import type { CurrentABTest, ComponentEventParams } from './types';

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
const showVariant: ({
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
                target: '.signin-gate__first-paragraph-overlay',
            });

            // check page type/pillar to change text colour of the sign in gate
            addPillarColour({
                element: shadowArticleBody,
                target: '.signin-gate__benefits--text',
            });

            // add click handler for the dismiss of the gate
            addClickHandler({
                element: shadowArticleBody,
                target: '.js-signin-gate__dismiss',
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
                target: '.js-signin-gate__button',
                abTest,
                component,
                value: 'signin_button',
            });

            // add click handler for the why sign in link
            addClickHandler({
                element: shadowArticleBody,
                target: '.js-signin-gate__why',
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
const showControl: ({
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
                target: '.signin-gate__first-paragraph-overlay',
            });

            // check page type/pillar to change text colour of the sign in gate
            addPillarColour({
                element: shadowArticleBody,
                target: '.signin-gate__benefits--text',
            });

            // add click handler for the dismiss of the gate
            addClickHandler({
                element: shadowArticleBody,
                target: '.js-signin-gate__dismiss',
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
                target: '.js-signin-gate__button',
                abTest,
                component,
                value: 'signin_button',
            });

            // add click handler for the why sign in link
            addClickHandler({
                element: shadowArticleBody,
                target: '.js-signin-gate__why',
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

// show method used by the banner, uses a switch statement to show a different layout based on the variant
export const show: ({
    componentName: string,
    component: OphanComponent,
    variant: string,
    test: ABTest,
}) => boolean = ({ componentName, component, variant, test }) => {
    if (!componentName || !component || !variant || !test || !component.id)
        return false;

    const abTest: CurrentABTest = {
        name: test.id,
        variant,
    };

    // encode the current page as the return URL if the user goes onto the sign in page
    const returnUrl = encodeURIComponent(
        `${config.get('page.host')}/${config.get('page.pageId')}`
    );

    // set the component event params to be included in the query
    const queryParams: ComponentEventParams = {
        componentType: 'signingate',
        componentId: component.id,
        abTestName: test.id,
        abTestVariant: variant,
    };

    // attach the browser id to component event params
    const bwid = getCookie('bwid');
    if (bwid) queryParams.browserId = bwid;

    // attach the visit id to component event params
    const vsid = getCookie('vsid');
    if (vsid) queryParams.visitId = vsid;

    // get the current guardian website url, used to why sign in link
    const guUrl = config.get(`page.host`);

    // generate the sign in url link using the return url and component event params
    // also converts the params to a query string and uri encodes them so they can be passed through
    // all the way to IDAPI
    const signInUrl = `${config.get(
        `page.idUrl`
    )}/signin?returnUrl=${returnUrl}&componentEventParams=${encodeURIComponent(
        constructQuery(queryParams)
    )}`;

    // in any variant
    // fire view tracking event
    submitViewEvent({
        component,
        abTest,
    });

    // control what to show using variants
    switch (variant) {
        case 'control':
            showControl({
                abTest,
                component,
                componentName,
                guUrl,
                signInUrl,
            });
            return true;
        case 'variant':
            showVariant({
                abTest,
                component,
                componentName,
                guUrl,
                signInUrl,
            });
            return true;
        default:
            return true;
    }
};
