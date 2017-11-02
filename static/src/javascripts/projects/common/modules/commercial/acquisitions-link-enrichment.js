// @flow
import { addReferrerData } from 'common/modules/commercial/acquisitions-ophan';
import fastdom from 'lib/fastdom-promise';

const addReferrerDataToAcquisitionLink = (rawUrl: string): string => {
    const acquisitionDataField = 'acquisitionData';

    let url;
    try {
        url = new URL(rawUrl);
    } catch (e) {
        return rawUrl;
    }

    let acquisitionData;
    try {
        acquisitionData = JSON.parse(
            url.searchParams.get(acquisitionDataField)
        );
    } catch (e) {
        return rawUrl;
    }

    if (acquisitionData) {
        acquisitionData = addReferrerData(acquisitionData);
        url.searchParams.set(
            acquisitionDataField,
            JSON.stringify(acquisitionData)
        );
    }

    return url.toString();
};

const ACQUISITION_LINK_CLASS = 'js-acquisition-link';

const addReferrerDataToAcquisitionLinksOnPage = (): void => {
    const links = Array.from(
        document.getElementsByClassName(ACQUISITION_LINK_CLASS)
    );

    links.forEach(el => {
        fastdom.read(() => el.getAttribute('href')).then(link => {
            if (link) {
                fastdom.write(() => {
                    el.setAttribute(
                        'href',
                        addReferrerDataToAcquisitionLink(link)
                    );
                });
            }
        });
    });
};

export const init = (): void => {
    addReferrerDataToAcquisitionLinksOnPage();
};
