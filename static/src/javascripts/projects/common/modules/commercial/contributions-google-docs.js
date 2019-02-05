// @flow
import fetchJSON from 'lib/fetch-json';
import config from 'lib/config';
import { getEpicParams } from 'common/modules/commercial/acquisitions-copy';

export const epicGoogleDocUrl: string =
    'https://interactive.guim.co.uk/docsdata/1fy0JolB1bf1IEFLHGHfUYWx-niad7vR9K954OpTOvjE.json';
export const bannerGoogleDocUrl: string =
    'https://interactive.guim.co.uk/docsdata/1CIHCoe87hyPHosXx1pYeVUoohvmIqh9cC_kNlV-CMHQ.json';
export const epicMultipleTestsGoogleDocUrl: string = config.get('page.isDev')
    ? 'https://interactive.guim.co.uk/docsdata/1THvo7I36Npb9GbKFAk6veIku3Hz5tBhpHobxrl0SoUc.json'
    : 'https://interactive.guim.co.uk/docsdata/1VQ6yn2thnkFzjxIKt-AfOB_gJnX8omLNodkRyX7_Qbg.json';

export const getGoogleDoc = (url: string): Promise<any> =>
    fetchJSON(url, {
        mode: 'cors',
    });

export const getBannerGoogleDoc = (): Promise<any> =>
    getGoogleDoc(bannerGoogleDocUrl);

export const googleDocEpicControl = (): Promise<AcquisitionsEpicTemplateCopy> =>
    getGoogleDoc(epicGoogleDocUrl).then(res => getEpicParams(res, 'control'));
