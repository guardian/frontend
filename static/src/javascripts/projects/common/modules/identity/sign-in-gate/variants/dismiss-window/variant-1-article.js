// @flow
import type { CurrentABTest, SignInGateVariant } from '../../types';
import { componentName } from '../../component';
import {
    isLoggedIn,
    isNPageOrHigherPageView,
    isInvalidArticleType,
    isInvalidSection,
    isIOS9,
    setGatePageTargeting,
    unsetUserDismissedGate,
} from '../../helper';

// pull in the show method from the design folder, which has the html template and and click handlers etc.
import { designShow } from '../design/main-variant';

// define the variant name here
const variant = 'dismiss-window-variant-1-article'; // reshow the gate on every article, regardless if user has previously dismissed gate

// method which returns a boolean determining if this variant can be shown on the current pageview
const canShow: () => boolean = () => {
    // clears any previous dismissal from gu.prefs.signin-gate
    unsetUserDismissedGate({
        componentName,
    });

    const canShowCheck =
        isNPageOrHigherPageView(3) &&
        !isLoggedIn() &&
        !isInvalidArticleType() &&
        !isInvalidSection() &&
        !isIOS9();

    // as we always show the gate irrespective of previous user dismissal, hardcode a "false" here
    setGatePageTargeting(false, canShowCheck);
    return canShowCheck;
};

// method which runs if the canShow method returns true, used to display the gate and logic associated with it
// it returns a boolean, since the sign in gate is based on a `Banner` type who's show method returns a Promise<boolean>
// in our case it returns true if the design ran successfully, and false if there were any problems encountered
const show: ({
    abTest: CurrentABTest,
    guUrl: string,
    signInUrl: string,
    ophanComponentId: string,
}) => boolean = ({ abTest, guUrl, signInUrl, ophanComponentId }) =>
    designShow({ abTest, guUrl, signInUrl, ophanComponentId });

// export the variant as a SignInGateVariant type
export const signInGateVariant: SignInGateVariant = {
    name: variant,
    canShow,
    show,
};
