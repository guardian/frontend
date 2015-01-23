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
    'common/modules/user-prefs',
    'facia/modules/onwards/search-tool',
    'text!facia/views/weather.html',
    'text!facia/views/weather-forecast.html'
], function (
    bean,
    raven,
    _,
    $,
    ajax,
    config,
    mediator,
    template,
    userPrefs,
    SearchTool,
    weatherTemplate,
    forecastTemplate
    ) {

    var $weather       = null,
        $holder        = null,
        searchTool     = null,
        city           = '',
        prefName       = 'weather-location';

    return {
        init: function () {
            if (!config.switches || !config.switches.weather || !userPrefs.isOn('weather')) {
                return false;
            }

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
                this.fetchWeatherData(location);
            } else {

                this.getWeatherData(config.page.weatherapiurl + '.json')
                    .then(function (response) {
                        this.fetchWeatherData(response);
                    }.bind(this))
                    .fail(function (err, msg) {
                        raven.captureException(new Error('Error retrieving city data (' + msg + ')'), {
                            tags: {
                                feature: 'weather'
                            }
                        });
                    });
            }
        },

        fetchWeatherData: function (location) {
            if (location.store) {
                this.saveUserLocation(location);
            }

            return this.getWeatherData(config.page.weatherapiurl + '/' + location.id + '.json')
                .then(function (response) {
                    this.render(response, location.city);
                    this.fetchForecastData(location);
                }.bind(this)).fail(function (err, msg) {
                    raven.captureException(new Error('Error retrieving weather data (' + msg + ')'), {
                        tags: {
                            feature: 'weather'
                        }
                    });
                });
        },

        track: function (city) {
            s.prop26 = city;
            s.linkTrackVars = 'prop26';
            s.tl(true, 'o', 'weather location set by fastly');
        },

        fetchForecastData: function (location) {
            return this.getWeatherData(config.page.forecastsapiurl + '/' + location.id + '.json')
                .then(function (response) {
                    this.renderForecast(response);
                }.bind(this))
                .fail(function (err, msg) {
                    raven.captureException(new Error('Error retrieving forecast data (' + msg + ')'), {
                        tags: {
                            feature: 'weather'
                        }
                    });
                });
        },

        bindEvents: function () {
            bean.on($('.js-weather-input')[0], 'click', function (e) {
                e.preventDefault();
                this.toggleControls(true);
            }.bind(this));
            bean.on($('.js-close-location')[0], 'click', function (e) {
                e.preventDefault();
                this.toggleControls(false);
            }.bind(this));
            bean.on($('.js-toggle-forecast')[0], 'click', function (e) {
                this.toggleForecast();
            }.bind(this));
            mediator.on('autocomplete:fetch', this.fetchWeatherData.bind(this));
        },

        toggleControls: function (value) {
            var $input    = $('.js-weather-input')[0],
                $location = $('.weather__location'),
                $close    = $('.js-close-location'),
                $edit     = $('.js-edit-location');

            if (value) {
                $location.addClass('is-editing');
                $input.setSelectionRange(0, $input.value.length);
                $close.removeClass('u-h');
                $edit.addClass('u-h');
            } else {
                $location.removeClass('is-editing');
                searchTool.clear();
                searchTool.setInputValue(city);
                $close.addClass('u-h');
                $edit.removeClass('u-h');
            }
        },

        toggleForecast: function () {
            $('.weather').toggleClass('is-expanded');
        },

        getUnits: function () {
            if (config.page.edition === 'US') {
                return 'imperial';
            }

            return 'metric';
        },

        getTemperature: function (weatherData) {
            return weatherData.temperature[this.getUnits()];
        },

        addSearch: function () {
            searchTool = new SearchTool({
                container: $('.js-search-tool'),
                apiUrl: config.page.locationapiurl
            });
            searchTool.init();
        },

        render: function (weatherData, city) {
            $weather = $('.weather');
            $holder = $('.js-weather');

            $weather = $.create(template(weatherTemplate, {
                location: city,
                icon: weatherData.weatherIcon,
                description: weatherData.weatherText,
                tempNow: this.getTemperature(weatherData)
            }));

            $weather.appendTo($holder);
            this.bindEvents();
            this.addSearch();

            // After first run override function to just update data
            this.render = function (weatherData) {
                var $weatherIcon = $('.js-weather-icon', $weather);

                $('.js-weather-temp', $weather).text(this.getTemperature(weatherData));

                // Replace number in weather icon class
                $weatherIcon.attr('class', $weatherIcon.attr('class').replace(/(\d+)/g,
                    weatherData.weatherIcon))
                    .attr('title', weatherData.weatherText);

                // Close editing
                this.toggleControls(false);
            };
        },

        renderForecast: function (forecastData) {
            var $forecastHolder = $('.js-weather-forecast'),
                $forecast       = null,
                docFragment     = document.createDocumentFragment(),
                i;

            $forecastHolder.empty();

            for (i in forecastData) {
                $forecast = $.create(template(forecastTemplate, {
                    'forecast-time': new Date(forecastData[i].epochDateTime * 1000).getHours(),
                    'forecast-temp': forecastData[i].temperature[this.getUnits()],
                    'forecast-icon': forecastData[i].weatherIcon,
                    'forecast-desc': forecastData[i].weatherText,
                    'forecast-num': parseInt(i, 10) + 1
                }));

                docFragment.appendChild($forecast[0]);
            }

            $forecastHolder.each(function (item) {
                $(item).append(docFragment.cloneNode(true));
            });
        }
    };
});
