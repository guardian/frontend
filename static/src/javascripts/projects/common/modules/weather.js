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
    'text!common/views/components/weather.html'
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
        apiKey     = 'testapi',
        prefName   = 'weather-location',
        geo        = {
            'London': {
                coords: {
                    latitude: 51.51,
                    longitude: -0.11
                }
            },
            'New York': {
                coords: {
                    latitude: 40.71,
                    longitude: -74.01
                }
            },
            'Sydney': {
                coords: {
                    latitude: -33.86,
                    longitude: 151.21
                }
            }
        },
        getGeoStates = {
            process: 'Getting location...',
            error: 'Unable to get location...',
            defaultmsg: 'Detect my location'
        };

    return {
        init: function () {
            self = this;

            this.fetchData(this.getUserPrefs());
        },

        getDefaultLocation: function () {
            switch (config.page.edition) {
                case 'US': return geo['New York'];
                case 'AU': return geo.Sydney;
                default: return geo.London;
            }
        },

        getCityCoordinates: function (city) {
            ajax({
                url: 'http://api.accuweather.com/locations/v1/search/?apikey=' + apiKey + '&q=' + city[0],
                type: 'jsonp',
                method: 'get',
                cache: true
            }).then(function (response) {
                var position = {
                    coords: {
                        latitude: response[0].GeoPosition.Latitude,
                        longitude: response[0].GeoPosition.Longitude
                    }
                };

                self.fetchData(position);
            });
        },

        getGeoLocation: function () {
            navigator.geolocation.getCurrentPosition(this.fetchData, this.geoLocationDisabled);
        },

        geoLocationDisabled: function () {
            self.changeLocationOptionText('error');
        },

        getLocationData: function (urlLocation) {
            return ajax({
                url: urlLocation,
                type: 'jsonp',
                method: 'get',
                cache: true
            });
        },

        getWeatherData: function (urlWeather, locationData) {
            return ajax({
                url: urlWeather + locationData.Key + '.json?apikey=' + apiKey,
                type: 'jsonp',
                method: 'get',
                cache: true
            });
        },

        saveUserLocation: function (position) {
            var toStore = {
                coords: {
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                }
            };

            userPrefs.set(prefName, toStore);
        },

        /**
         * Check if user has data in local storage.
         * If yes return data from local storage else return default location data.
         *
         * @returns {object} geolocation - lat and long
         */
        getUserPrefs: function () {
            var prefs = userPrefs.get(prefName);

            if (prefs && prefs.coords) {
                return prefs;
            }

            return this.getDefaultLocation();
        },

        fetchData: function (position) {
            var urlLocation = 'http://api.accuweather.com/locations/v1/cities/geoposition/search.json?q='
                    + position.coords.latitude + ', ' + position.coords.longitude + '&apikey=' + apiKey,
                urlWeather = 'http://api.accuweather.com/currentconditions/v1/';

            self.saveUserLocation(position);

            try {
                self.getLocationData(urlLocation).then(function (locationResp) {
                    self.getWeatherData(urlWeather, locationResp).then(function (weatherResp) {
                        self.views.render(weatherResp[0], locationResp.AdministrativeArea.EnglishName);
                    });
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
            bean.on($('.js-detect-location')[0], 'click', self.detectPosition);
            mediator.on('autocomplete:fetch', this.getCityCoordinates);
        },

        unbindEvents: function () {
            bean.off($('.js-detect-location')[0], 'click', self.detectPosition);
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

        views: {
            render: function (weatherData, city) {
                $weather = $('.weather');

                if ($weather.length > 0) {
                    self.unbindEvents();
                    $weather.remove();
                }

                $weather = $.create(template(weatherTemplate, {
                    location: city,
                    icon: weatherData.WeatherIcon,
                    tempNow: self.getTemperature(weatherData)
                }));

                $holder = $('.js-weather');

                $weather.insertAfter($holder);

                toggles = new Toggles();
                toggles.init($weather);

                self.bindEvents();
                searchTool = new SearchTool({
                    container: $('.js-search-tool'),
                    apiUrl: 'http://api.accuweather.com/locations/v1/cities/autocomplete?language=en&apikey=' + apiKey + '&q='
                });
                searchTool.init();

                // After first run override funtion to just update data
                self.views.render = function (weatherData, city) {
                    $('.js-weather-city', $weather).text(city);
                    $('.js-weather-temp', $weather).text(self.getTemperature(weatherData));

                    var $weatherIcon = $('.js-weather-icon', $weather);
                    $weatherIcon.attr('class', $weatherIcon.attr('class').replace(/(\d+)/g, weatherData.WeatherIcon));

                    bean.fire($('.js-toggle-ready', $weather)[0], 'click');
                };
            }
        }
    };
});
