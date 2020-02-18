// @flow
import bean from 'bean';
import config from 'lib/config';
import { getCookie } from 'lib/cookies';
import { constructQuery } from 'lib/url';
import mediator from 'lib/mediator';
import { submitViewEvent, submitClickEvent } from './component-event-helper';
import { make } from './template';
import { setUserDismissedGate } from './helper';

type CurrentABTest = {
    name: string,
    variant: string,
};

type ComponentEventParams = {
    componentType: string,
    componentId?: string,
    abTestName: string,
    abTestVariant: string,
    viewId?: string,
    browserId?: string,
    visitId?: string,
};

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
            shadowArticleBody.innerHTML = `
                <div class="signin-gate__first-paragraph-container">
                    ${articleBodyFirstChild.outerHTML}
                    <div class="signin-gate__first-paragraph-overlay"></div>
                </div>
                ${make(signInUrl, guUrl)}
            `;

            // check if comment, and add comment/opinion bg colour
            if (config.get(`page.cardStyle`) === 'comment') {
                const overlay = shadowArticleBody.querySelector(
                    '.signin-gate__first-paragraph-overlay'
                );
                if (overlay) {
                    overlay.classList.add(
                        'signin-gate__first-paragraph-overlay--comment'
                    );
                }
            }

            // check page type/pillar to change text colour of the sign in gate
            const paragraphText = shadowArticleBody.querySelector(
                '.signin-gate__benefits--text'
            );
            if (paragraphText) {
                switch (config.get(`page.pillar`)) {
                    case 'News':
                        paragraphText.classList.add(
                            `signin-gate__benefits--text-news`
                        );
                        break;
                    case 'Opinion':
                        paragraphText.classList.add(
                            `signin-gate__benefits--text-comment`
                        );
                        break;
                    case 'Sport':
                        paragraphText.classList.add(
                            `signin-gate__benefits--text-sport`
                        );
                        break;
                    case 'Arts':
                        paragraphText.classList.add(
                            `signin-gate__benefits--text-culture`
                        );
                        break;
                    case 'Lifestyle':
                        paragraphText.classList.add(
                            `signin-gate__benefits--text-lifestyle`
                        );
                        break;
                    default:
                        break;
                }
            }

            // add click handler for the dismiss of the gate
            bean.on(
                shadowArticleBody,
                'click',
                '.js-signin-gate__dismiss',
                () => {
                    // submit dismiss click event to ophan
                    submitClickEvent({
                        component,
                        abTest,
                        value: 'dismiss',
                    });

                    // show the current body. Remove the shadow one
                    articleBody.style.display = 'block';
                    shadowArticleBody.remove();

                    // Tell other things the article has been redisplayed
                    mediator.emit('page:article:redisplayed');

                    // user pref dismissed gate
                    setUserDismissedGate({
                        componentName,
                        name: abTest.name,
                        variant: 'variant',
                    });
                }
            );

            // add click handler for sign in button click
            bean.on(
                shadowArticleBody,
                'click',
                '.js-signin-gate__button',
                () => {
                    // submit sign in button click event to ophan
                    submitClickEvent({
                        component,
                        abTest,
                        value: 'signin_button',
                    });
                }
            );

            // add click handler for the why sign in link
            bean.on(shadowArticleBody, 'click', '.js-signin-gate__why', () => {
                // submit why sign in track event
                submitClickEvent({
                    component,
                    abTest,
                    value: 'why_sign_in',
                });
            });

            // Hide the article Body. Append the shadow one.
            articleBody.style.display = 'none';
            if (articleBody.parentNode) {
                articleBody.parentNode.appendChild(shadowArticleBody);
            }
        }
    }
};

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

    switch (variant) {
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
