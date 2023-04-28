/**
 * This file is deprecated. Only used for legacy “Hosted” pages
 */

import { reportError } from 'lib/report-error';
import { catchErrorsWithContext } from 'lib/robust';
import type { Modules } from './types';

const errorTags = {
	feature: 'commercial',
	bundle: 'hosted',
};

const loadModules = async () => {
	const modules: Modules = [];

	if (!window.guardian.config.page.isHosted) return; // should never happen

	const hostedAbout = await import(
		/* webpackChunkName: "hosted" */
		'commercial/modules/hosted/about'
	);
	const initHostedVideo = await import(
		/* webpackChunkName: "hosted" */
		'commercial/modules/hosted/video'
	);
	const hostedGallery = await import(
		/* webpackChunkName: "hosted" */
		'commercial/modules/hosted/gallery'
	);
	const initHostedCarousel = await import(
		/* webpackChunkName: "hosted" */
		'commercial/modules/hosted/onward-journey-carousel'
	);
	const loadOnwardComponent = await import(
		/* webpackChunkName: "hosted" */
		'commercial/modules/hosted/onward'
	);

	modules.push(
		['cm-hostedAbout', hostedAbout.init],
		['cm-hostedVideo', initHostedVideo.initHostedVideo],
		['cm-hostedGallery', hostedGallery.init],
		['cm-hostedOnward', loadOnwardComponent.loadOnwardComponent],
		['cm-hostedOJCarousel', initHostedCarousel.initHostedCarousel],
	);

	const modulePromises: Array<Promise<unknown>> = [];

	modules.forEach((module) => {
		const [moduleName, moduleInit] = module;
		catchErrorsWithContext(
			[
				[
					moduleName,
					function pushAfterComplete(): void {
						const result = moduleInit();
						modulePromises.push(result);
					},
				],
			],
			errorTags,
		);
	});

	return Promise.all(modulePromises);
};

export const bootCommercial = (): Promise<unknown> => {
	return loadModules().catch((err) => {
		// report async errors in bootCommercial to Sentry with the commercial feature tag
		reportError(err, errorTags, false);
	});
};
