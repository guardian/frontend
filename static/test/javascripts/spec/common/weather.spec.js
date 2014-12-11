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

    ddescribe('Weather component', function() {
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
                '[{ "localizedName": "London"}]']);

            spyOn(sut, "renderList");

            sut.fetchData().then(function() {
                expect(sut.renderList).toHaveBeenCalledWith([{"localizedName": "London"}], 3);
                done();
            });

            server.restore();
        });

        xit("should add weather component to the DOM", function() {
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

        xit("should bind click event", function() {
            spyOn(sut, "togglePositionPopup");

            sut.bindEvents();

            bean.fire($('.js-get-location')[0], 'click');

            expect(sut.togglePositionPopup).toHaveBeenCalled();
        });
    });
});

