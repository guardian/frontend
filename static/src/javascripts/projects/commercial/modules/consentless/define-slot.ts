import type { PageTargeting } from '@guardian/commercial-core';
import { buildPageTargetingConsentless } from '@guardian/commercial-core';
import { onConsent } from '@guardian/consent-management-platform';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { renderConsentlessAdvertLabel } from './render-advert-label';

export type Label = {
	id: number;
	name: string;
	description: string;
	campaignId: number | null;
};

async function getAd(
	slot: HTMLElement,
	slotName: string,
	targeting: PageTargeting,
) {
	const targetingString = Object.entries(targeting)
		.map(([key, value]) => (value ? `${key}=${value.toString()}` : ''))
		.join('&');

	const res = await fetch(
		`http://localhost:3000/api/ads?slotName=${slotName}&${targetingString}`,
	);

	if (!res.ok) {
		return;
	}

	const { url, code } = (await res.json()) as {
		campaignId: number;
		url: string;
		code: string;
		labels: Label[];
	};

	if (url !== '') {
		// Image based creative
		const img = document.createElement('img');
		img.src = url;
		slot.appendChild(img);
	} else if (code !== '') {
		// Markup based creative
		slot.innerHTML = code;
	}
}

let targeting: PageTargeting | undefined = undefined;

const defineSlot = (slot: HTMLElement, slotName: string): void => {
	console.log('Define slot:', slot, slotName);

	void onConsent()
		.then((consentState) => {
			if (!targeting) {
				targeting = buildPageTargetingConsentless(
					consentState,
					commercialFeatures.adFree,
				);
			}
			return targeting;
		})
		.then((targeting) => {
			return getAd(slot, slotName, targeting).then(() => {
				return renderConsentlessAdvertLabel(slot);
			});
		});
};

export { defineSlot };
