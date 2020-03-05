// @flow
import config from 'lib/config';
import { getCookie } from 'lib/cookies';
import { constructQuery } from 'lib/url';
import type { Banner } from 'common/modules/ui/bannerPicker';
import { signInGate as signInGateTest } from 'common/modules/experiments/tests/sign-in-gate';
import { submitViewEventTracking } from './component-event-tracking';
import { getVariant, isInTest } from './helper';
import { component, componentName } from './component';
import { variants } from './variants';
import type {
    CurrentABTest,
    ComponentEventParams,
    SignInGateVariant,
} from './types';

const canShow: () => Promise<boolean> = () =>
    new Promise(resolve => {
        // check if user is in test
        if (!isInTest(signInGateTest)) return resolve(false);

        // get the variant
        const variant = variants.find(
            v => v.name === getVariant(signInGateTest)
        );

        if (!variant) return resolve(false);

        // check if we can show the test for the variant the user is in
        return resolve(variant.canShow(signInGateTest.id));
    });

const show: () => Promise<boolean> = () =>
    new Promise(resolve => {
        // get the variant
        const variant: SignInGateVariant | void = variants.find(
            v => v.name === getVariant(signInGateTest)
        );

        if (!variant) return resolve(false);

        const abTest: CurrentABTest = {
            name: signInGateTest.id,
            variant: variant.name,
        };

        // encode the current page as the return URL if the user goes onto the sign in page
        const returnUrl = encodeURIComponent(
            `${config.get('page.host')}/${config.get('page.pageId')}`
        );

        // set the component event params to be included in the query
        const queryParams: ComponentEventParams = {
            componentType: 'signingate',
            componentId: component.id,
            abTestName: signInGateTest.id,
            abTestVariant: variant.name,
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
        return resolve(
            variant.show({
                guUrl,
                signInUrl,
                abTest,
            })
        );
    });

export const signInGate: Banner = {
    id: componentName,
    show,
    canShow,
};
