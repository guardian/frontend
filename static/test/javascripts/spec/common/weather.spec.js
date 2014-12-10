define([
    'bean',
    'bonzo',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/template',
    'common/modules/weather/weather'
], function (
    bean,
    bonzo,
    $,
    ajax,
    template,
    sut
    ) {

    xdescribe('Weather component', function() {
        var container,
            $weather;

        beforeEach(function () {
            container = bonzo.create(
                '<div><div class="js-weather"></div></div>'
            )[0];

            $('body').append(container);
        });

        afterEach(function() {
            $('body').html();
            container = null;
        });

        it("should initalize", function() {
            spyOn(sut, 'fetchData');
            spyOn(sut, 'getDefaultLocation').and.callThrough();

            expect(sut).toEqual(jasmine.any(Object));

            sut.init();

            expect(sut.getDefaultLocation).toHaveBeenCalled();
            expect(sut.fetchData).toHaveBeenCalledWith(jasmine.any(Object));
        });

        it("should get default location based on edition", function() {
            var geo      = {
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
            };

            guardian.config.page.edition = 'UK';

            expect(sut.getDefaultLocation()).toEqual(geo['London']);

            guardian.config.page.edition = 'US';

            expect(sut.getDefaultLocation()).toEqual(geo['New York']);

            guardian.config.page.edition = 'AU';

            expect(sut.getDefaultLocation()).toEqual(geo['Sydney']);

            guardian.config.page.edition = '';

            expect(sut.getDefaultLocation()).toEqual(geo['London']);
        });

        xit("should call fetch data", function() {
            window.navigator.geolocation = {
                "getCurrentPosition": function(success) {}
            };

            spyOn(navigator.geolocation, 'getCurrentPosition');

            sut.init();

            expect(navigator.geolocation.getCurrentPosition).toHaveBeenCalledWith(sut.fetchData);
        });

        it("should add weather component to the DOM", function() {
            var mockWeatherData = {
                WeatherIcon: 3,
                Temperature: {
                    Metric: {
                        Value: 9.1
                    }
                }
            };

            var mockCity = 'London';

            sut.views.addToDOM(mockWeatherData, mockCity);

            $weather = $('.weather');

            expect($(".weather__city", $weather).text()).toEqual('London');
            expect($(".weather__temp", $weather).text()).toEqual('9°');
            expect($(".weather__icon", $weather).hasClass('i-weather-' + mockWeatherData["WeatherIcon"])).toBeTruthy();
        });

        it("should bind click event", function() {
            spyOn(sut, "togglePositionPopup");

            sut.bindEvents();

            bean.fire($('.js-get-location')[0], 'click');

            expect(sut.togglePositionPopup).toHaveBeenCalled();
        });
    });
});

