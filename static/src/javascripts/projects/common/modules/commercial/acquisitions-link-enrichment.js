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

        // TODO: remove this when only https://github.com/guardian/acquisition-iframe-tracking
        // TODO: is being used for acquisition iframe tracking
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

        if (data.type === 'acquisition-data-request') {
            [...document.getElementsByTagName('iframe')].forEach(el => {
                const iframeSrc = el.getAttribute('src');
                if (
                    iframeSrc &&
                    iframeSrc.startsWith('https://interactive.guim.co.uk') &&
                    iframeSrc === event.source.location.href
                ) {
                    el.contentWindow.postMessage(
                        JSON.stringify({
                            type: 'acquisition-data-response',
                            acquisitionData: {
                                ...addReferrerData({}),
                                source: 'GUARDIAN_WEB',
                            },
                        }),
                        '*'
                    );
                }
            });
        }
    });
};

export const init = (): void => {
    addReferrerDataToAcquisitionLinksInInteractiveIframes();
    addReferrerDataToAcquisitionLinksOnPage();
};
