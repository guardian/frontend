import config from 'lib/config';
import fetchJSON from 'lib/fetch-json';

const prodLiveblogEpicTestsFile =
    'https://support.theguardian.com/liveblog-epic-tests.json';
const codeLiveblogEpicTestsFile =
    'https://support.code.dev-theguardian.com/liveblog-epic-tests.json';

export const getLiveblogEpicTestData = (): Promise<any> => {
    const url = config.get('page.isDev')
        ? codeLiveblogEpicTestsFile
        : prodLiveblogEpicTestsFile;
    return fetchJSON(url, { mode: 'cors' });
};
