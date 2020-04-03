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

const variant = 'variant';

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

const show: () => boolean = () => true;

export const signInGateVariant: SignInGateVariant = {
    name: variant,
    canShow,
    show,
};
