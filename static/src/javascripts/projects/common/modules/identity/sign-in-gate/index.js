// @flow
import type { Banner } from 'common/modules/ui/bannerPicker';
import { signInGate as signInGateTest } from 'common/modules/experiments/tests/sign-in-gate';
import { canShow as canShowFn } from './can-show';
import { show as showFn } from './show';
import { getVariant, isInTest } from './helper';

// component name, should always be sign-in-gate
const componentName = 'sign-in-gate';

// set the ophan component tracking vars
const component: OphanComponent = {
    componentType: 'SIGN_IN_GATE',
    id: 'tertius_test',
};

const canShow: () => Promise<boolean> = () =>
    new Promise(resolve => {
        // check if user is in test
        if (!isInTest(signInGateTest)) return resolve(false);

        // get the variant
        const variant = getVariant(signInGateTest);

        // check if we can show the test for the variant the user is in
        return resolve(
            canShowFn({
                component,
                componentName,
                variant,
            })
        );
    });

const show: () => Promise<boolean> = () =>
    new Promise(resolve => {
        const variant = getVariant(signInGateTest);
        return resolve(
            // show the gate for the given variant
            showFn({
                component,
                componentName,
                test: signInGateTest,
                variant,
            })
        );
    });

export const signInGate: Banner = {
    id: componentName,
    show,
    canShow,
};
