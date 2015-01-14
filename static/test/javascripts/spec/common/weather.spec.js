define([
    'bean',
    'bonzo',
    'common/utils/$',
    'common/utils/ajax',
    'common/utils/template',
    'helpers/injector'
], function (
    bean,
    bonzo,
    $,
    ajax,
    template,
    Injector
    ) {

    return  new Injector()
        .store('common/utils/config')
        .require(['common/modules/weather', 'mocks'], function (sut, mocks) {
            ddescribe('Weather component', function () {
                var container,
                    $weather;

                beforeEach(function () {
                    container = bonzo.create(
                        '<div><div class="js-weather"></div></div>'
                    )[0];

                    $('body').append(container);
                    localStorage.clear();
                    mocks.store['common/utils/config'].switches = {};
                    mocks.store['common/utils/config'].switches.weather = true;
                });

                afterEach(function () {
                    $('body').html();
                    container = null;
                });

                it("should initalize", function () {
                    spyOn(sut, 'getDefaultLocation');

                    expect(typeof sut).toEqual('object');

                    sut.init();
                    expect(sut.getDefaultLocation).toHaveBeenCalled();
                });

                it("should be behind switches", function() {
                    mocks.store['common/utils/config'].switches.weather = false;

                    spyOn(sut, "getDefaultLocation");

                    expect(sut.init()).toEqual(false);
                    expect(sut.getDefaultLocation).not.toHaveBeenCalled();

                    mocks.store['common/utils/config'].switches = null;
                    expect(sut.init()).toEqual(false);
                    expect(sut.getDefaultLocation).not.toHaveBeenCalled();

                    mocks.store['common/utils/config'].switches = {
                        weather: true
                    };
                    sut.init();
                    expect(sut.getDefaultLocation).toHaveBeenCalled();
                });

                it("should get location from local storage", function () {
                    var result = {id: 1, city: "London"};

                    expect(typeof sut.getUserLocation()).toEqual('undefined');

                    sut.saveUserLocation(result);
                    expect(sut.getUserLocation()).toEqual(result);
                });

                it("should fetch the weather data and save location", function () {
                    var result = {id: '2', city: "Sydney"};

                    spyOn(sut, "getWeatherData").and.returnValue({
                        then: function () {
                            return {
                                fail: function (err, msg) {
                                }
                            }
                        }
                    });

                    sut.fetchWeatherData(result);
                    expect(sut.getUserLocation()).toEqual(result);
                    expect(sut.getWeatherData).toHaveBeenCalled();
                });

                it("should fetch weather data", function (done) {
                    var server = sinon.fakeServer.create();
                    server.autoRespond = true;

                    server.respondWith([200, { "Content-Type": "application/json" },
                        '[{"WeatherIcon": 3}]']);

                    sut.getWeatherData("/testurl/").then(function (response) {
                        expect(response).toEqual([
                            {WeatherIcon: 3}
                        ]);
                        done();
                    });

                    server.restore();
                });

                it("should call proper weather url", function () {
                    var data = {id: '1', city: "London"};

                    spyOn(sut, "getWeatherData").and.returnValue({
                        then: function () {
                            return {
                                fail: function (err, msg) {
                                }
                            }
                        }
                    });

                    mocks.store['common/utils/config'].page.weatherapiurl = '/weather/city';

                    sut.fetchWeatherData(data);
                    expect(sut.getWeatherData).toHaveBeenCalledWith("/weather/city/1.json");
                });

                it("should call render function after fetching the weather data", function (done) {
                    var server = sinon.fakeServer.create(),
                        data = {id: '1', city: "London"};

                    server.autoRespond = true;

                    server.respondWith([200, { "Content-Type": "application/json" },
                        '[{"WeatherIcon": 3}]']);

                    spyOn(sut, "render");

                    sut.fetchWeatherData(data).then(function () {
                        expect(sut.render).toHaveBeenCalledWith({"WeatherIcon": 3}, "London");
                        done();
                    });

                    server.restore();
                });

                it("should add weather component to the DOM", function () {
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

                    expect($(".js-weather-input", $weather).val()).toEqual('London');
                    expect($(".js-weather-temp", $weather).text()).toEqual('9°C');
                    expect($(".js-weather-icon", $weather).hasClass('i-weather-' + mockWeatherData["WeatherIcon"])).toBeTruthy();
                });

                it("should fetch the forecast data", function () {
                    var result = {id: '2', city: "Sydney"};

                    spyOn(sut, "getWeatherData").and.returnValue({
                        then: function () {
                            return {
                                fail: function (err, msg) {
                                }
                            }
                        }
                    });
                    spyOn(sut, "renderForecast");

                    sut.fetchForecastData(result);
                    expect(sut.getWeatherData).toHaveBeenCalled();
                });

                it("should call render function after fetching the forecast data", function (done) {
                    var server = sinon.fakeServer.create(),
                        data = {id: '1', city: "London"};

                    server.autoRespond = true;

                    server.respondWith([200, { "Content-Type": "application/json" },
                        '[{"WeatherIcon": 3}]']);

                    spyOn(sut, "renderForecast");
                    spyOn(sut, "parseForecast").and.returnValue('parsedData');

                    sut.fetchForecastData(data).then(function () {
                        expect(sut.renderForecast).toHaveBeenCalledWith('parsedData');
                        expect(sut.parseForecast).toHaveBeenCalled();
                        done();
                    });

                    server.restore();
                });

                it("should parse the forecast data and return array of three", function() {
                    var mockData = [
                            {"DateTime": "2015-01-13T16:00:00+00:00"},
                            {"DateTime": "2015-01-13T17:00:00+00:00"},
                            {"DateTime": "2015-01-13T18:00:00+00:00"},
                            {"DateTime": "2015-01-13T19:00:00+00:00"},
                            {"DateTime": "2015-01-13T20:00:00+00:00"},
                            {"DateTime": "2015-01-13T21:00:00+00:00"},
                            {"DateTime": "2015-01-13T22:00:00+00:00"},
                            {"DateTime": "2015-01-13T23:00:00+00:00"},
                            {"DateTime": "2015-01-13T00:00:00+00:00"},
                            {"DateTime": "2015-01-13T01:00:00+00:00"},
                            {"DateTime": "2015-01-13T02:00:00+00:00"},
                            {"DateTime": "2015-01-13T03:00:00+00:00"}
                        ],
                        result   = [
                            {"DateTime": "2015-01-13T19:00:00+00:00"},
                            {"DateTime": "2015-01-13T22:00:00+00:00"},
                            {"DateTime": "2015-01-13T01:00:00+00:00"}
                        ];

                    expect(sut.parseForecast(mockData)).toEqual(result);
                });
            });
    });
});

