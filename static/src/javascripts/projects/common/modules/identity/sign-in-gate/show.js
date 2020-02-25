// @flow
import config from 'lib/config';
import { getCookie } from 'lib/cookies';
import { constructQuery } from 'lib/url';
import { submitViewEventTracking } from './component-event-tracking';
import { control as showControl, variant as showVariant } from './show-variants';
import type { CurrentABTest, ComponentEventParams } from './types';

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
    submitViewEventTracking({
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
