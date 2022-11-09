import type { PageTargeting } from '@guardian/commercial-core';
import { buildPageTargetingConsentless } from '@guardian/commercial-core';
import { onConsent } from '@guardian/consent-management-platform';
import { commercialFeatures } from 'common/modules/commercial/commercial-features';
import { renderConsentlessAdvertLabel } from './render-advert-label';

// https://stackoverflow.com/a/41889348 (ish)
function resizeIframe(iframe: HTMLIFrameElement) {
	iframe.style.width = '100%';
	const scrollHeight = iframe.contentWindow?.document.body.offsetHeight;

	if (scrollHeight && scrollHeight < window.innerHeight) {
		iframe.height = `${scrollHeight}px`;
	} else {
		iframe.height = `${window.innerHeight}px`;
	}
}

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
		`http://localhost:3032/api/ads?slotName=${slotName}&${targetingString}`,
	);

	if (!res.ok) {
		return;
	}

	const { url, code, labels } = (await res.json()) as {
		campaignId: number;
		url: string;
		code: string;
		labels: Label[];
	};

	const labelSet = new Set(labels.map((label) => label.name));
	const isFluid = labelSet.has('fluid');
	const useSrc = labelSet.has('use-iframe-src');
	const noAdLabel = labelSet.has('no-ad-label');

	if (url !== '') {
		// Image based creative
		const img = document.createElement('img');
		img.src = url;
		slot.appendChild(img);
	} else if (code !== '') {
		// Markup based creative
		const iframe = document.createElement('iframe');

		if (useSrc) {
			iframe.src = code;
		} else {
			iframe.srcdoc = code;
		}

		if (isFluid) {
			iframe.onload = () => {
				resizeIframe(iframe);
			};
		}
		slot.appendChild(iframe);
	}

	return { noAdLabel };
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
			// Attach additional slot-level targeting (but do not cache this)
			return { ...targeting, slot: slot.id };
		})
		.then((targeting) => {
			return getAd(slot, slotName, targeting).then((props) => {
				if (!props?.noAdLabel) {
					return renderConsentlessAdvertLabel(slot);
				}
			});
		});
};

export { defineSlot };
