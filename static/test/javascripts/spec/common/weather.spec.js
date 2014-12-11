define([
    'bean',
    'bonzo',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/template',
    'common/modules/weather'
], function (
    bean,
    bonzo,
    $,
    ajax,
    template,
    sut
    ) {

    describe('Weather component', function() {
        var container,
            $weather;

        beforeEach(function () {
            container = bonzo.create(
                '<div><div class="js-weather"></div></div>'
            )[0];

            $('body').append(container);
            localStorage.clear();
        });

        afterEach(function() {
            $('body').html();
            container = null;
        });

        it("should initalize", function() {
            spyOn(sut, 'fetchData');

            expect(typeof sut).toEqual('object');

            sut.init();
            expect(sut.fetchData).toHaveBeenCalledWith(undefined);
        });

        it("should get location from local storage", function() {
            var result = {location: "London"};

            expect(typeof sut.getUserLocation()).toEqual('undefined');

            sut.saveUserLocation("London");
            expect(sut.getUserLocation()).toEqual(result);
        });

        it("should fetch the data and save location", function() {
            var result = {location: "Sydney"};

            sut.fetchData();
            expect(sut.getUserLocation()).toEqual(undefined);

            sut.fetchData("Sydney");
            expect(sut.getUserLocation()).toEqual(result);
        });

        it("should fetch data", function(done) {
            var server = sinon.fakeServer.create();
            server.autoRespond = true;

            server.respondWith([200, { "Content-Type": "application/json" },
                '[{"WeatherIcon": 3}]']);

            sut.getWeatherData("/testurl/").then(function(response) {
                expect(response).toEqual([{WeatherIcon: 3}]);
                done();
            });

            server.restore();
        });

        it("should call proper url", function() {
            spyOn(sut, "getWeatherData");

            sut.fetchData();
            expect(sut.getWeatherData).toHaveBeenCalledWith("/weather/city");

            sut.fetchData("London");
            expect(sut.getWeatherData).toHaveBeenCalledWith("/weather/city/London");
        });

        it("should call render function after fetching the data", function(done) {
            var server = sinon.fakeServer.create();
            server.autoRespond = true;

            server.respondWith([200, { "Content-Type": "application/json" },
                '[{"WeatherIcon": 3}]']);

            spyOn(sut, "render");

            sut.fetchData().then(function() {
                expect(sut.render).toHaveBeenCalledWith({"WeatherIcon": 3}, "London");
                done();
            });

            server.restore();
        });

        it("should add weather component to the DOM", function() {
            var mockWeatherData = {
                    WeatherIcon: 3,
                    Temperature: {
                        Metric: {
                            Value: 9.1,
                            Unit: "C"
                        }
                    }
                },
                mockCity = 'London';

            sut.render(mockWeatherData, mockCity);

            $weather = $('.weather');

            expect($(".js-weather-city", $weather).text()).toEqual('London');
            expect($(".js-weather-temp", $weather).text()).toEqual('9°C');
            expect($(".js-weather-icon", $weather).hasClass('i-weather-' + mockWeatherData["WeatherIcon"])).toBeTruthy();
        });
    });
});

