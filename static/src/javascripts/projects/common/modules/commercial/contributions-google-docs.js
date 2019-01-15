// @flow
import fetchJSON from 'lib/fetch-json';
import { getEpicParams } from 'common/modules/commercial/acquisitions-copy';

export const epicGoogleDocUrl: string =
    'https://interactive.guim.co.uk/docsdata/1fy0JolB1bf1IEFLHGHfUYWx-niad7vR9K954OpTOvjE.json';
export const bannerGoogleDocUrl: string =
    'https://interactive.guim.co.uk/docsdata/1CIHCoe87hyPHosXx1pYeVUoohvmIqh9cC_kNlV-CMHQ.json';
export const epicMultipleTestsGoogleDocUrl: string =
    'https://interactive.guim.co.uk/docsdata-test/1VQ6yn2thnkFzjxIKt-AfOB_gJnX8omLNodkRyX7_Qbg.json';

export const getGoogleDoc = (url: string): Promise<any> =>
    fetchJSON(url, {
        mode: 'cors',
    });

export const getEpicGoogleDoc = (): Promise<any> =>
    getGoogleDoc(epicGoogleDocUrl);
export const getBannerGoogleDoc = (): Promise<any> =>
    getGoogleDoc(bannerGoogleDocUrl);

export const googleDocEpicControl = (): Promise<AcquisitionsEpicTemplateCopy> =>
    getGoogleDoc(epicGoogleDocUrl).then(res => getEpicParams(res, 'control'));

