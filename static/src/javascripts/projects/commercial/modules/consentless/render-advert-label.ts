/**
 * WARNING!
 * Commercial client side code has moved to: https://github.com/guardian/commercial
 * This file should be considered deprecated and only exists for legacy 'hosted' pages
 */

/* eslint-disable @typescript-eslint/no-misused-promises
-- Fastdom measure and mutate signatures are Promise<void>
-- Nested fastdom measure-mutate promises throw the error:
-- "Promise returned in function argument where a void return was expected"
*/

import crossIcon from 'svgs/icon/cross.svg';
import fastdom from '../../../../lib/fastdom-promise';
import { shouldRenderLabel } from '../dfp/render-advert-label';

export const createAdCloseDiv = (): HTMLElement => {
	const closeDiv: HTMLElement = document.createElement('button');
	closeDiv.className = 'ad-slot__close-button';
	closeDiv.innerHTML = crossIcon.markup;
	closeDiv.onclick = () => {
		const container: HTMLElement | null = closeDiv.closest(
			'.mobilesticky-container',
		);
		if (container) container.remove();
	};
	return closeDiv;
};

export const renderConsentlessAdvertLabel = (
	adSlotNode: HTMLElement,
): Promise<Promise<void>> => {
	return fastdom.measure(() => {
		if (shouldRenderLabel(adSlotNode)) {
			//Assigning the ad label text like this allows us to conditionally add extra text to it
			//eg. for the ad test labelling for google ads
			const adLabelContent = `Advertisement`;
			return fastdom.mutate(() => {
				//when the time comes to use a different ad label for consentless, we can update
				//the attribute name that we set below and add a css selector accordingly
				adSlotNode.setAttribute('data-label-show', 'true');
				adSlotNode.setAttribute('ad-label-text', adLabelContent);
			});
		}
		return Promise.resolve();
	});
};

// TODO: flesh out this function once we have a better idea of what we want it to look like
// const insertConsentlessLabelInfo = (adLabelNode: HTMLElement): void => {
// 	const consentlessLabelInfo = document.createElement('button');
// 	consentlessLabelInfo.className = 'ad-slot__consentless-info u-button-reset';
// 	consentlessLabelInfo.setAttribute(
// 		'title',
// 		`Because of your choice this advertising sets no cookies and doesn't track you.`,
// 	);
// 	consentlessLabelInfo.innerHTML = `Opt Out: Why am I seeing this?`;
// 	adLabelNode.appendChild(consentlessLabelInfo);
// };
