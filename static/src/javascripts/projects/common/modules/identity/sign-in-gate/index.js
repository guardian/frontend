import config from 'lib/config';
import { getCookie } from 'lib/cookies';
import { constructQuery } from 'lib/url';
import { signInGateMainVariant } from 'common/modules/experiments/tests/sign-in-gate-main-variant';
import { signInGateMainControl } from 'common/modules/experiments/tests/sign-in-gate-main-control';
import { submitViewEventTracking } from './component-event-tracking';
import { getVariant, isInTest, getTestforMultiTest } from './helper';
import { withComponentId, componentName } from './component';
import { variants } from './variants';

// if using multiple tests, then add them all in this array. (all the variant names in each test in the array must be unique)
const tests = [signInGateMainVariant, signInGateMainControl];

const canShow = () =>
    new Promise(resolve => {
        // check if user is in test
        if (!tests.some(test => isInTest(test))) return resolve(false);

        // get the test the user is in
        const test = getTestforMultiTest(tests);

        // get the variant
        const variant = variants.find(v => v.name === getVariant(test));

        if (!variant) return resolve(false);

        // check if we can show the test for the variant the user is in
        return resolve(variant.canShow(test.dataLinkNames));
    });

const show = () =>
    new Promise(resolve => {
        // get the test the user is in
        const test = getTestforMultiTest(tests);

        if (!test) return resolve(false);

        // get the variant
        const variant = variants.find(
            v => v.name === getVariant(test)
        );

        if (!variant) return resolve(false);

        const abTest = {
            name: test.dataLinkNames || test.id,
            variant: variant.name,
        };

        // encode the current page as the return URL if the user goes onto the sign in page
        const returnUrl = encodeURIComponent(
            `${config.get('page.host')}/${config.get('page.pageId')}`
        );

        // get the view id to attach to component event params
        let viewId = '';
        if (
            window.guardian &&
            window.guardian.ophan &&
            window.guardian.ophan.viewId
        ) {
            viewId = window.guardian.ophan.viewId;
        }

        // set the component event params to be included in the query
        const queryParams = {
            componentType: 'signingate',
            componentId: test.ophanComponentId,
            abTestName: test.dataLinkNames || test.id,
            abTestVariant: variant.name,
            viewId,
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

        const ophanComponentId = test.ophanComponentId
            ? test.ophanComponentId
            : '';
        const ophanComponent = withComponentId(ophanComponentId);

        // in any variant
        // fire view tracking event
        submitViewEventTracking({
            component: ophanComponent,
            abTest,
        });

        // control what to show using variants
        return resolve(
            variant.show({
                guUrl,
                signInUrl,
                abTest,
                ophanComponentId,
            })
        );
    });

export const signInGate = {
    id: componentName,
    show,
    canShow,
};
