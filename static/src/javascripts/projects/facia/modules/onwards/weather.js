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
import qwery from 'qwery';
import reportError from 'lib/report-error';
import $ from 'lib/$';
import config from 'lib/config';
import detect from 'lib/detect';
import fetchJson from 'lib/fetch-json';
import mediator from 'lib/mediator';
import template from 'lodash/utilities/template';
import userPrefs from 'common/modules/user-prefs';
import searchtool from 'facia/modules/onwards/search-tool';
import contains from 'lodash/collections/contains';

var $holder = null,
    searchTool = null,
    prefName = 'weather-location';

export default {
    init: function() {
        if (!config.switches || !config.switches.weather || !this.isNetworkFront()) {
            return false;
        }

        this.getDefaultLocation();
    },

    isNetworkFront: function() {
        return contains(['uk', 'us', 'au', 'international'], config.page.pageId);
    },

    /**
     * Check if user has data in local storage.
     * If yes return data from local storage else return default location data.
     *
     * @returns {object} geolocation - lat and long
     */
    getUserLocation: function() {
        var prefs = userPrefs.get(prefName);

        if (prefs && prefs.id) {
            return prefs;
        }
    },

    getWeatherData: function(url) {
        return fetchJson(url, {
            mode: 'cors'
        });
    },

    /**
     * Save user location into localStorage
     */
    saveUserLocation: function(location) {
        userPrefs.set(prefName, {
            'id': location.id,
            'city': location.city
        });
    },

    getDefaultLocation: function() {
        var location = this.getUserLocation();

        if (location) {
            this.fetchWeatherData(location);
        } else {
            return this.getWeatherData(config.page.weatherapiurl + '.json')
                .then(function(response) {
                    this.fetchWeatherData(response);
                }.bind(this)).catch(function(err) {
                    reportError(err, {
                        feature: 'weather'
                    });
                });
        }
    },

    fetchWeatherData: function(location) {
        return this.getWeatherData(config.page.weatherapiurl + '/' + location.id + '.json?_edition=' + config.page.edition.toLowerCase())
            .then(function(response) {
                this.render(response, location.city);
                this.fetchForecastData(location);
            }.bind(this)).catch(function(err) {
                reportError(err, {
                    feature: 'weather'
                });
            });
    },

    clearLocation: function() {
        userPrefs.remove(prefName);
        searchTool.setInputValue();
    },

    fetchForecastData: function(location) {
        return this.getWeatherData(config.page.forecastsapiurl + '/' + location.id + '.json?_edition=' + config.page.edition.toLowerCase())
            .then(function(response) {
                this.renderForecast(response);
            }.bind(this)).catch(function(err) {
                reportError(err, {
                    feature: 'weather'
                });
            });
    },

    saveDeleteLocalStorage: function(response) {
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

    bindEvents: function() {
        bean.on(document.body, 'click', '.js-toggle-forecast', function(e) {
            e.preventDefault();
            this.toggleForecast();
        }.bind(this));

        mediator.on('autocomplete:fetch', this.saveDeleteLocalStorage.bind(this));
    },

    toggleForecast: function() {
        $('.weather').toggleClass('is-expanded');
    },

    addSearch: function() {
        searchTool = new searchtool.SearchTool({
            container: $('.js-search-tool'),
            apiUrl: config.page.locationapiurl
        });
    },

    render: function(weatherData, city) {
        this.attachToDOM(weatherData.html, city);

        this.bindEvents();
        this.addSearch();

        this.render = function(weatherData, city) {
            this.attachToDOM(weatherData.html, city);
            searchTool.bindElements($('.js-search-tool'));

            if (detect.isBreakpoint({
                    max: 'phablet'
                })) {
                window.scrollTo(0, 0);
            }
        };
    },

    attachToDOM: function(tmpl, city) {
        $holder = $('#headlines .js-container__header');
        $('.js-weather', $holder).remove();
        $holder.append(tmpl.replace(new RegExp('<%=city%>', 'g'), city));
    },

    renderForecast: function(forecastData) {
        var $forecastHolder = $('.js-weather-forecast'),
            tmpl = forecastData.html;

        $forecastHolder.empty().html(tmpl);
    }
};
