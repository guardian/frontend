import { loadScript } from '@guardian/libs';

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
};

export { initSafeframes };
