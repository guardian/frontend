// @flow
import fetchJSON from 'lib/fetch-json';
import config from 'lib/config';
import { local as storage } from 'lib/storage';

const storageKey = 'gu.geolocation';
const editionToGeolocationMap = {
    UK: 'GB',
    US: 'US',
    AU: 'AU',
};
const daysBeforeGeolocationRefresh = 10;

const getFromStorage = (): string => storage.get(storageKey);

const get = (): Promise<string> =>
    new Promise((resolve, reject) => {
        const geolocationFromStorage = getFromStorage();

        if (geolocationFromStorage) {
            return resolve(geolocationFromStorage);
        }

        fetchJSON('/geolocation', {
            mode: 'cors',
        })
            .then(response => {
                if (response.country) {
                    resolve(response.country);
                } else {
                    reject(new Error('No country in geolocation response'));
                }
            })
            .catch(reject);
    });

const setGeolocation = (geolocation: string): void => {
    const currentDate = new Date();
    storage.set(storageKey, geolocation, {
        expires: currentDate.setDate(
            currentDate.getDate() + daysBeforeGeolocationRefresh
        ),
    });
};

const init = (): void => {
    get().then(setGeolocation);
};

const editionToGeolocation = (editionKey: string = 'UK'): string =>
    editionToGeolocationMap[editionKey];

const getSync = (): string => {
    const geolocationFromStorage = getFromStorage();
    return (
        geolocationFromStorage ||
        editionToGeolocation(config.get('page.edition'))
    );
};

export type CountryGroupId =
    | 'GBPCountries'
    | 'UnitedStates'
    | 'AUDCountries'
    | 'EURCountries'
    | 'International'
    | 'NZDCountries'
    | 'Canada';

export type SupportInternationalisationId =
    | 'uk'
    | 'us'
    | 'au'
    | 'eu'
    | 'int'
    | 'nz'
    | 'ca';

/*
  Note: supportInternationalizationId should match an existing
  id from support-internationalisation library. We use it to
  communicate with the backend. Additionally, the list of countries
  should match the list in support-internationalisation.
 */

export type IsoCurrency = 'GBP' | 'USD' | 'AUD' | 'EUR' | 'NZD' | 'CAD';

export type CountryGroup = {
    name: string,
    currency: IsoCurrency,
    countries: string[],
    supportInternationalisationId: SupportInternationalisationId,
};

type CountryGroups = {
    [CountryGroupId]: CountryGroup,
};

const countryGroups: CountryGroups = {
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
const countryCodeToCountryGroupId = (countryCode: string): CountryGroupId => {
    const availableCountryGroups = Object.keys(countryGroups);
    let response = null;
    availableCountryGroups.forEach(countryGroup => {
        if (countryGroups[countryGroup].countries.includes(countryCode)) {
            response = countryGroup;
        }
    });
    return response || 'International';
};

const countryCodeToSupportInternationalisationId = (
    countryCode: string
): SupportInternationalisationId =>
    countryGroups[countryCodeToCountryGroupId(countryCode)]
        .supportInternationalisationId;

const extendedCurrencySymbol = {
    GBPCountries: '£',
    UnitedStates: '$',
    AUDCountries: '$',
    Canada: 'CA$',
    EURCountries: '€',
    NZDCountries: 'NZ$',
    International: '$',
};

const getLocalCurrencySymbol = (): string =>
    extendedCurrencySymbol[countryCodeToCountryGroupId(getSync())] || '£';

// A limited set of country names for the test to add country name in the epic copy
const countryNames = {
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
};

export {
    get,
    countryCodeToCountryGroupId,
    countryCodeToSupportInternationalisationId,
    getFromStorage,
    getSync,
    getLocalCurrencySymbol,
    init,
    setGeolocation,
    extendedCurrencySymbol,
    countryNames,
};
