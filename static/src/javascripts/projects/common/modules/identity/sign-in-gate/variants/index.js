// @flow
import type { SignInGateVariant } from '../types';
// import the variants from their respective files e.g.
// import { signInGateVariant as example } from './example';
import { signInGateVariant as control } from './control';
import { signInGateVariant as variant } from './variant';

// to add a variant, first import the variant in the SignInGateVariant type, and then add to this exported array
export const variants: Array<SignInGateVariant> = [
    // example,
    control,
    variant,
];
