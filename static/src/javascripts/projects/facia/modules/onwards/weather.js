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
import { reportError } from 'lib/report-error';
import $ from 'lib/$';
import config from 'lib/config';
import { fetchJson } from 'lib/fetch-json';
import { mediator } from 'lib/mediator';
import userPrefs from 'common/modules/user-prefs';
import { SearchTool } from 'facia/modules/onwards/search-tool';

let $holder = null;
let searchTool = null;
let eventsBound = false;
const prefName = 'weather-location';



const isNetworkFront = () =>
    ['uk', 'us', 'au', 'international'].includes(config.get('page.pageId'));

export const Weather = {
    init() {
        if (!config.get('switches.weather', false) || !isNetworkFront()) {
            return false;
        }

        this.getDefaultLocation();
    },

    /**
     * Check if user has data in local storage.
     * If yes return data from local storage else return default location data.
     */
    getUserLocation() {
        const prefs = userPrefs.get(prefName);

        if (prefs && prefs.id) {
            return prefs;
        }
    },

    getWeatherData(url) {
        return fetchJson(url, {
            mode: 'cors',
        });
    },

    /**
     * Save user location into localStorage
     */
    saveUserLocation(location) {
        userPrefs.set(prefName, {
            id: location.id,
            city: location.city,
        });
    },

    getDefaultLocation() {
        const location = this.getUserLocation();

        if (location) {
            return this.fetchWeatherData(location);
        }
        return this.getWeatherData(`${config.get('page.weatherapiurl')}.json`)
            .then(response => {
                this.fetchWeatherData(response);
            })
            .catch(err => {
                reportError(err, {
                    feature: 'weather',
                });
            });
    },

    fetchWeatherData(location) {
        const weatherApiBase = config.get('page.weatherapiurl');
        const edition = config.get('page.edition');
        return this.getWeatherData(
            `${weatherApiBase}/${
                location.id
            }.json?_edition=${edition.toLowerCase()}`
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

    fetchForecastData(location) {
        return this.getWeatherData(
            `${config.get('page.forecastsapiurl')}/${
                location.id
            }.json?_edition=${config.get('page.edition').toLowerCase()}`
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

    saveDeleteLocalStorage(response) {
        if (response.store === 'set') {
            // After user interaction we want to store the location in localStorage
            this.saveUserLocation(response);
            this.fetchWeatherData(response).then(() => this.toggleForecast());
        } else if (response.store === 'remove') {
            // After user sent empty data we want to remove location and get the default location
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
            apiUrl: config.get('page.locationapiurl'),
        });
    },

    render(weatherData, city) {
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
    },

    attachToDOM(tmpl, city) {
        $holder = $('#headlines .js-container__header');
        $('.js-weather', $holder).remove();
        $holder.append(tmpl.replace(new RegExp('<%=city%>', 'g'), city));
    },

    renderForecast(forecastData) {
        const $forecastHolder = $('.js-weather-forecast');
        const tmpl = forecastData.html;

        $forecastHolder.empty().html(tmpl);
    },
};
