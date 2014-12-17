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
    'common/modules/ui/toggles',
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
    Toggles,
    weatherTemplate
    ) {

    var self       = null,
        $weather   = null,
        $holder    = null,
        toggles    = null,
        searchTool = null,
        prefName   = 'weather-location',
        getGeoStates = {
            process: 'Getting location...',
            error: 'Unable to get location...',
            defaultmsg: 'Detect my location'
        };

    return {
        init: function () {
            self = this;

            this.fetchData(this.getUserLocation());
        },

        getGeoLocation: function () {
            // This sends all geolocation data to fetchData when fetchData is expecting an Accuweather location
            navigator.geolocation.getCurrentPosition(this.fetchData, this.geoLocationDisabled);
        },

        geoLocationDisabled: function () {
            self.changeLocationOptionText('error');
        },

        getWeatherData: function (url) {
            return ajax({
                url: url,
                type: 'json',
                method: 'get'
            });
        },

        saveUserLocation: function (city) {
            userPrefs.set(prefName, {'location': city});
        },

        /**
         * Check if user has data in local storage.
         * If yes return data from local storage else return default location data.
         *
         * @returns {object} geolocation - lat and long
         */
        getUserLocation: function () {
            var prefs = userPrefs.get(prefName);

            if (prefs && prefs.location) {
                return prefs;
            }
        },

        fetchData: function (location) {
            var url = '/weather/city';

            if (typeof location === 'string') {
                url += '/' + location + '.json';
                this.saveUserLocation(location);
            } else {
                url += '.json';
            }

            try {
                return self.getWeatherData(url).then(function (response) {
                    self.render(response[0], 'London');
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
            bean.on($('.js-weather-input')[0], 'click', function() {
                self.toggleControls(true);
            });
            bean.on($('.js-close-location')[0], 'click', function() {
                self.toggleControls(false);
            });
            // bean.on($('.js-detect-location')[0], 'click', self.detectPosition);
            mediator.on('autocomplete:fetch', this.getCityCoordinates);
        },

        unbindEvents: function () {
            bean.off($('.js-weather-input')[0], 'click', self.toggleControls);
            bean.off($('.js-close-location')[0], 'click', self.toggleControls);
            // bean.off($('.js-detect-location')[0], 'click', self.detectPosition);
            mediator.off('autocomplete:fetch', this.getCityCoordinates);
        },

        toggleControls: function(value, city) {
            $input = $('.js-weather-input')[0];
            $location = $('.weather__location');

            if (value) {
                $location.addClass('is-editing');
                $input.setSelectionRange(0, $input.value.length);
            } else {
                $location.removeClass('is-editing');
            }
        },

        detectPosition: function (e) {
            e.preventDefault();

            self.changeLocationOptionText('process');
            self.getGeoLocation();
        },

        changeLocationOptionText: function (state) {
            $('.js-detect-location').text(getGeoStates[state]);
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

            toggles = new Toggles();
            toggles.init($weather);

            self.bindEvents();
            searchTool = new SearchTool({
                container: $('.js-search-tool'),
                apiUrl: 'http://api.accuweather.com/locations/v1/cities/autocomplete?language=en&apikey=&q='
            });
            searchTool.init();

            // After first run override funtion to just update data
            self.render = function (weatherData, city) {
                $('.js-weather-city', $weather).text(city);
                $('.js-weather-temp', $weather).text(self.getTemperature(weatherData));

                var $weatherIcon = $('.js-weather-icon', $weather);
                $weatherIcon.attr('class', $weatherIcon.attr('class').replace(/(\d+)/g, weatherData.WeatherIcon));

                bean.fire($('.js-toggle-ready', $weather)[0], 'click');
            };
        }
    };
});
