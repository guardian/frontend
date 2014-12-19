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

    var self          = null,
        $weather      = null,
        $holder       = null,
        searchTool    = null,
        prefName      = 'weather-location',
        getGeoStates  = {
            process: 'Getting location...',
            error: 'Unable to get location...',
            defaultmsg: 'Detect my location'
        },
        weatherApiUrl = '/weather/city';

    return {
        init: function () {
            self = this;

            this.getDefaultLocation();
        },

        getGeoLocation: function () {
            // This sends all geolocation data to fetchData when fetchData is expecting an Accuweather location
            navigator.geolocation.getCurrentPosition(this.fetchData, this.geoLocationDisabled);
        },

        geoLocationDisabled: function () {
            self.changeLocationOptionText('error');
        },

        detectPosition: function (e) {
            e.preventDefault();

            self.changeLocationOptionText('process');
            self.getGeoLocation();
        },

        changeLocationOptionText: function (state) {
            $('.js-detect-location').text(getGeoStates[state]);
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
                method: 'get'
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
                this.fetchData(location);
            } else {
                try {
                    self.getWeatherData(weatherApiUrl + '.json').then(function (response) {
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
                return self.getWeatherData(weatherApiUrl + '/' + location.id + '.json').then(function (response) {
                    self.render(response[0], location.city);
                });
            } catch (e) {
                raven.captureException(new Error('Error retrieving weather data (' + e.message + ')'), {
                    tags: {
                        feature: 'weather'
                    }
                });
            }
        },

        bindEvents: function () {
            bean.on($('.js-weather-input')[0], 'click', function () {
                self.toggleControls(true);
            });
            bean.on($('.js-close-location')[0], 'click', function () {
                self.toggleControls(false);
            });
            // HTML GeoApi disabled for now
            // bean.on($('.js-detect-location')[0], 'click', self.detectPosition);
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

            // Initialize Search Tool
            searchTool = new SearchTool({
                container: $('.js-search-tool'),
                apiUrl: '/weather/locations?query='
            });
            searchTool.init();

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
