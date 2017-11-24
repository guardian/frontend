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

const isNetworkFront = (): boolean =>
    ['uk', 'us', 'au', 'international'].includes(config.get('page.pageId'));

export const Weather = {
    init(): ?boolean {
        if (!config.get('switches.weather', false) || !isNetworkFront()) {
            return false;
        }

        this.getDefaultLocation();
    },

    /**
     * Check if user has data in local storage.
     * If yes return data from local storage else return default location data.
     */
    getUserLocation(): ?Location {
        const prefs = userPrefs.get(prefName);

        if (prefs && prefs.id) {
            return prefs;
        }
    },

    getWeatherData(url: string): Promise<WeatherResponse> {
        return fetchJson(url, {
            mode: 'cors',
        });
    },

    /**
     * Save user location into localStorage
     */
    saveUserLocation(location: Location): void {
        userPrefs.set(prefName, {
            id: location.id,
            city: location.city,
        });
    },

    getDefaultLocation(): Promise<void> {
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

    fetchWeatherData(location: Location): Promise<void> {
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

    clearLocation(): void {
        userPrefs.remove(prefName);
        if (searchTool !== null) {
            searchTool.setInputValue();
        }
    },

    fetchForecastData(location: Location): Promise<void> {
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

    saveDeleteLocalStorage(response: CityPreference): void {
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

    bindEvents(): void {
        bean.on(document.body, 'click', '.js-toggle-forecast', e => {
            e.preventDefault();
            this.toggleForecast();
        });

        mediator.on(
            'autocomplete:fetch',
            this.saveDeleteLocalStorage.bind(this)
        );
    },

    toggleForecast(): void {
        $('.weather').toggleClass('is-expanded');
    },

    addSearch(): void {
        searchTool = new SearchTool({
            container: $('.js-search-tool'),
            apiUrl: config.get('page.locationapiurl'),
        });
    },

    render(weatherData: WeatherResponse, city: string): void {
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

    attachToDOM(tmpl: string, city: string): void {
        $holder = $('#headlines .js-container__header');
        $('.js-weather', $holder).remove();
        $holder.append(tmpl.replace(new RegExp('<%=city%>', 'g'), city));
    },

    renderForecast(forecastData: WeatherResponse): void {
        const $forecastHolder = $('.js-weather-forecast');
        const tmpl = forecastData.html;

        $forecastHolder.empty().html(tmpl);
    },
};
