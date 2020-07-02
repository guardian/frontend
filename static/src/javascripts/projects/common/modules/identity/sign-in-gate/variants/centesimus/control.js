// @flow
import type { CurrentABTest, SignInGateVariant } from '../../types';
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
import { designShow } from '../design/centesimus-control-2';

// define the variant name here
const variant = 'centesimus-control-2';

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

    setGatePageTargeting(isGateDismissed, canShowCheck);
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
