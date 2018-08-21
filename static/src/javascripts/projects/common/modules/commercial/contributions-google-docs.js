// @flow
import fetchJSON from 'lib/fetch-json';
import { getEpicParams } from 'common/modules/commercial/acquisitions-copy';

const epicGoogleDocUrl: string =
    'https://interactive.guim.co.uk/docsdata/1fy0JolB1bf1IEFLHGHfUYWx-niad7vR9K954OpTOvjE.json';

const getGoogleDoc = (url: string): Promise<any> =>
    fetchJSON(url, {
        mode: 'cors',
    });

export const getEpicGoogleDoc: Promise<any> = getGoogleDoc(epicGoogleDocUrl);

export const googleDocEpicControl = (): Promise<AcquisitionsEpicTemplateCopy> =>
    getGoogleDoc(epicGoogleDocUrl).then(res => getEpicParams(res, 'control'));
