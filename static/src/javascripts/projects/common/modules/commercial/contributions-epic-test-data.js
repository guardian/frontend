// @flow
import fetchJSON from 'lib/fetch-json';
import config from 'lib/config';

const prodEpicTestsDataFile = 'https://support.theguardian.com/epic-tests.json';
const codeEpicTestsDataFile =
    'https://support.code.dev-theguardian.com/epic-tests.json';

export const getEpicTestData = (): Promise<any> => {
    const url = config.get('page.isDev')
        ? codeEpicTestsDataFile
        : prodEpicTestsDataFile;
    return fetchJSON(url, { mode: 'cors' });
};
