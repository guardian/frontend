// @flow
import bean from 'bean';
import bonzo from 'bonzo';
import $ from 'lib/$';
import fastdom from 'fastdom';
import qwery from 'qwery';
import config from 'lib/config';
import fetchJson from 'lib/fetch-json';
import reportError from 'lib/report-error';
import { local } from 'lib/storage';
import template from 'lodash/template';
import flattenDeep from 'lodash/flattenDeep';
import pickBy from 'lodash/pickBy';
import { isWithinSeconds } from 'common/modules/ui/relativedates';
import { inlineSvg } from 'common/views/svgs';
import alertHtml from 'raw-loader!common/views/breaking-news.html';
import type { Banner } from 'common/modules/ui/bannerPicker';

let alertToShow;

const supportedSections = {
    sport: 'sport',
    football: 'sport',
};
const breakingNewsURL = '/news-alert/alerts';
const page = config.get('page');

// get the users breaking news alert history
// {
//     alertID: true, <- dismissed/visited
//     alertID: false <- seen, but not dismissed/visited
// }
const knownAlertIDsStorageKey = 'gu.breaking-news.hidden';
const DEFAULT_DELAY = 3000;

type Alert = {
    headline: string,
    id: string,
    href: string,
    content: string,
    closeIcon: string,
    frontPublicationDate: number,
    marque36icon: string,
    trailText: string,
};
type AlertIds = {
    [id: string]: boolean,
};

let knownAlertIDs: AlertIds;

const storeKnownAlertIDs = (): void => {
    local.set(knownAlertIDsStorageKey, knownAlertIDs);
};

const updateKnownAlertID = (id: string, state: boolean): void => {
    knownAlertIDs[id] = state;

    storeKnownAlertIDs();
};

const markAlertAsSeen = (id: string): void => {
    updateKnownAlertID(id, false);
};

const markAlertAsDismissed = (id: string): void => {
    updateKnownAlertID(id, true);
};

// if we can't record a dismissal, we won't show an alert
const userCanDismissAlerts = (): ?boolean => local.isAvailable();

const fetchBreakingNews = (): Promise<any> =>
    fetchJson(breakingNewsURL, {
        mode: 'cors',
    });

// handle the breaking news JSON
const parseResponse = (response: Object): Array<Alert> =>
    (response.collections || [])
        .filter(
            collection =>
                Array.isArray(collection.content) && collection.content.length
        )
        .map(collection => {
            // collection.href is string or null
            collection.href = (collection.href || '').toLowerCase();
            return collection;
        });

// pull out the alerts from the edition/section buckets that apply to us
// global > current edition > current section
const getRelevantAlerts = (alerts: Array<Alert>): Array<Alert> => {
    const edition = (page.edition || '').toLowerCase();
    const section = supportedSections[page.section];

    return flattenDeep([
        alerts
            .filter(alert => alert.href === 'global')
            .map(alert => alert.content),
        alerts
            .filter(alert => alert.href === edition)
            .map(alert => alert.content),
        alerts
            .filter(alert => section && alert.href === section)
            .map(alert => alert.content),
    ]);
};

// keep the local alert history in sync with live alerts
const pruneKnownAlertIDs = (alerts: Array<Alert>): Array<Alert> => {
    // 'dismiss' this page ID, since if there's an alert for it,
    // we don't want to show it ever
    knownAlertIDs[page.pageId] = true;

    // then remove all known alert ids that are not
    // in the current breaking news alerts
    knownAlertIDs = pickBy(knownAlertIDs, (state: boolean, id: string) =>
        alerts.some(alert => alert.id === id)
    );

    storeKnownAlertIDs();

    return alerts;
};

// don't show alerts if we've already dismissed them
const filterAlertsByDismissed = (alerts: Array<Alert>): Array<Alert> =>
    alerts.filter(alert => knownAlertIDs[alert.id] !== true);

// don't show alerts if they're over a certain age
const filterAlertsByAge = (alerts: Array<Alert>): Array<Alert> =>
    alerts.filter(alert => {
        const alertTime = alert.frontPublicationDate;
        return alertTime && isWithinSeconds(new Date(alertTime), 1200); // 20 mins
    });

// we only show one alert at a time, pick the youngest available
const pickNewest = (alerts: Array<Alert>): Alert =>
    alerts.sort((a, b) => b.frontPublicationDate - a.frontPublicationDate)[0];

const renderAlert = (alert: Alert): bonzo => {
    alert.closeIcon = inlineSvg('closeCentralIcon');

    const $alert = bonzo.create(template(alertHtml)(alert));

    const closeButton = $('.js-breaking-news__item__close', $alert)[0];

    if (closeButton) {
        bean.on(closeButton, 'click', () => {
            fastdom.write(() => {
                $('[data-breaking-article-id]').hide();
            });
            markAlertAsDismissed(alert.id);
        });
    }

    return $alert;
};

const renderSpectre = ($breakingNews: bonzo): bonzo =>
    bonzo(bonzo.create($breakingNews[0]))
        .addClass('breaking-news--spectre')
        .removeClass('breaking-news--fade-in breaking-news--hidden');

const show = (): Promise<boolean> => {
    const $body = bonzo(document.body);
    const $breakingNews = bonzo(qwery('.js-breaking-news-placeholder'));

    // if its the first time we've seen this alert, we wait 3 secs to show it
    // otherwise we show it immediately
    const alertDelay = knownAlertIDs.hasOwnProperty(alertToShow.id)
        ? 0
        : DEFAULT_DELAY;

    // $breakingNews is hidden, so this won't trigger layout etc
    $breakingNews.append(renderAlert(alertToShow));

    // copy of breaking news banner (with blank content) used inline at the
    // bottom of the body, so the bottom of the body can visibly scroll
    // past the pinned alert
    const $spectre = renderSpectre($breakingNews);

    // inject the alerts into DOM
    setTimeout(() => {
        fastdom.write(() => {
            if (alertDelay === 0) {
                $breakingNews.removeClass('breaking-news--fade-in');
            }
            $body.append($spectre);
            $breakingNews.removeClass('breaking-news--hidden');
            markAlertAsSeen(alertToShow.id);
        });
    }, alertDelay);

    return Promise.resolve(true);
};

const canShow = (): Promise<boolean> => {
    if (userCanDismissAlerts()) {
        knownAlertIDs = local.get(knownAlertIDsStorageKey) || {};

        return fetchBreakingNews()
            .then(parseResponse)
            .then(getRelevantAlerts)
            .then(pruneKnownAlertIDs)
            .then(filterAlertsByDismissed)
            .then(filterAlertsByAge)
            .then(pickNewest)
            .then(alert => {
                if (alert) {
                    alertToShow = alert;
                    return true;
                }
                return false;
            })
            .catch(ex => {
                reportError(ex, {
                    feature: 'breaking-news',
                });
                return false;
            });
    }

    return Promise.resolve(false);
};

const breakingNews: Banner = {
    id: 'breakingNewsBanner',
    show,
    canShow,
};

export { breakingNews };
