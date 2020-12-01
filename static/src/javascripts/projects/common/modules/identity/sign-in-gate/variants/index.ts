
import { SignInGateVariant } from "../types";
// import the variants from their respective files e.g.
// import { signInGateVariant as example } from './example';
import { signInGateVariant as mainVariant } from "./main/variant";
import { signInGateVariant as mainControl } from "./main/control";

// to add a variant, first import the variant in the SignInGateVariant type, and then add to this exported array
export const variants: Array<SignInGateVariant> = [// example,
mainVariant, mainControl];