import { loadScript } from '@guardian/libs';
import fastdom from '../../../../lib/fastdom-promise';

/**
 * Insert styling necessary for Opt-Out served safeframes.
 *
 * We insert these dynamically to ensure they are applied across all platforms
 * and only when in the variant of the consentless test. This could be revisited
 * in the future, and whether we can apply these styles server-side.
 *
 */
const insertSafeframeStyles = (): Promise<void> => {
	const css = `
		.iab_sf {
			margin: auto;
		}
	`;

	const style = document.createElement('style');
	style.appendChild(document.createTextNode(css));

	return fastdom.mutate(() => {
		document.head.appendChild(style);
	});
};

const initSafeframes = async (): Promise<void> => {
	const safeframeScripts = [
		'//cdn.optoutadvertising.com/script/sf/base.min.js',
		'//cdn.optoutadvertising.com/script/sf/boot.min.js',
		'//cdn.optoutadvertising.com/script/sf/host.min.js',
	];

	// These scripts must be loaded in the order set out above
	// Hence why we await loading one before loading the next
	for (const script of safeframeScripts) {
		await loadScript(script);
	}

	window.conf = new window.$sf.host.Config({
		renderFile: 'https://cdn.optoutadvertising.com/script/sf/r.html',
		positions: {},
	});

	void insertSafeframeStyles();
};

export { initSafeframes };
