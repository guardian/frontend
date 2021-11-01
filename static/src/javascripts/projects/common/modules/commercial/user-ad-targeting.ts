import { isObject, isString, storage } from '@guardian/libs';
import { getUserFromCookie } from '../identity/api';

const userSegmentsKey = 'gu.ads.userSegmentsData';

type SegmentsData = {
	segments: string | string[];
	userHash: number;
};

const isValidSegmentData = (data: unknown): data is SegmentsData => {
	if (
		isObject(data) &&
		typeof data.userHash === 'number' &&
		(isString(data.segments) ||
			(Array.isArray(data.segments) && data.segments.every(isString)))
	) {
		return true;
	}
	return false;
};

const getUserSegments = (adConsentState: boolean | null): string | string[] => {
	if (storage.local.isAvailable() && adConsentState !== false) {
		const userSegmentsData: unknown =
			storage.local.get(userSegmentsKey) ?? null;

		if (isValidSegmentData(userSegmentsData)) {
			const userCookieData = getUserFromCookie();

			if (
				userCookieData &&
				userSegmentsData.userHash === userCookieData.id % 9999
			) {
				return userSegmentsData.segments;
			}
			storage.local.remove(userSegmentsKey);
		}
	}

	return [];
};

export { getUserSegments };
