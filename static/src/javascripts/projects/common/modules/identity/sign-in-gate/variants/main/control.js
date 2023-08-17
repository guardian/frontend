import { isUserLoggedIn } from 'common/modules/identity/api';
import { componentName } from '../../component';
import {
    hasUserDismissedGate,
    isNPageOrHigherPageView,
    isInvalidArticleType,
    isInvalidSection,
    isIOS9,
    setGatePageTargeting,
    isInvalidTag,
} from '../../helper';

// define the variant name here
const variant = 'main-control-4';

// method which returns a boolean determining if this variant can be shown on the current pageview
/** @type {(name: string) => Promise<boolean>} */
const canShow = async (name = '') => {
    const isGateDismissed = hasUserDismissedGate({
        name,
        variant,
        componentName,
    });
    const isLoggedIn = await isUserLoggedIn();
    const canShowCheck =
        !isGateDismissed &&
        isNPageOrHigherPageView(3) &&
        !isLoggedIn &&
        !isInvalidArticleType() &&
        !isInvalidSection() &&
        !isInvalidTag() &&
        !isIOS9();

    setGatePageTargeting(isGateDismissed, canShowCheck);
    return canShowCheck;
};

// method which runs if the canShow method returns true, used to display the gate and logic associated with it
// it returns a boolean, since the sign in gate is based on a `Banner` type who's show method returns a Promise<boolean>
// in this case as the gate doesn't show anything, we just return true
const show = () => true;

// export the variant as a SignInGateVariant type
export const signInGateVariant = {
    name: variant,
    canShow,
    show,
};
