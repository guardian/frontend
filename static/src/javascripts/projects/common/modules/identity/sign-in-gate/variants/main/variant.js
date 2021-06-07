import { componentName } from '../../component';
import {
    isNPageOrHigherPageView,
    isLoggedIn,
    isInvalidArticleType,
    isInvalidSection,
    isInvalidTag,
    isIOS9,
    setGatePageTargeting,
    hasUserDismissedGateMoreThanCount,
} from '../../helper';

// pull in the show method from the design folder, which has the html template and and click handlers etc.
import { designShow } from '../design/main-variant';

// define the variant name here
const variant = 'main-variant-4';

// method which returns a boolean determining if this variant can be shown on the current pageview
const canShow = (name = '') => {
    const isGateDismissed = hasUserDismissedGateMoreThanCount(
        variant,
        name,
        componentName,
        5
    );
    const canShowCheck =
        !isGateDismissed &&
        isNPageOrHigherPageView(3) &&
        !isLoggedIn() &&
        !isInvalidArticleType() &&
        !isInvalidSection() &&
        !isInvalidTag() &&
        !isIOS9();

    setGatePageTargeting(isGateDismissed, canShowCheck);
    return canShowCheck;
};

// method which runs if the canShow method returns true, used to display the gate and logic associated with it
// it returns a boolean, since the sign in gate is based on a `Banner` type who's show method returns a Promise<boolean>
// in our case it returns true if the design ran successfully, and false if there were any problems encountered
const show = ({ abTest, guUrl, signInUrl, ophanComponentId }) =>
    designShow({ abTest, guUrl, signInUrl, ophanComponentId });

// export the variant as a SignInGateVariant type
export const signInGateVariant = {
    name: variant,
    canShow,
    show,
};
