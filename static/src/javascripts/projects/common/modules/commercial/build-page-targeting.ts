/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated
 */

import type { PageTargeting } from '@guardian/commercial';
import { buildPageTargeting } from '@guardian/commercial';
import type { ConsentState } from '@guardian/libs';
import { isString, log } from '@guardian/libs';
import { once } from 'lodash-es';
import { getSynchronousParticipations } from 'common/modules/experiments/ab';
import { commercialFeatures } from './commercial-features';

/**
 * Cleans an object for targetting. Removes empty strings and other falsey values.
 * @param o object with falsey values
 * @returns {Record<string, string | string[]>} object with only non-empty strings, or arrays of non-empty strings.
 */
export const removeFalseyValues = <O extends Record<string, unknown>>(
	o: O,
): Record<string, string | string[]> =>
	Object.entries(o).reduce<Record<string, string | string[]>>(
		(prev, curr) => {
			const [key, val] = curr;
			if (!val) return prev;

			if (isString(val)) {
				prev[key] = val;
			}
			if (
				Array.isArray(val) &&
				val.length > 0 &&
				val.some(Boolean) &&
				val.every(isString)
			) {
				prev[key] = val.filter(Boolean);
			}

			return prev;
		},
		{},
	);

const formatAppNexusTargeting = (obj: Record<string, string | string[]>) => {
	const asKeyValues = Object.entries(obj).map((entry) => {
		const [key, value] = entry;
		return Array.isArray(value)
			? value.map((nestedValue) => `${key}=${nestedValue}`)
			: `${key}=${value}`;
	});

	const flattenDeep = Array.prototype.concat.apply([], asKeyValues);
	return flattenDeep.join(',');
};

const buildAppNexusTargetingObject = once(
	(pageTargeting: PageTargeting): Record<string, string | string[]> =>
		removeFalseyValues({
			sens: pageTargeting.sens,
			pt1: pageTargeting.url,
			pt2: pageTargeting.edition,
			pt3: pageTargeting.ct,
			pt4: pageTargeting.p,
			pt5: pageTargeting.k,
			pt6: pageTargeting.su,
			pt7: pageTargeting.bp,
			pt9: [pageTargeting.pv, pageTargeting.co, pageTargeting.tn].join(
				'|',
			),
			permutive: pageTargeting.permutive,
		}),
);

const buildAppNexusTargeting = once((pageTargeting: PageTargeting): string =>
	formatAppNexusTargeting(buildAppNexusTargetingObject(pageTargeting)),
);

const getPageTargeting = (consentState: ConsentState): PageTargeting => {
	const { page } = window.guardian.config;

	const pageTargeting = buildPageTargeting({
		adFree: commercialFeatures.adFree,
		clientSideParticipations: getSynchronousParticipations(),
		consentState,
	});

	// third-parties wish to access our page targeting, before the googletag script is loaded.
	page.appNexusPageTargeting = buildAppNexusTargeting(pageTargeting);

	// This can be removed once we get sign-off from third parties who prefer to use appNexusPageTargeting.
	page.pageAdTargeting = pageTargeting;

	log('commercial', 'pageTargeting object:', pageTargeting);

	return pageTargeting;
};

export {
	getPageTargeting,
	buildAppNexusTargeting,
	buildAppNexusTargetingObject,
};
