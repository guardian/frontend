// @flow
import type { SignInGateVariant } from '../types';
import { signInGateVariant as control } from './control';
import { signInGateVariant as variant } from './variant';

export const variants: Array<SignInGateVariant> = [control, variant];
