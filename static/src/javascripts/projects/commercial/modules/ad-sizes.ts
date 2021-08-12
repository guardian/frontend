type SizeKeys =
	| 'billboard'
	| 'leaderboard'
	| 'mpu'
	| 'halfPage'
	| 'portrait'
	| 'skyscraper'
	| 'mobilesticky'
	| 'fluid'
	| 'outOfPage'
	| 'googleCard'
	| 'video'
	| 'outstreamDesktop'
	| 'outstreamGoogleDesktop'
	| 'outstreamMobile'
	| 'merchandisingHighAdFeature'
	| 'merchandisingHigh'
	| 'merchandising'
	| 'inlineMerchandising'
	| 'fabric'
	| 'empty'
	| '970x250'
	| '728x90'
	| '300x250'
	| '300x600'
	| '300x1050'
	| '160x600';

const getAdSize = (width: number, height: number): GuAdSize => {
	const toString = (): GuAdSizeString =>
		width === 0 && height === 0
			? 'fluid'
			: (`${width},${height}` as `${number},${number}`);

	return Object.freeze({
		width,
		height,
		toString,
	});
};

/*

    mark: 1b109a4a-791c-4214-acd2-2720d7d9f96f

    The ad sizes which are hardcoded here are also hardcoded in the source code of
    dotcom-rendering.

    If/when this file is modified, please make sure that updates, if any, are reported to DCR.

 */

const adSizesPartial = {
	// standard ad sizes
	billboard: getAdSize(970, 250),
	leaderboard: getAdSize(728, 90),
	mpu: getAdSize(300, 250),
	halfPage: getAdSize(300, 600),
	portrait: getAdSize(300, 1050),
	skyscraper: getAdSize(160, 600),
	mobilesticky: getAdSize(320, 50),

	// dfp proprietary ad sizes
	fluid: getAdSize(0, 0),
	outOfPage: getAdSize(1, 1),
	googleCard: getAdSize(300, 274),

	// guardian proprietary ad sizes
	video: getAdSize(620, 1),
	outstreamDesktop: getAdSize(620, 350),
	outstreamGoogleDesktop: getAdSize(550, 310),
	outstreamMobile: getAdSize(300, 197),
	merchandisingHighAdFeature: getAdSize(88, 89),
	merchandisingHigh: getAdSize(88, 87),
	merchandising: getAdSize(88, 88),
	inlineMerchandising: getAdSize(88, 85),
	fabric: getAdSize(88, 71),
	empty: getAdSize(2, 2),
};

const adSizes: Record<SizeKeys, GuAdSize> = {
	...adSizesPartial,
	'970x250': adSizesPartial.billboard,
	'728x90': adSizesPartial.leaderboard,
	'300x250': adSizesPartial.mpu,
	'300x600': adSizesPartial.halfPage,
	'300x1050': adSizesPartial.portrait,
	'160x600': adSizesPartial.skyscraper,
};

export { adSizes };
