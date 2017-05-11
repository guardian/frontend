// @flow
/**
    "WEATHER"

    Whether the weather be fine,
    Or whether the weather be not,
    Whether the weather be cold,
    Or whether the weather be hot,
    We'll weather the weather
    Whatever the weather,
    Whether we like it or not!

    Author: Anonymous British
 */

import bean from 'bean';
import reportError from 'lib/report-error';
import $ from 'lib/$';
import config from 'lib/config';
import detect from 'lib/detect';
import fetchJson from 'lib/fetch-json';
import mediator from 'lib/mediator';
import userPrefs from 'common/modules/user-prefs';
import { SearchTool } from 'facia/modules/onwards/search-tool';
import type { CityPreference } from 'facia/modules/onwards/search-tool';

let $holder = null;
let searchTool = null;
let eventsBound = false;
const prefName = 'weather-location';

type Location = {
    id: string,
    city: string,
};

type WeatherResponse = {
    html: string,
};

const isNetworkFront = () =>
    ['uk', 'us', 'au', 'international'].includes(config.page.pageId);

export const Weather = {
    init() {
        if (!config.switches || !config.switches.weather || !isNetworkFront()) {
            return false;
        }

        this.getDefaultLocation();
    },

    isNetworkFront() {
        return ['uk', 'us', 'au', 'international'].includes(config.page.pageId);
    },

    /**
     * Check if user has data in local storage.
     * If yes return data from local storage else return default location data.
     *
     * @returns {object} geolocation - lat and long
     */
    getUserLocation() {
        const prefs = userPrefs.get(prefName);

        if (prefs && prefs.id) {
            return prefs;
        }
    },

    getWeatherData(url: string) {
        return fetchJson(url, {
            mode: 'cors',
        });
    },

    /**
     * Save user location into localStorage
     */
    saveUserLocation(location: Location) {
        userPrefs.set(prefName, {
            id: location.id,
            city: location.city,
        });
    },

    getDefaultLocation() {
        const location = this.getUserLocation();

        if (location) {
            this.fetchWeatherData(location);
        } else {
            return this.getWeatherData(`${config.page.weatherapiurl}.json`)
                .then(response => {
                    this.fetchWeatherData(response);
                })
                .catch(err => {
                    reportError(err, {
                        feature: 'weather',
                    });
                });
        }
    },

    fetchWeatherData(location: Location) {
        return this.getWeatherData(
            `${config.page.weatherapiurl}/${location.id}.json?_edition=${config.page.edition.toLowerCase()}`
        )
            .then(response => {
                this.render(response, location.city);
                this.fetchForecastData(location);
            })
            .catch(err => {
                reportError(err, {
                    feature: 'weather',
                });
            });
    },

    clearLocation() {
        userPrefs.remove(prefName);
        if (searchTool !== null) {
            searchTool.setInputValue();
        }
    },

    fetchForecastData(location: Location) {
        return this.getWeatherData(
            `${config.page.forecastsapiurl}/${location.id}.json?_edition=${config.page.edition.toLowerCase()}`
        )
            .then(response => {
                this.renderForecast(response);
            })
            .catch(err => {
                reportError(err, {
                    feature: 'weather',
                });
            });
    },

    saveDeleteLocalStorage(response: CityPreference) {
        // After user interaction we want to store the location in localStorage
        if (response.store === 'set') {
            this.saveUserLocation(response);
            this.fetchWeatherData(response);

            // After user sent empty data we want to remove location and get the default location
        } else if (response.store === 'remove') {
            this.clearLocation();
            this.getDefaultLocation();
        }
    },

    bindEvents() {
        bean.on(document.body, 'click', '.js-toggle-forecast', e => {
            e.preventDefault();
            this.toggleForecast();
        });

        mediator.on(
            'autocomplete:fetch',
            this.saveDeleteLocalStorage.bind(this)
        );
    },

    toggleForecast() {
        $('.weather').toggleClass('is-expanded');
    },

    addSearch() {
        searchTool = new SearchTool({
            container: $('.js-search-tool'),
            apiUrl: config.page.locationapiurl,
        });
    },

    render(weatherData: WeatherResponse, city: string) {
        this.attachToDOM(weatherData.html, city);

        if (!eventsBound) {
            this.bindEvents();
            eventsBound = true;
        }

        if (searchTool === null) {
            this.addSearch();
        } else {
            searchTool.bindElements($('.js-search-tool'));
        }

        if (
            detect.isBreakpoint({
                max: 'phablet',
            })
        ) {
            window.scrollTo(0, 0);
        }
    },

    attachToDOM(tmpl: string, city: string) {
        $holder = $('#headlines .js-container__header');
        $('.js-weather', $holder).remove();
        $holder.append(tmpl.replace(new RegExp('<%=city%>', 'g'), city));
    },

    renderForecast(forecastData: WeatherResponse) {
        const $forecastHolder = $('.js-weather-forecast');
        const tmpl = forecastData.html;

        $forecastHolder.empty().html(tmpl);
    },
};
