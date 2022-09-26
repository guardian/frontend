import config from '../../../../lib/config';
import { isInAuOrNz } from '../../../common/modules/commercial/geo-utils';

// NOLCMB is a global function defined by the IMR worldwide library

const guMetadata: Record<string, string> = {
	books: 'P5033A084-E9BF-453A-91D3-C558751D9A85',
	business: 'P5B109609-6223-45BA-B052-55F34A79D7AD',
	commentisfree: 'PA878EFC7-93C8-4352-905E-9E03883FD6BD',
	artanddesign: 'PE5076E6F-B85D-4B45-9536-F150EF3FC853',
	culture: 'PE5076E6F-B85D-4B45-9536-F150EF3FC853',
	stage: 'PE5076E6F-B85D-4B45-9536-F150EF3FC853',
	education: 'P4A01DB74-5B97-435A-89F0-C07EA2C739EC',
	environment: 'P2F34A388-A280-4C3F-AF43-FAF16EFCB7B1',
	cities: 'P2F34A388-A280-4C3F-AF43-FAF16EFCB7B1',
	'global-development': 'P2F34A388-A280-4C3F-AF43-FAF16EFCB7B1',
	'sustainable-business': 'P2F34A388-A280-4C3F-AF43-FAF16EFCB7B1',
	fashion: 'PCF345621-F34D-40B2-852C-6223C9C8F1E2',
	film: 'P878ECFA5-14A7-4038-9924-3696C93706FC',
	law: 'P1FA129DD-9B9E-49BB-98A4-AA7ED8523DFD',
	lifeandstyle: 'PCFE04250-E5F6-48C7-91DB-5CED6854818C',
	media: 'P1434DC6D-6585-4932-AE17-2864CD0AAE99',
	money: 'PB71E7F1E-F231-4F73-9CC8-BE8822ADD0C2',
	music: 'P78382DEE-CC9B-4B36-BD27-809007BFF300',
	international: 'P505182AA-1D71-49D8-8287-AA222CD05424',
	au: 'P505182AA-1D71-49D8-8287-AA222CD05424',
	'australia-news': 'P505182AA-1D71-49D8-8287-AA222CD05424',
	uk: 'P505182AA-1D71-49D8-8287-AA222CD05424',
	'uk-news': 'P505182AA-1D71-49D8-8287-AA222CD05424',
	us: 'P505182AA-1D71-49D8-8287-AA222CD05424',
	'us-news': 'P505182AA-1D71-49D8-8287-AA222CD05424',
	world: 'P505182AA-1D71-49D8-8287-AA222CD05424',
	politics: 'P5B7468E3-CE04-40FD-9444-22FB872FE83E',
	careers: 'P3637DC6B-E43C-4E92-B22C-3F255CC573DA',
	'culture-professionals-network': 'P3637DC6B-E43C-4E92-B22C-3F255CC573DA',
	'global-development-professionals-network':
		'P3637DC6B-E43C-4E92-B22C-3F255CC573DA',
	'government-computing-network': 'P3637DC6B-E43C-4E92-B22C-3F255CC573DA',
	'guardian-professional': 'P3637DC6B-E43C-4E92-B22C-3F255CC573DA',
	'healthcare-network': 'P3637DC6B-E43C-4E92-B22C-3F255CC573DA',
	'higher-education-network': 'P3637DC6B-E43C-4E92-B22C-3F255CC573DA',
	'housing-network': 'P3637DC6B-E43C-4E92-B22C-3F255CC573DA',
	'local-government-network': 'P3637DC6B-E43C-4E92-B22C-3F255CC573DA',
	'local-leaders-network': 'P3637DC6B-E43C-4E92-B22C-3F255CC573DA',
	'public-leaders-network': 'P3637DC6B-E43C-4E92-B22C-3F255CC573DA',
	'small-business-network': 'P3637DC6B-E43C-4E92-B22C-3F255CC573DA',
	'social-care-network': 'P3637DC6B-E43C-4E92-B22C-3F255CC573DA',
	'teacher-network': 'P3637DC6B-E43C-4E92-B22C-3F255CC573DA',
	'voluntary-sector-network': 'P3637DC6B-E43C-4E92-B22C-3F255CC573DA',
	'women-in-leadership': 'P3637DC6B-E43C-4E92-B22C-3F255CC573DA',
	science: 'PDAD6BC22-C97B-4151-956B-7F069B2C56E9',
	society: 'P7AF4A592-96FB-4255-B33F-352406F4C7D2',
	sport: 'PCC1AEBB6-7D1A-4F34-8256-EFC314E5D0C3',
	football: 'PCC1AEBB6-7D1A-4F34-8256-EFC314E5D0C3',
	technology: 'P29EF991A-3FEE-4215-9F03-58EACA8286B9',
	travel: 'PD1CEDC3E-2653-4CB6-A4FD-8A315DE07548',
	'tv-and-radio': 'P66E48909-8FC9-49E8-A7E6-0D31C61805AD',
	'brand-only': 'P0EE0F4F4-8D7C-4082-A2A4-82C84728DC59',
};

const onLoad = (): void => {
	const sectionFromMeta = config
		.get<string>('page.section', '')
		.toLowerCase();
	const subBrandApId =
		guMetadata[sectionFromMeta] || guMetadata['brand-only'];

	const sectionRef =
		sectionFromMeta in guMetadata
			? sectionFromMeta
			: 'The Guardian - brand only';

	const nolggGlobalParams = {
		sfcode: 'dcr',
		apid: subBrandApId,
		apn: 'theguardian',
	};

	const nSdkInstance = window.NOLCMB.getInstance(nolggGlobalParams.apid);
	nSdkInstance.ggInitialize(nolggGlobalParams);

	const dcrStaticMetadata = {
		type: 'static',
		assetid: config.get('page.pageId'),
		section: sectionRef,
	};

	nSdkInstance.ggPM('staticstart', dcrStaticMetadata);
};

export const imrWorldwide = {
	shouldRun:
		config.get<boolean>('switches.imrWorldwide', false) && isInAuOrNz(),
	url: '//secure-dcr.imrworldwide.com/novms/js/2/ggcmb510.js',
	onLoad,
};
