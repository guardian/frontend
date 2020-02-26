// @flow
import type { CurrentABTest, SignInGateVariant } from '../types';
import { component, componentName } from '../component';
import {
    hasUserDismissedGate,
    isNPageOrHigherPageView,
    isLoggedIn,
    isInvalidArticleType,
    isInvalidSection,
} from '../helper';

// define the variant name here
const name = 'control';

// method which returns a boolean determining if this variant can be shown on the current pageview
const canShow: () => boolean = () =>
    !hasUserDismissedGate({
        componentName,
        componentId: component.id,
        variant: name,
    }) &&
    isNPageOrHigherPageView(2) &&
    !isLoggedIn() &&
    !isInvalidArticleType() &&
    !isInvalidSection();

// method which runs if the canShow method returns true, used to display the gate and logic associated with it
// in the control vartiant, we don't show anything, so just return true
const show: ({
    abTest: CurrentABTest,
    guUrl: string,
    signInUrl: string,
}) => boolean = () => true;

// export the variant as a SignInGateVariant type
export const signInGateVariant: SignInGateVariant = {
    name,
    canShow,
    show,
};
