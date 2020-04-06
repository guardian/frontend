// @flow
import type { SignInGateVariant } from '../types';
import { componentName } from '../component';
import {
    hasUserDismissedGate,
    isNPageOrHigherPageView,
    isLoggedIn,
    isInvalidArticleType,
    isInvalidSection,
} from '../helper';

// pull in the show method from the design folder, which has the html template and and click handlers etc.
import { show } from './design/quartus';

// define the variant name here
const variant = 'variant';

// method which returns a boolean determining if this variant can be shown on the current pageview
const canShow: (name?: string) => boolean = (name = '') =>
    !hasUserDismissedGate({
        componentName,
        name,
        variant,
    }) &&
    isNPageOrHigherPageView(3) &&
    !isLoggedIn() &&
    !isInvalidArticleType() &&
    !isInvalidSection();

// export the variant as a SignInGateVariant type
export const signInGateVariant: SignInGateVariant = {
    name: variant,
    canShow,
    show,
};
