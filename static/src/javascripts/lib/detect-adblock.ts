const getAdblockInUse = async (): Promise<boolean> => {
	if (window.guardian.config.isDotcomRendering) {
		return false;
	}
	return new Promise((resolve) => {
		if (window.guardian.adBlockers.active) {
			// adblock detection has completed
			resolve(window.guardian.adBlockers.active);
		} else {
			// Push a listener for when the JS loads
			window.guardian.adBlockers.onDetect.push(resolve);
		}
	});
};

const adblockInUse = getAdblockInUse();

export { adblockInUse };
