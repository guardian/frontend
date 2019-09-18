// @flow
import fetchJSON from 'lib/fetch-json';
import config from 'lib/config';

export const epicControlGoogleDocUrl: string =
    'https://interactive.guim.co.uk/docsdata/1fy0JolB1bf1IEFLHGHfUYWx-niad7vR9K954OpTOvjE.json';
export const bannerControlGoogleDocUrl: string =
    'https://interactive.guim.co.uk/docsdata/1CIHCoe87hyPHosXx1pYeVUoohvmIqh9cC_kNlV-CMHQ.json';
export const bannerMultipleTestsGoogleDocUrl: string = config.get('page.isDev')
    ? 'https://interactive.guim.co.uk/docsdata-test/19AGJYaPL8XpchykYlzqdKqNHxrHBILFktzM8vc5iShc.json'
    : 'https://interactive.guim.co.uk/docsdata/1IEVVHU5ZObCzyPV-BLQczaSzxe7pawLcH8_lvFD0Csk.json';

export const getGoogleDoc = (url: string): Promise<any> =>
    fetchJSON(url, { mode: 'cors' });

export const getSheetFromGoogleDoc = (
    url: string,
    sheet: string
): Promise<any> => getGoogleDoc(url).then(json => json.sheets[sheet]);

// It is the responsibility of any calling code to .catch() when using these promises.
export const getEpicControlFromGoogleDoc = (): Promise<any> =>
    getSheetFromGoogleDoc(epicControlGoogleDocUrl, 'control');

export const getEngagementBannerControlFromGoogleDoc = (): Promise<any> =>
    getSheetFromGoogleDoc(bannerControlGoogleDocUrl, 'control');
