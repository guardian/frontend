export const pubmatic = function (bid, data, acEnabled, utils, defaultFn) {
	if (defaultFn) {
		// keep this to move to default function once supported by RTD submodule
		bid = defaultFn(bid, data, acEnabled);
	} else {
		let segments = [];

		// add all user segments
		try {
			segments = JSON.parse(localStorage._psegs || '[]');
		} catch (e) {}

		// add AC specific segments (these would typically go to a separate key-value, but not sure if we can have 2 lists of segments here?)
		if (acEnabled && data.ac && data.ac.length > 0) {
			segments = segments.concat(data.ac);
		}

		segments = segments.map(function (seg) {
			return { id: seg };
		});

		pbjs.setBidderConfig({
			// Note this will replace existing bidder FPD config till merge is supported.
			bidders: ['pubmatic'],
			config: {
				ortb2: {
					user: {
						data: [
							{
								name: 'permutive.com',
								segment: segments,
							},
						],
					},
				},
			},
		});
	}
};
