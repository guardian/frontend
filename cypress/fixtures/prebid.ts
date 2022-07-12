export const bidderURLs = [
	'https://ib.adnxs.com/ut/v3/prebid',
	'https://htlb.casalemedia.com/cygnus**',
	'https://hbopenbid.pubmatic.com/translator?source=prebid-client',
	'https://prg.smartadserver.com/prebid/v1',
	'https://rtb.openx.net/sync/prebid**',
	'https://elb.the-ozone-project.com/openrtb2/auction',
	'https://bidder.criteo.com/cdb**',
	'https://pixel.adsafeprotected.com/services/pub**',
	'https://ad.360yield.com/pb',
];

export const wins = {
	criteo: {
		url: 'https://bidder.criteo.com/cdb',
		response: {
			slots: [
				{
					slotid: 'aa828aaaeb0341b391df49b390e8a10c',
					impid: 'dfp-ad--top-above-nav',
					arbitrageid: '62cd3b90efd188239809bc56ec098900',
					zoneid: 1171150,
					cpm: 45,
					currency: 'USD',
					width: 970,
					height: 250,
					creative: '<h1 data-cy="test-creative">Hello</h1>',
					video: false,
					deal: '',
					creativecode: '11096744',
					is_rewarded: false,
					paf_extension: { content_id: '' },
				},
			],
			exd: {
				slots: [
					{
						imp_id: 'aa828aaaeb0341b391df49b390e8a10c',
						ad_unit_id: 'dfp-ad--top-above-nav',
						zone_id: 1171150,
						is_dsc: true,
						enable_safeframe: false,
					},
				],
			},
			country_code: 'GB',
			ext: {},
		},
		targeting: {
			hb_format_criteo: 'banner',
			hb_size_criteo: '970x250',
			hb_pb_criteo: '45.00',
			hb_bidder_criteo: 'criteo',
			hb_format: 'banner',
			hb_size: '970x250',
			hb_pb: '45.00',
			hb_bidder: 'criteo',
		},
	},
};
