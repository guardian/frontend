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
    'raven',
    'common/utils/_',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/config',
    'common/utils/mediator',
    'common/utils/template',
    'common/modules/search-tool',
    'common/modules/userPrefs',
    'text!common/views/weather.html'
], function (
    bean,
    raven,
    _,
    $,
    ajax,
    config,
    mediator,
    template,
    SearchTool,
    userPrefs,
    weatherTemplate
    ) {

    var self           = null,
        $weather       = null,
        $holder        = null,
        searchTool     = null,
        city           = '',
        prefName       = 'weather-location';

    return {
        init: function () {
            self = this;
            console.log(config.page);

            this.getDefaultLocation();
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
            return ajax({
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

            city = location.city;
        },

        getDefaultLocation: function () {
            var location = this.getUserLocation();

            if (location) {
                this.fetchData(location);
            } else {
                try {
                    self.getWeatherData(config.page.weatherapi_url + '.json').then(function (response) {
                        self.fetchData(response);
                    });
                } catch (e) {
                    raven.captureException(new Error('Error retrieving city data (' + e.message + ')'), {
                        tags: {
                            feature: 'weather'
                        }
                    });
                }
            }
        },

        fetchData: function (location) {
            self.saveUserLocation(location);

            try {
                return self.getWeatherData(config.page.weatherapi_url + '/' + location.id + '.json').then(function (response) {
                    self.render(response[0], location.city);
                }).fail(function () {
                    self.failedRequest();
                });
            } catch (e) {
                raven.captureException(new Error('Error retrieving weather data (' + e.message + ')'), {
                    tags: {
                        feature: 'weather'
                    }
                });
            }
        },

        failedRequest: function () {
            raven.captureException(new Error('Error retrieving weather data'), {
                tags: {
                    feature: 'weather'
                }
            });
        },

        bindEvents: function () {
            bean.on($('.js-weather-input')[0], 'click', function () {
                self.toggleControls(true);
            });
            bean.on($('.js-close-location')[0], 'click', function () {
                self.toggleControls(false);
            });
            mediator.on('autocomplete:fetch', this.fetchData);
        },

        toggleControls: function (value) {
            var $input    = $('.js-weather-input')[0],
                $location = $('.weather__location');

            if (value) {
                $location.addClass('is-editing');
                $input.setSelectionRange(0, $input.value.length);
            } else {
                $location.removeClass('is-editing');
                searchTool.clear();
                searchTool.setInputValue(city);
            }
        },

        getUnits: function () {
            if (config.page.edition === 'US') {
                return 'Imperial';
            }

            return 'Metric';
        },

        getTemperature: function (weatherData) {
            return Math.round(weatherData.Temperature[this.getUnits()].Value) + '°'
                + weatherData.Temperature[this.getUnits()].Unit;
        },

        addSearch: function () {
            searchTool = new SearchTool({
                container: $('.js-search-tool'),
                apiUrl: config.page.locationapi_url
            });
            searchTool.init();
        },

        render: function (weatherData, city) {
            $weather = $('.weather');
            $holder = $('.js-weather');

            $weather = $.create(template(weatherTemplate, {
                location: city,
                icon: weatherData.WeatherIcon,
                description: weatherData.WeatherText,
                tempNow: self.getTemperature(weatherData)
            }));

            $weather.appendTo($holder);
            self.bindEvents();
            self.addSearch();

            // After first run override function to just update data
            self.render = function (weatherData) {
                var $weatherIcon = $('.js-weather-icon', $weather);

                $('.js-weather-temp', $weather).text(self.getTemperature(weatherData));

                // Replace number in weather icon class
                $weatherIcon.attr('class', $weatherIcon.attr('class').replace(/(\d+)/g,
                    weatherData.WeatherIcon));

                // Close editing
                self.toggleControls(false);
            };
        }
    };
});
