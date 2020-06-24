// @flow
import type { SignInGateVariant } from '../../types';
import { componentName } from '../../component';
import {
    hasUserDismissedGate,
    isNPageOrHigherPageView,
    isLoggedIn,
    isInvalidArticleType,
    isInvalidSection,
    isIOS9,
    setGatePageTargeting,
} from '../../helper';

// pull in the show method from the design folder, which has the html template and and click handlers etc.
// No design needed as not showing a sign in gate in the control

// define the variant name here
const variant = 'patientia-control-1';

// method which returns a boolean determining if this variant can be shown on the current pageview
const canShow: (name?: string) => boolean = (name = '') => {
    const isGateDismissed = hasUserDismissedGate({
        name,
        variant,
        componentName,
    });
    const canShowCheck =
        !isGateDismissed &&
        isNPageOrHigherPageView(3) &&
        !isLoggedIn() &&
        !isInvalidArticleType() &&
        !isInvalidSection() &&
        !isIOS9();

    setGatePageTargeting(isGateDismissed, false); // gate is never shown in control
    return canShowCheck;
};

// method which runs if the canShow method returns true, used to display the gate and logic associated with it
// it returns a boolean, since the sign in gate is based on a `Banner` type who's show method returns a Promise<boolean>
// in our case it returns true if the design ran successfully, and false if there were any problems encountered
const show: () => boolean = () => true;

// export the variant as a SignInGateVariant type
export const signInGateVariant: SignInGateVariant = {
    name: variant,
    canShow,
    show,
};
