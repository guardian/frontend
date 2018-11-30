// @flow
import fetchJSON from 'lib/fetch-json';
import { articleCopy, copyFromGoogleDocRows, getEpicParams } from 'common/modules/commercial/acquisitions-copy';
import reportError from '../../../../lib/report-error';

const epicGoogleDocUrl: string =
    'https://interactive.guim.co.uk/docsdata/1fy0JolB1bf1IEFLHGHfUYWx-niad7vR9K954OpTOvjE.json';
const bannerGoogleDocUrl: string =
    'https://interactive.guim.co.uk/docsdata/1CIHCoe87hyPHosXx1pYeVUoohvmIqh9cC_kNlV-CMHQ.json';

export const getVariants = (googleDocJson: any): $ReadOnlyArray<Variant> => {
    const sheets = googleDocJson && googleDocJson.sheets;
    const variants = Object.keys(sheets).map(variantName => {
        const rows = sheets[variantName];
        const firstRow = rows && rows[0];

        if (
            !(
                firstRow &&
                firstRow.heading &&
                firstRow.paragraphs &&
                firstRow.highlightedText
            )
        ) {
            return {
                // Seeing impressions/conversions with this variant name
                // should flag that something's gone wrong
                id: 'defaulted_to_control_variant',
                products: [],
            };
        } else {
            return {
                id: variantName,
                products: [],
                options: {
                    copy: copyFromGoogleDocRows(firstRow, rows),
                    // we can eventually add whatever options we want
                }
            }
        }
    });

    return variants;
};

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
