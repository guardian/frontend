import { getCookie, getLocale, isString, storage } from '@guardian/libs';
import type { CountryCode } from '@guardian/libs';
import config from './config';
import reportError from './report-error';

const editionToGeolocationMap: Record<string, CountryCode> = {
	UK: 'GB',
	US: 'US',
	AU: 'AU',
};

const editionToGeolocation = (editionKey = 'UK'): CountryCode =>
	editionToGeolocationMap[editionKey];

const countryCookieName = 'GU_geo_country';
const countryOverrideName = 'gu.geo.override';

let locale: CountryCode | null;

/*
   This method can be used as a non async way of getting the country code
   after init has been called. Returning locale should cover all/most
   of the cases but if a race condition happen or the cookie is not set,
   we keep fallbacks to cookie or geo from edition.
*/
const getCountryCode = (): CountryCode => {
	const pageEdition = config.get<string>('page.edition');

	const maybeCountryOverride = storage.local.get(
		countryOverrideName,
	) as unknown;
	const countryOverride = isString(maybeCountryOverride)
		? (maybeCountryOverride as CountryCode)
		: null;

	return (
		locale ??
		countryOverride ??
		(getCookie({
			name: countryCookieName,
			shouldMemoize: true,
		}) as CountryCode | null) ??
		editionToGeolocation(pageEdition)
	);
};

/*
    This method is to be used for dev purposes for example testing different RR banners
    across different countries. We keep the overridden country for 1 day into localStorage
*/
const overrideGeolocation = (geolocation: CountryCode | null): void => {
	const currentDate = new Date();
	storage.local.set(
		countryOverrideName,
		geolocation,
		currentDate.setDate(currentDate.getDate() + 1),
	);
	locale = geolocation;
};

const init = (): void => {
	getLocale()
		.then((countryCode) => {
			locale = countryCode;
		})
		.catch(() => {
			console.log(`Error getting location from libs/getLocale`);
			reportError(
				new Error(`Error getting location from libs/getLocale`),
				{},
				false,
			);
			locale = getCookie({
				name: countryCookieName,
				shouldMemoize: true,
			}) as CountryCode | null;
		});
};

/*
  Note: supportInternationalizationId should match an existing
  id from support-internationalisation library. We use it to
  communicate with the backend. Additionally, the list of countries
  should match the list in support-internationalisation.
 */

type CountryGroupId =
	| 'GBPCountries'
	| 'UnitedStates'
	| 'AUDCountries'
	| 'EURCountries'
	| 'NZDCountries'
	| 'Canada'
	| 'International';

type SupportInternationalisationId =
	| 'uk'
	| 'us'
	| 'au'
	| 'eu'
	| 'int'
	| 'nz'
	| 'ca';

type IsoCurrency = 'GBP' | 'USD' | 'AUD' | 'EUR' | 'NZD' | 'CAD';

type CountryGroup = {
	name: string;
	currency: IsoCurrency;
	countries: string[];
	supportInternationalisationId: SupportInternationalisationId;
};

const countryGroups: Record<CountryGroupId, CountryGroup> = {
	GBPCountries: {
		name: 'United Kingdom',
		currency: 'GBP',
		countries: ['GB', 'FK', 'GI', 'GG', 'IM', 'JE', 'SH'],
		supportInternationalisationId: 'uk',
	},
	UnitedStates: {
		name: 'United States',
		currency: 'USD',
		countries: ['US'],
		supportInternationalisationId: 'us',
	},
	AUDCountries: {
		name: 'Australia',
		currency: 'AUD',
		countries: ['AU', 'KI', 'NR', 'NF', 'TV'],
		supportInternationalisationId: 'au',
	},
	EURCountries: {
		name: 'Europe',
		currency: 'EUR',
		countries: [
			'AD',
			'AL',
			'AT',
			'BA',
			'BE',
			'BG',
			'BL',
			'CH',
			'CY',
			'CZ',
			'DE',
			'DK',
			'EE',
			'ES',
			'FI',
			'FO',
			'FR',
			'GF',
			'GL',
			'GP',
			'GR',
			'HR',
			'HU',
			'IE',
			'IT',
			'LI',
			'LT',
			'LU',
			'LV',
			'MC',
			'ME',
			'MF',
			'IS',
			'MQ',
			'MT',
			'NL',
			'NO',
			'PF',
			'PL',
			'PM',
			'PT',
			'RE',
			'RO',
			'RS',
			'SE',
			'SI',
			'SJ',
			'SK',
			'SM',
			'TF',
			'TR',
			'WF',
			'YT',
			'VA',
			'AX',
		],
		supportInternationalisationId: 'eu',
	},
	International: {
		name: 'International',
		currency: 'USD',
		countries: [
			'AE',
			'AF',
			'AG',
			'AI',
			'AM',
			'AO',
			'AQ',
			'AR',
			'AS',
			'AW',
			'AZ',
			'BB',
			'BD',
			'BF',
			'BH',
			'BI',
			'BJ',
			'BM',
			'BN',
			'BO',
			'BQ',
			'BR',
			'BS',
			'BT',
			'BV',
			'BW',
			'BY',
			'BZ',
			'CC',
			'CD',
			'CF',
			'CG',
			'CI',
			'CL',
			'CM',
			'CN',
			'CO',
			'CR',
			'CU',
			'CV',
			'CW',
			'CX',
			'DJ',
			'DM',
			'DO',
			'DZ',
			'EC',
			'EG',
			'EH',
			'ER',
			'ET',
			'FJ',
			'FM',
			'GA',
			'GD',
			'GE',
			'GH',
			'GM',
			'GN',
			'GQ',
			'GS',
			'GT',
			'GU',
			'GW',
			'GY',
			'HK',
			'HM',
			'HN',
			'HT',
			'ID',
			'IL',
			'IN',
			'IO',
			'IQ',
			'IR',
			'JM',
			'JO',
			'JP',
			'KE',
			'KG',
			'KH',
			'KM',
			'KN',
			'KP',
			'KR',
			'KW',
			'KY',
			'KZ',
			'LA',
			'LB',
			'LC',
			'LK',
			'LR',
			'LS',
			'LY',
			'MA',
			'MD',
			'MG',
			'MH',
			'MK',
			'ML',
			'MM',
			'MN',
			'MO',
			'MP',
			'MR',
			'MS',
			'MU',
			'MV',
			'MW',
			'MX',
			'MY',
			'MZ',
			'NA',
			'NC',
			'NE',
			'NG',
			'NI',
			'NP',
			'NU',
			'OM',
			'PA',
			'PE',
			'PG',
			'PH',
			'PK',
			'PN',
			'PR',
			'PS',
			'PW',
			'PY',
			'QA',
			'RU',
			'RW',
			'SA',
			'SB',
			'SC',
			'SD',
			'SG',
			'SL',
			'SN',
			'SO',
			'SR',
			'SS',
			'ST',
			'SV',
			'SX',
			'SY',
			'SZ',
			'TC',
			'TD',
			'TG',
			'TH',
			'TJ',
			'TK',
			'TL',
			'TM',
			'TN',
			'TO',
			'TT',
			'TW',
			'TZ',
			'UA',
			'UG',
			'UM',
			'UY',
			'UZ',
			'VC',
			'VE',
			'VG',
			'VI',
			'VN',
			'VU',
			'WS',
			'YE',
			'ZA',
			'ZM',
			'ZW',
		],
		supportInternationalisationId: 'int',
	},
	NZDCountries: {
		name: 'New Zealand',
		currency: 'NZD',
		countries: ['NZ', 'CK'],
		supportInternationalisationId: 'nz',
	},
	Canada: {
		name: 'Canada',
		currency: 'CAD',
		countries: ['CA'],
		supportInternationalisationId: 'ca',
	},
};

// These are the different 'country groups' we accept when taking payment.
// See https://github.com/guardian/support-internationalisation/blob/master/src/main/scala/com/gu/i18n/CountryGroup.scala for more context.
const countryCodeToCountryGroupId = (
	countryCode: CountryCode,
): CountryGroupId => {
	const availableCountryGroups = Object.keys(
		countryGroups,
	) as CountryGroupId[];
	const response = availableCountryGroups.find((countryGroup) =>
		countryGroups[countryGroup].countries.includes(countryCode),
	);
	return response ?? 'International';
};

const countryCodeToSupportInternationalisationId = (
	countryCode: CountryCode,
): string | string[] =>
	countryGroups[countryCodeToCountryGroupId(countryCode)]
		.supportInternationalisationId;

const extendedCurrencySymbol: Record<CountryGroupId, string> = {
	GBPCountries: '£',
	UnitedStates: '$',
	AUDCountries: '$',
	Canada: 'CA$',
	EURCountries: '€',
	NZDCountries: 'NZ$',
	International: '$',
};

const defaultCurrencySymbol = '£';

const getLocalCurrencySymbolSync = (): string =>
	extendedCurrencySymbol[countryCodeToCountryGroupId(getCountryCode())] ||
	defaultCurrencySymbol;

const getLocalCurrencySymbol = (geolocation: CountryCode): string =>
	extendedCurrencySymbol[countryCodeToCountryGroupId(geolocation)] ||
	defaultCurrencySymbol;

// A limited set of country names for the test to add country name in the epic copy
const countryNames: Record<string, string> = {
	GB: 'the UK',
	US: 'the US',
	AU: 'Australia',
	CA: 'Canada',
	DE: 'Germany',
	NZ: 'New Zealand',
	FR: 'France',
	NL: 'the Netherlands',
	IE: 'Ireland',
	SE: 'Sweden',
	CH: 'Switzerland',
	NO: 'Norway',
	BE: 'Belgium',
	IT: 'Italy',
	IN: 'India',
	ES: 'Spain',
	DK: 'Denmark',
	SG: 'Singapore',
	AT: 'Austria',
	FI: 'Finland',
	HK: 'Hong Kong',
	LU: 'Luxembourg',
	PT: 'Portugal',
	AE: 'the UAE',
	MX: 'Mexico',
	BR: 'Brazil',
	ZA: 'South Africa',
	TW: 'Taiwan',
	IL: 'Israel',
	JP: 'Japan',
	CZ: 'the Czech Republic',
	GR: 'Greece',
	IS: 'Iceland',
	TH: 'Thailand',
	MY: 'Malaysia',
	RO: 'Romania',
	PL: 'Poland',
	HU: 'Hungary',
	TR: 'Turkey',
	KR: 'Korea',
	SI: 'Slovenia',
	CL: 'Chile',
	CO: 'Colombia',
	QA: 'Qatar',
	HR: 'Croatia',
	SK: 'Slovakia',
	ID: 'Indonesia',
	VN: 'Vietnam',
	CN: 'China',
	MT: 'Malta',
	AR: 'Argentina',
	KE: 'Kenya',
	PR: 'Puerto Rico',
	RU: 'Russia',
	EE: 'Estonia',
	CR: 'Costa Rica',
	PA: 'Panama',
};

const getCountryName = (geolocation: string): string | undefined =>
	geolocation ? countryNames[geolocation] : undefined;

export {
	getCountryCode,
	countryCodeToCountryGroupId,
	countryCodeToSupportInternationalisationId,
	getLocalCurrencySymbolSync,
	getLocalCurrencySymbol,
	init,
	overrideGeolocation,
	extendedCurrencySymbol,
	getCountryName,
};

export const _ = {
	countryCookieName,
};
