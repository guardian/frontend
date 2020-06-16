ACQUISITION_LINK_CLASS// @flow
import { addReferrerData } from 'common/modules/commercial/acquisitions-ophan';
import { addCountryGroupToSupportLink } from 'common/modules/commercial/support-utilities';
import fetchJSON from 'lib/fetch-json';
import { getSync as geolocationGetSync } from 'lib/geolocation';

// Currently the only acquisition components on the site are
// from the Mother Load campaign and the Wide Brown Land campaign.
// Work needs to be done so we don't have to hard code what campaigns are running.
const validIframeUrls: string[] = [
    'https://interactive.guim.co.uk/embed/2017/12/the-mother-load/',
    'https://interactive.guim.co.uk/embed/2018/this-wide-brown-land/',
];

const isCurrentCampaign = (iframeSrc: string): boolean =>
    validIframeUrls.some(validIframeUrl =>
        iframeSrc.startsWith(validIframeUrl)
    );

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
        const acquisitionDataJsonString = url.searchParams.get(
            acquisitionDataField
        );

        if (!acquisitionDataJsonString) return rawUrl;

        acquisitionData = JSON.parse(acquisitionDataJsonString);
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

const enrichAcquisitionLinksOnPage = (): void => {
    const links = Array.from(
        document.getElementsByClassName(ACQUISITION_LINK_CLASS)
    );

    links.forEach(el => {
        const link = el.getAttribute('href');
        if (link) {
            let modifiedLink = addReferrerDataToAcquisitionLink(link);
            modifiedLink = addCountryGroupToSupportLink(modifiedLink);
            el.setAttribute('href', modifiedLink);
        }
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
            Array.from(document.getElementsByTagName('iframe')).forEach(
                iframe => {
                    iframe.contentWindow.postMessage(
                        JSON.stringify(data),
                        'https://interactive.guim.co.uk'
                    );
                }
            );
        }

        if (data.type === 'acquisition-data-request') {
            Array.from(document.getElementsByTagName('iframe')).forEach(el => {
                const iframeSrc = el.getAttribute('src');
                if (iframeSrc && isCurrentCampaign(iframeSrc)) {
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

const setupAusMomentHeader = () => {
    const ausHeading = document.querySelector('.new-header__cta-bar-aus-moment');
    if (ausHeading) {
        const subHeadings = ausHeading.getElementsByClassName('cta-bar__subheading-aus-moment');
        if (subHeadings) {
            // TODO - store in cookie
            fetchJSON('https://support.theguardian.com/supporters-ticker.json', {
                mode: 'cors',
            }).then(data => {
                const total = parseInt(data.total, 10);

                if (!Number.isNaN(Number(total))) {
                    for (let i = 0; i < subHeadings.length; i++) {
                        // TODO - punctuation
                        subHeadings.item(i).innerHTML = `We're funded by ${total} readers across Australia`
                    }
                }
            })
        }
    }
};

export const init = (): void => {
    addReferrerDataToAcquisitionLinksInInteractiveIframes();
    enrichAcquisitionLinksOnPage();
    setupAusMomentHeader();
};
