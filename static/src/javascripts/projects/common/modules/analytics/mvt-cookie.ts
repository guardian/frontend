import { getCookie, setCookie } from '@guardian/libs';

const MULTIVARIATE_ID_COOKIE = 'GU_mvt_id';
const MVT_ID_RANGE = {
	min: 1,
	max: 1_000_000,
} as const;

const overwriteMvtCookie = (testId: number): void =>
	setCookie({
		name: MULTIVARIATE_ID_COOKIE,
		value: String(testId),
		daysToLive: 365,
	});

/**
 *
 * @returns a `number` in the [1 - 1,000,000] range if the cookie is set.
 * @returns `null` if the cookie is not set.
 */
export const getMvtValue = (): number | null => {
	const cookieId = parseInt(
		getCookie({ name: MULTIVARIATE_ID_COOKIE, shouldMemoize: true }) ??
			'NaN',
		10,
	);

	return Number.isNaN(cookieId)
		? null
		: Math.max(Math.min(cookieId, MVT_ID_RANGE.max), MVT_ID_RANGE.min);
};

/**
 * For test purposes only.
 *
 * Since it's set by Fastly, sometimes it's not set in dev,
 * but it's needed for certain A/B tests to work properly.
 */
export const initMvtCookie = (): void => {
	if (!getCookie({ name: MULTIVARIATE_ID_COOKIE, shouldMemoize: false })) {
		setCookie({
			name: MULTIVARIATE_ID_COOKIE,
			value: String(MVT_ID_RANGE.min),
		});
	}
};

export const incrementMvtCookie = (): void => {
	const mvtId = getMvtValue();
	if (mvtId) {
		if (mvtId === MVT_ID_RANGE.max) {
			// Wrap back to 1 if it would exceed the max
			overwriteMvtCookie(MVT_ID_RANGE.min);
		} else {
			overwriteMvtCookie(mvtId + 1);
		}
	}
};

export const decrementMvtCookie = (): void => {
	const mvtId = getMvtValue();
	if (mvtId) {
		if (mvtId === MVT_ID_RANGE.min) {
			// Wrap back to max if it would be less than 1
			overwriteMvtCookie(MVT_ID_RANGE.max);
		} else {
			overwriteMvtCookie(mvtId - 1);
		}
	}
};

export const getMvtNumValues = (): 1_000_000 => MVT_ID_RANGE.max;

export const _ = {
	overwriteMvtCookie,
};
