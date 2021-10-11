import {
	clearHasCurrentBrazeUser,
	hasCurrentBrazeUser,
	setHasCurrentBrazeUser,
} from './hasCurrentBrazeUser';

beforeEach(clearHasCurrentBrazeUser);

describe('hasCurrentBrazeUser', () => {
	it('hasCurrentBrazeUser returns false when not set', () => {
		const got = hasCurrentBrazeUser();

		expect(got).toEqual(false);
	});

	it('hasCurrentBrazeUser returns true when set', () => {
		setHasCurrentBrazeUser();

		const got = hasCurrentBrazeUser();

		expect(got).toEqual(true);
	});

	it('clearHasCurrentBrazeUser unsets the value', () => {
		setHasCurrentBrazeUser();
		clearHasCurrentBrazeUser();

		const got = hasCurrentBrazeUser();

		expect(got).toEqual(false);
	});
});
