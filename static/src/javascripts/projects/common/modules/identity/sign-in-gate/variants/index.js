// @flow
import type { SignInGateVariant } from '../types';
// import the variants from their respective files e.g.
// import { signInGateVariant as example } from './example';
import { signInGateVariant as patientiaControl } from './patientia/control';
import { signInGateVariant as patientiaVariant } from './patientia/variant';
import { signInGateVariant as mainVariant } from './main/variant';
import { signInGateVariant as mainControl } from './main/control';
import { signInGateVariant as pageviewVariant1 } from './pageview/variant-1';
import { signInGateVariant as pageviewVariant2 } from './pageview/variant-2';
import { signInGateVariant as pageviewVariant3 } from './pageview/variant-3';
import { signInGateVariant as pageviewVariant4 } from './pageview/variant-4';

// to add a variant, first import the variant in the SignInGateVariant type, and then add to this exported array
export const variants: Array<SignInGateVariant> = [
    // example,
    patientiaControl,
    patientiaVariant,
    mainVariant,
    mainControl,
    pageviewVariant1,
    pageviewVariant2,
    pageviewVariant3,
    pageviewVariant4,
];
