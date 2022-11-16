// Note on BrazeMessageInterface vs BrazeMessage:
// BrazeMessage is the actual class which we wrap messages in returned from the
// Braze SDK (in @guardian/braze-components). BrazeMessageInterface represents
// the public interface supplied by instances of that class. In the message
// forcing logic it's hard to create and return a BrazeMessage from the forced
// json. A better approach would probably be to change the code in
// @guardian/braze-components to return a BrazeMessageInterface (which an
// instance of BrazeMessage would conform to) and at least the type definitions
// would all live in one centralised place.
export interface BrazeMessageInterface {
	extras: Record<string, string> | undefined;
	logImpression: () => void;
	logButtonClick: (internalButtonId: number) => void;
}
