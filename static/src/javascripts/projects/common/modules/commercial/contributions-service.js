// @flow

import { getBodyEnd, getViewLog, getWeeklyArticleHistory } from '@guardian/automat-client';
import { getSync as geolocationGetSync } from 'lib/geolocation';
import {
    setupOphanView,
    emitBeginEvent,
    setupClickHandling,
    makeEvent, submitOphanInsert,
    getVisitCount,
} from 'common/modules/commercial/contributions-utilities';
import reportError from 'lib/report-error';
import fastdom from 'lib/fastdom-promise';
import config from 'lib/config';
import { getMvtValue } from 'common/modules/analytics/mvt-cookie';
import {submitClickEvent, submitViewEvent, submitComponentEvent} from 'common/modules/commercial/acquisitions-ophan';
import fetchJson from 'lib/fetch-json';
import { render } from 'preact-x';
import React from 'preact-x/compat';
/* eslint-disable import/no-namespace */
import * as emotionCore from "@emotion/core";
import * as emotionTheming from "emotion-theming";
import * as emotion from "emotion";
/* eslint-enable import/no-namespace */


import {
    getLastOneOffContributionDate,
    isRecurringContributor,
    shouldHideSupportMessaging,
} from 'common/modules/commercial/user-features';
import userPrefs from "common/modules/user-prefs";

type ServiceModule = {
    url: string,
    name: string,
    props: {}
};

type Meta = {
    abTestName: string,
    abTestVariant: string,
    campaignCode: string,
    componentType: OphanComponentType,
    products?: OphanProduct[]
}

export type BannerDataResponse = {
    data: {
        module: ServiceModule,
        meta: Meta
    }
}

const buildKeywordTags = page => {
    const keywordIds = page.keywordIds.split(',');
    const keywords = page.keywords.split(',');
    return keywordIds.map((id, idx) => ({
        id,
        type: 'Keyword',
        title: keywords[idx],
    }));
};

const renderEpic = (html: string, css: string): Promise<[HTMLElement, ?ShadowRoot]> => {
    const content = `<style>${css}</style>${html}`;

    return fastdom.write(() => {
        const target = document.querySelector(
            '.submeta'
        );

        if (!target) {
            throw new Error(
                'Could not find target element for Epic'
            );
        }

        const parent = target.parentNode;

        if (!parent) {
            throw new Error(
                'Could not find parent element for Epic'
            );
        }

        const container = document.createElement('div');
        parent.insertBefore(container, target);

        // use Shadow Dom if found
        let shadowRoot;
        if (container.attachShadow) {
            shadowRoot = container.attachShadow({
                mode: 'open',
            });
            shadowRoot.innerHTML = content;
        } else {
            container.innerHTML = content;
        }

        return [container, shadowRoot];
    });
};

interface InitAutomatJsConfig {
    epicRoot: HTMLElement | ShadowRoot;
    onReminderOpen?: Function;
}

interface AutomatJsCallback {
    buttonCopyAsString: string;
}

// TODO introduce better way to support client-side behaviour
const executeJS = (container: HTMLElement | ShadowRoot, js: string) => {
    if (!js) {
        return;
    }

    try {
        // eslint-disable-next-line no-eval
        window.eval(js);
        if (
            typeof window.initAutomatJs ===
            'function'
        ) {
            const initAutomatJsConfig: InitAutomatJsConfig = {
                epicRoot: container,
                onReminderOpen: (callbackParams: AutomatJsCallback) => {
                    const { buttonCopyAsString } = callbackParams;
                    submitClickEvent({
                        component: {
                            componentType: 'ACQUISITIONS_OTHER',
                            id: 'precontribution-reminder-prompt-clicked',
                        },
                    });
                    submitClickEvent({
                        component: {
                            componentType: 'ACQUISITIONS_OTHER',
                            id: `precontribution-reminder-prompt-copy-${buttonCopyAsString}`,
                        },
                    });
                },
            };
            window.initAutomatJs(initAutomatJsConfig);
        }
    } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        reportError(error, {}, false);
    }
};

const buildEpicPayload = () => {
    const ophan = config.get('ophan');
    const page = config.get('page');

    // note, there is a race condition so we want to fetch this as late as possible to give a change for the geo local storage value to be set
    const countryCode = geolocationGetSync();

    const tracking = {
        ophanPageId: ophan.pageViewId,
        platformId: 'GUARDIAN_WEB',
        clientName: 'frontend',
        referrerUrl:
            window.location.origin + window.location.pathname,
    };

    const targeting = {
        contentType: page.contentType,
        sectionName: page.section,
        shouldHideReaderRevenue: page.shouldHideReaderRevenue,
        isMinuteArticle: config.hasTone('Minute'),
        isPaidContent: page.isPaidContent,
        isSensitive: page.isSensitive,
        tags: buildKeywordTags(page),
        showSupportMessaging: !shouldHideSupportMessaging(),
        isRecurringContributor: isRecurringContributor(),
        lastOneOffContributionDate:
            getLastOneOffContributionDate() || undefined,
        mvtId: getMvtValue(),
        countryCode,
        epicViewLog: getViewLog(),
        weeklyArticleHistory: getWeeklyArticleHistory()
    };

    return {
        tracking,
        targeting,
    };
};

const buildBannerPayload = () => {
    const page = config.get('page');

    // TODO: Review whether we need to send all of this in the payload to the server
    const tracking = {
        ophanPageId: config.get('ophan.pageViewId'),
        platformId: 'GUARDIAN_WEB',
        clientName: 'frontend',
        referrerUrl: window.location.origin + window.location.pathname,
    };

    const targeting = {
        alreadyVisitedCount: getVisitCount(),
        shouldHideReaderRevenue: page.shouldHideReaderRevenue,
        isPaidContent: page.isPaidContent,
        showSupportMessaging: !shouldHideSupportMessaging(),
        engagementBannerLastClosedAt: userPrefs.get('engagementBannerLastClosedAt') || undefined,
        subscriptionBannerLastClosedAt: userPrefs.get('subscriptionBannerLastClosedAt') || undefined,
        mvtId: getMvtValue(),
        countryCode: geolocationGetSync(),
        switches: {
            remoteSubscriptionsBanner: config.get('switches.remoteSubscriptionsBanner', false)
        }
    };

    return {
        tracking,
        targeting,
    };
};

const checkResponseOk = response => {
    if (response.ok) {
        return response;
    }

    throw new Error(
        `Contributions fetch failed with response code: ${response.status}`
    );
};

// TODO: add this to the client library
const getStickyBottomBanner = (payload: {}) => {
    const isProd = config.get('page.isProd');
    const URL = isProd ? 'https://contributions.guardianapis.com/banner' : 'https://contributions.code.dev-guardianapis.com/banner';
    const json = JSON.stringify(payload);

    return fetchJson(URL, {
        method: 'post',
        headers: { 'Content-Type': 'application/json' },
        body: json,
    });
};

export const fetchBannerData: () => Promise<?BannerDataResponse> = () => {
    const payload = buildBannerPayload();

    return getStickyBottomBanner(payload)
        .then(json => {
            if (!json.data) {
                return null;
            }

            return (json: BannerDataResponse);
        });
};

export const renderBanner: (BannerDataResponse) => Promise<boolean> = (response) => {
    const { module, meta } : {
        module: ServiceModule,
        meta: Meta
    } = response.data;
    if (!module) {
        return Promise.resolve(false);
    }

    window.guardian.automat = {
        react: React,
        emotionCore,
        emotionTheming,
        emotion,
    };

    // $FlowFixMe
    return window.guardianPolyfilledImport(module.url)
        .then(bannerModule => {
            const Banner = bannerModule[module.name];

            return fastdom.write(() => {
                const container = document.createElement('div');
                container.classList.add('site-message--banner');
                container.classList.add('remote-banner');

                if (document.body) {
                    document.body.insertAdjacentElement('beforeend', container);
                }

                return render(
                    <Banner {...module.props} submitComponentEvent={submitComponentEvent} />,
                    container
                );
            }).then(() => {
                const {
                    abTestName,
                    abTestVariant,
                    componentType,
                    products = [],
                    campaignCode
                } = meta;

                submitOphanInsert(abTestName, abTestVariant, componentType, products, campaignCode);

                // Submit view event now, as the standard view tracking is unreliable if the component is instantly in view
                submitViewEvent({
                    component: {
                        componentType,
                        products,
                        campaignCode,
                        id: campaignCode,
                    },
                    abTest: {
                        name: abTestName,
                        variant: abTestVariant,
                    }
                });

                return true
            });
        })
        .catch(error => {
            console.log(`Error importing remote banner: ${error}`);
            reportError(new Error(`Error importing remote banner: ${error}`), {}, false);
            return false;
        });
};

export const fetchAndRenderEpic = (id: string) => {
    const payload = buildEpicPayload();
    const viewEvent = makeEvent(id, 'view');

    getBodyEnd(payload)
        .then(checkResponseOk)
        .then(response => response.json())
        .then(json => {
            if (json && json.data) {
                const { html, css, js, meta } = json.data;
                const {
                    abTestName,
                    abTestVariant,
                    componentType,
                    products = [],
                    campaignCode,
                    campaignId
                } = meta;

                emitBeginEvent(campaignId);
                setupClickHandling(abTestName, abTestVariant, componentType, campaignCode, products);

                renderEpic(html, css)
                    .then(([el, shadowRoot]) => {
                        executeJS(shadowRoot || el, js);
                        submitOphanInsert(abTestName, abTestVariant, componentType, products, campaignCode)
                        setupOphanView(
                            el,
                            viewEvent,
                            abTestName,
                            abTestVariant,
                            campaignCode,
                            campaignId,
                            componentType,
                            products,
                            abTestVariant.showTicker,
                            abTestVariant.tickerSettings,
                        )})
            }
        })
        .catch(error => {
            console.log(error);
            reportError(error, {}, false);
        });
};
