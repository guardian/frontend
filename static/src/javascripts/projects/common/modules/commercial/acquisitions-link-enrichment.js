// @flow
import { addReferrerData } from 'common/modules/commercial/acquisitions-ophan';
import { isInVariantSynchronous } from 'common/modules/experiments/ab';
import { commercialCmpCustomise } from 'common/modules/experiments/tests/commercial-cmp-customise';
import { supportServerSideRendering } from 'common/modules/experiments/tests/support-server-side-rendering';
import fastdom from 'lib/fastdom-promise';

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

const serverSideTestParameterValue = () => {
    if (isInVariantSynchronous(supportServerSideRendering, 'variant')) {
        return 'on';
    }
    if (isInVariantSynchronous(supportServerSideRendering, 'control')) {
        return 'off'
    }
    return 'test';
};


const addServerSideRenderingTestParameterToLink = (rawUrl: string): string => {
    const serverSideRenderingField = 'ssr';
    const randomNumber = Math.random();
    if (randomNumber === undefined) {
        return rawUrl;
    }
    const paramValue = randomNumber >= 0.5 ? 'on' : 'off';
    let url;
    try {
        url = new URL(rawUrl);
    } catch (e) {
        return rawUrl;
    }
    if (paramValue) {

        url.searchParams.set(
            serverSideRenderingField,
            paramValue
        );
    }
    return url.toString();
};

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

const addReferrerDataToAcquisitionLinksOnPage = (): void => {
    const links = Array.from(
        document.getElementsByClassName(ACQUISITION_LINK_CLASS)
    );

    links.forEach(el => {
        fastdom.read(() => el.getAttribute('href')).then(link => {
            if (link) {
                fastdom.write(() => {
                    const linkWithAcquisitionData = addReferrerDataToAcquisitionLink(link);
                    const linkWithAcquisitionDataAndServerSideRenderingTestData =
                        addServerSideRenderingTestParameterToLink(linkWithAcquisitionData);
                    el.setAttribute(
                        'href',
                        linkWithAcquisitionDataAndServerSideRenderingTestData
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

export const init = (): void => {
    addReferrerDataToAcquisitionLinksInInteractiveIframes();
    addReferrerDataToAcquisitionLinksOnPage();
};
