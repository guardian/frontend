// @flow
import type { SignInGateVariant } from '../types';
// import the variants from their respective files e.g.
// import { signInGateVariant as example } from './example';
import { signInGateVariant as patientiaControl } from './patientia/control';
import { signInGateVariant as patientiaVariant } from './patientia/variant';
import { signInGateVariant as centesimusControl } from './centesimus/control';

// to add a variant, first import the variant in the SignInGateVariant type, and then add to this exported array
export const variants: Array<SignInGateVariant> = [
    // example,
    patientiaControl,
    patientiaVariant,
    centesimusControl,
];
