define([
    'bean',
    'bonzo',
    'common/utils/$',
    'common/utils/ajax',
    'helpers/injector'
], function (
    bean,
    bonzo,
    $,
    ajax,
    Injector
    ) {

    return new Injector()
        .store('common/utils/config')
        .store('common/utils/mediator')
        .require(['facia/modules/onwards/weather', 'mocks'], function (sut, mocks) {
            describe('Weather component', function () {
                var container,
                    $weather;

                beforeEach(function () {
                    container = bonzo.create(
                        '<div class="js-container--first"><div class="js-container__header"></div></div>'
                    )[0];

                    $('body').append(container);
                    localStorage.clear();
                    mocks.store['common/utils/config'].switches = {};
                    mocks.store['common/utils/config'].switches.weather = true;
                    mocks.store['common/utils/config'].page.edition = 'uk';
                });

                afterEach(function () {
                    $('body').html();
                    container = null;
                });

                it("should be behind switches", function() {
                    mocks.store['common/utils/config'].page.pageId = 'uk';
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

                it("should initialize only if on front page", function() {
                    spyOn(sut, "getDefaultLocation");

                    mocks.store['common/utils/config'].switches = {
                        weather: true
                    };

                    mocks.store['common/utils/config'].page.pageId = '/social';
                    sut.init();
                    expect(sut.getDefaultLocation).not.toHaveBeenCalled();

                    mocks.store['common/utils/config'].page.pageId = 'uk';
                    sut.init();
                    expect(sut.getDefaultLocation).toHaveBeenCalled();
                });

                it("should return false when the page is not front", function() {
                    mocks.store['common/utils/config'].page.pageId = 'uk';
                    expect(sut.isNetworkFront()).toBeTruthy();

                    mocks.store['common/utils/config'].page.pageId = 'us';
                    expect(sut.isNetworkFront()).toBeTruthy();

                    mocks.store['common/utils/config'].page.pageId = 'au';
                    expect(sut.isNetworkFront()).toBeTruthy();

                    mocks.store['common/utils/config'].page.pageId = 'social';
                    expect(sut.isNetworkFront()).toBeFalsy();
                });

                it("should get location from local storage", function () {
                    var result = {id: 1, city: "London"};

                    expect(typeof sut.getUserLocation()).toEqual('undefined');

                    sut.saveUserLocation(result);
                    expect(sut.getUserLocation()).toEqual(result);
                });

                it("should get the default location and track it", function(done) {
                    var server = sinon.fakeServer.create(),
                        data = {id: '1', city: "London"};

                    spyOn(sut, "track");
                    spyOn(sut, "fetchWeatherData");

                    server.autoRespond = true;

                    server.respondWith([200, { "Content-Type": "application/json" },
                        '[{"WeatherIcon": 3}]']);

                    sut.getDefaultLocation().then(function () {
                        expect(sut.fetchWeatherData).toHaveBeenCalled();
                        expect(sut.track).toHaveBeenCalled();
                        done();
                    });

                    server.restore();
                });

                it("should remove data from localStorage and fetchWeatherData if user searches", function() {
                    spyOn(sut, "saveUserLocation");
                    spyOn(sut, "fetchWeatherData");

                    sut.saveDeleteLocalStorage({store: "set"});

                    expect(sut.saveUserLocation).toHaveBeenCalled();
                    expect(sut.fetchWeatherData).toHaveBeenCalled();
                });

                it("should save data to localStorage and getDefaultLocation if user remove data", function() {
                    spyOn(sut, "clearLocation");
                    spyOn(sut, "getDefaultLocation");

                    sut.saveDeleteLocalStorage({store: "remove"});

                    expect(sut.clearLocation).toHaveBeenCalled();
                    expect(sut.getDefaultLocation).toHaveBeenCalled();
                });

                it("should fetch the data", function () {
                    var result = {id: '2', city: "Sydney", store: true};

                    spyOn(sut, "getWeatherData").and.returnValue({
                        then: function () {
                            return {
                                fail: function (err, msg) {
                                }
                            }
                        }
                    });

                    sut.fetchWeatherData(result);
                    expect(sut.getWeatherData).toHaveBeenCalled();
                });

                it("should fetch the data and not to save location if using fastly geoip", function () {
                    var result = {id: '2', city: "Sydney"};

                    spyOn(sut, "getWeatherData").and.returnValue({
                        then: function () {
                            return {
                                fail: function (err, msg) {
                                }
                            }
                        }
                    });
                    spyOn(sut, "saveUserLocation");

                    sut.fetchWeatherData(result);
                    expect(sut.saveUserLocation).not.toHaveBeenCalled();
                    expect(sut.getWeatherData).toHaveBeenCalled();
                });

                it("should fetch weather data", function (done) {
                    var server = sinon.fakeServer.create();
                    server.autoRespond = true;

                    server.respondWith([200, { "Content-Type": "application/json" },
                        '[{"weatherIcon": 3}]']);

                    sut.getWeatherData("/testurl/").then(function (response) {
                        expect(response).toEqual([
                            {weatherIcon: 3}
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
                    expect(sut.getWeatherData).toHaveBeenCalledWith("/weather/city/1.json?_edition=uk");
                });

                it("should call render function after fetching the weather data", function (done) {
                    var server = sinon.fakeServer.create(),
                        data = {id: '1', city: "London"};

                    server.autoRespond = true;

                    server.respondWith([200, { "Content-Type": "application/json" },
                        '{"weatherIcon": 3}']);

                    spyOn(sut, "render");

                    sut.fetchWeatherData(data).then(function () {
                        expect(sut.render).toHaveBeenCalledWith({"weatherIcon": 3}, "London");
                        done();
                    });

                    server.restore();
                });

                it("should add weather component to the DOM", function () {
                    spyOn(sut, "bindEvents");
                    spyOn(sut, "addSearch").and.callThrough();

                    var mockWeatherData = {
                            html: '<div class="weather js-weather">' +
                                '<input class="js-search-tool-input" value="{{city}}"/>' +
                                '<span class="js-weather-temp">4°C</span>' +
                                '<span class="js-weather-icon inline-weather-31"></span>'

                        },
                        mockCity = 'London';

                    sut.render(mockWeatherData, mockCity);

                    $weather = $('.weather');

                    expect($(".js-search-tool-input", $weather).val()).toEqual('London');
                    expect($(".js-weather-temp", $weather).text()).toEqual('4°C');
                    expect($(".inline-weather-31", $weather).length).toEqual(1);
                    expect(sut.bindEvents).toHaveBeenCalled();
                    expect(sut.addSearch).toHaveBeenCalled();

                    mockWeatherData = {
                        html: '<div class="weather js-weather">' +
                            '<input class="js-search-tool-input" value="{{city}}"/>' +
                            '<span class="js-weather-temp">6°C</span>' +
                            '<span class="js-weather-icon inline-weather-12"></span>'

                    };
                    mockCity = 'Sydney';

                    var $body = $('body');
                    $body.html('');
                    $body.append(container);

                    sut.render(mockWeatherData, mockCity);
                    expect($(".js-search-tool-input", $body).val()).toEqual('Sydney');
                    expect($(".js-weather-temp", $body).text()).toEqual('6°C');
                    expect($(".inline-weather-12", $body).length).toEqual(1);
                    expect(sut.bindEvents.calls.count()).toEqual(1);
                    expect(sut.addSearch.calls.count()).toEqual(1);
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
                        '[{"weatherIcon": 3}]']);

                    spyOn(sut, "renderForecast");

                    sut.fetchForecastData(data).then(function () {
                        expect(sut.renderForecast).toHaveBeenCalled();
                        done();
                    });

                    server.restore();
                });
            });
    });
});

