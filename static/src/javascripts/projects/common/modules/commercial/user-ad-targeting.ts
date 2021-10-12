import { isObject, isString, storage } from '@guardian/libs';
import { getUserFromApi, getUserFromCookie } from '../identity/api';

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

const requestUserSegmentsFromId = (): void => {
	if (
		storage.local.isAvailable() &&
		storage.local.get(userSegmentsKey) === null &&
		getUserFromCookie()
	) {
		getUserFromApi((user) => {
			if (user?.adData) {
				const userSegments: string[] = [];
				Object.keys(user.adData).forEach((key) => {
					userSegments.push(key + String(user.adData[key]));
				});
				const segmentsData: SegmentsData = {
					segments: userSegments,
					userHash: user.id % 9999,
				};

				const ONE_DAY_MS = 24 * 60 * 60 * 1000;

				storage.local.set(
					userSegmentsKey,
					segmentsData,
					new Date().getTime() + ONE_DAY_MS,
				);
			}
		});
	}
};

export { getUserSegments, requestUserSegmentsFromId };
