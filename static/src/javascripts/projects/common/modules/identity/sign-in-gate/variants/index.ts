import type { SignInGateVariant } from '../types';
// import the variants from their respective files e.g.
// import { signInGateVariant as example } from './example';
import { signInGateVariant as mainControl } from './main/control';
import { signInGateVariant as mainVariant } from './main/variant';

// to add a variant, first import the variant in the SignInGateVariant type, and then add to this exported array
export const variants: SignInGateVariant[] = [
    // example,
    mainVariant,
    mainControl,
];
