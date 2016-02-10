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

define([
    'bean',
    'qwery',
    'common/utils/report-error',
    'common/utils/$',
    'common/utils/ajax-promise',
    'common/utils/config',
    'common/utils/detect',
    'common/utils/mediator',
    'common/utils/template',
    'common/modules/analytics/omniture',
    'common/modules/user-prefs',
    'facia/modules/onwards/search-tool',
    'lodash/collections/contains'
], function (
    bean,
    qwery,
    reportError,
    $,
    ajaxPromise,
    config,
    detect,
    mediator,
    template,
    omniture,
    userPrefs,
    SearchTool,
    contains
) {

    var $holder        = null,
        searchTool     = null,
        prefName       = 'weather-location';

    return {
        init: function () {
            if (!config.switches || !config.switches.weather || !this.isNetworkFront()) {
                return false;
            }

            this.getDefaultLocation();
        },

        isNetworkFront: function () {
            return contains(['uk', 'us', 'au', 'international'], config.page.pageId);
        },

        /**
         * Check if user has data in local storage.
         * If yes return data from local storage else return default location data.
         *
         * @returns {object} geolocation - lat and long
         */
        getUserLocation: function () {
            var prefs = userPrefs.get(prefName);

            if (prefs && prefs.id) {
                return prefs;
            }
        },

        getWeatherData: function (url) {
            return ajaxPromise({
                url: url,
                type: 'json',
                method: 'get',
                crossOrigin: true
            });
        },

        /**
         * Save user location into localStorage
         */
        saveUserLocation: function (location) {
            userPrefs.set(prefName, {
                'id': location.id,
                'city': location.city
            });
        },

        getDefaultLocation: function () {
            var location = this.getUserLocation();

            if (location) {
                this.fetchWeatherData(location);
            } else {
                return this.getWeatherData(config.page.weatherapiurl + '.json')
                    .then(function (response) {
                        this.fetchWeatherData(response);
                    }.bind(this)).catch(function (err) {
                        reportError(err, { feature: 'weather' });
                    });
            }
        },

        fetchWeatherData: function (location) {
            return this.getWeatherData(config.page.weatherapiurl + '/' + location.id + '.json?_edition=' + config.page.edition.toLowerCase())
                .then(function (response) {
                    this.render(response, location.city);
                    this.fetchForecastData(location);
                }.bind(this)).catch(function (err) {
                    reportError(err, { feature: 'weather' });
                });
        },

        clearLocation: function () {
            userPrefs.remove(prefName);
            searchTool.setInputValue();
        },

        fetchForecastData: function (location) {
            return this.getWeatherData(config.page.forecastsapiurl + '/' + location.id + '.json?_edition=' + config.page.edition.toLowerCase())
                .then(function (response) {
                    this.renderForecast(response);
                }.bind(this)).catch(function (err) {
                    reportError(err, { feature: 'weather' });
                });
        },

        saveDeleteLocalStorage: function (response) {
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

        bindEvents: function () {
            bean.on(document.body, 'click', '.js-toggle-forecast', function (e) {
                e.preventDefault();
                this.toggleForecast();
            }.bind(this));

            mediator.on('autocomplete:fetch', this.saveDeleteLocalStorage.bind(this));
        },

        toggleForecast: function () {
            $('.weather').toggleClass('is-expanded');
        },

        addSearch: function () {
            searchTool = new SearchTool({
                container: $('.js-search-tool'),
                apiUrl: config.page.locationapiurl
            });
            searchTool.init();
        },

        render: function (weatherData, city) {
            this.attachToDOM(weatherData.html, city);

            this.bindEvents();
            this.addSearch();

            this.render = function (weatherData, city) {
                this.attachToDOM(weatherData.html, city);
                searchTool.bindElements($('.js-search-tool'));

                if (detect.isBreakpoint({max: 'phablet'})) {
                    window.scrollTo(0, 0);
                }
            };
        },

        attachToDOM: function (tmpl, city) {
            $holder = $('#headlines .js-container__header');
            $('.js-weather', $holder).remove();
            $holder.append(tmpl.replace(new RegExp('<%=city%>', 'g'), city));
        },

        renderForecast: function (forecastData) {
            var $forecastHolder = $('.js-weather-forecast'),
                tmpl            = forecastData.html;

            $forecastHolder.empty().html(tmpl);
        }
    };
});
