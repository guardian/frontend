// Pubmatic custom override script
// from gist.github.com/abhinavsinha001/de46bd4ac4f02d98eb50c1f4f995545e

export const pubmatic = function (bid, data, acEnabled, utils, defaultFn) {
	if (defaultFn) {
		// keep this to move to default function once supported by RTD submodule
		bid = defaultFn(bid, data, acEnabled);
	} else {
		let segments = [];

		// add all user segments
		try {
			const psegs = JSON.parse(localStorage._psegs || '[]').map(String);
			const ppam = JSON.parse(localStorage._ppam || '[]');
			const pcrprs = JSON.parse(localStorage._pcrprs || '[]');

			segments = [...psegs, ...ppam, ...pcrprs];
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
