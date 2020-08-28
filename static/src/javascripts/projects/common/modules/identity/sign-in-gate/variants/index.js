// @flow
import type { SignInGateVariant } from '../types';
// import the variants from their respective files e.g.
// import { signInGateVariant as example } from './example';
import { signInGateVariant as patientiaControl } from './patientia/control';
import { signInGateVariant as patientiaVariant } from './patientia/variant';
import { signInGateVariant as mainVariant } from './main/variant';
import { signInGateVariant as mainControl } from './main/control';
import { signInGateVariant as dismissWindowControl } from './dismiss-window/control';
import { signInGateVariant as dismissWindowVariant1Article } from './dismiss-window/variant-1-article';
import { signInGateVariant as dismissWindowVariant2Day } from './dismiss-window/variant-2-day';

// to add a variant, first import the variant in the SignInGateVariant type, and then add to this exported array
export const variants: Array<SignInGateVariant> = [
    // example,
    patientiaControl,
    patientiaVariant,
    mainVariant,
    mainControl,
    dismissWindowControl,
    dismissWindowVariant1Article,
    dismissWindowVariant2Day,
];
