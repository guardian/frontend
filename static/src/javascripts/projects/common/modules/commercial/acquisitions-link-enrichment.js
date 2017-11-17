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
    const links = [...document.getElementsByClassName(ACQUISITION_LINK_CLASS)];

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

const addReferrerDataToAcquisitionLinksInInteractiveIframes = (): void => {
    window.addEventListener('message', event => {
        let data;
        try {
            data = JSON.parse(event.data);
        } catch (e) {
            return;
        }

        // Expects enrich requests to be made via iframe-messenger:
        // https://github.com/guardian/iframe-messenger
        if (data.type === 'enrich-acquisition-links' && data.id) {
            data.referrerData = addReferrerData({});
            [...document.getElementsByTagName('iframe')].forEach(iframe => {
                iframe.contentWindow.postMessage(
                    JSON.stringify(data),
                    'https://interactive.guim.co.uk'
                );
            });
        }
    });
};

export const init = (): void => {
    addReferrerDataToAcquisitionLinksInInteractiveIframes();
    addReferrerDataToAcquisitionLinksOnPage();
};
