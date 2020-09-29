

/* eslint-disable guardian-frontend/no-direct-access-config */
import config from "lib/config";
import fetchJson from "lib/fetch-json";
import userPrefs from "common/modules/user-prefs";
import { Weather } from "facia/modules/onwards/weather";

jest.mock('lib/raven');
jest.mock('lib/config');
jest.mock('common/modules/user-prefs');
jest.mock('lib/fetch-json', () => jest.fn());

const fetchJsonMock: JestMockFn<any, any> = (fetchJson as any);

describe('Weather component', () => {
  beforeEach(() => {
    if (document.body) {
      document.body.innerHTML = `
                <div id="headlines">
                    <div class="js-container__header"></div>
                    <div class="js-weather-forecast"></div>
                </div>
            `;
    }
    fetchJsonMock.mockImplementation(() => Promise.resolve());
  });
  afterEach(() => {
    config.page = null;
    config.switches = {
      weather: true
    };
    userPrefs.remove('weather-location');
    fetchJsonMock.mockReset();
  });

  describe('initialisation', () => {
    it('should be behind a switch', () => {
      config.page = {
        pageId: 'uk',
        edition: 'uk'
      };
      config.switches = {
        weather: false
      };

      expect(Weather.init()).toEqual(false);

      config.switches = null;
      expect(Weather.init()).toEqual(false);

      config.switches = {
        weather: true
      };
      expect(Weather.init()).not.toEqual(false);
    });

    it('should initialize only if on front page', () => {
      config.page = {
        pageId: '/social'
      };
      expect(Weather.init()).toEqual(false);

      config.page.pageId = 'uk';
      expect(Weather.init()).not.toEqual(false);
    });

    it('should return false when the page is not network front', () => {
      config.page = {
        pageId: 'uk'
      };
      expect(Weather.init()).not.toEqual(false);

      config.page.pageId = 'us';
      expect(Weather.init()).not.toEqual(false);

      config.page.pageId = 'au';
      expect(Weather.init()).not.toEqual(false);

      config.page.pageId = 'social';
      expect(Weather.init()).toEqual(false);
    });
  });

  it('should get location from user prefs', () => {
    const result = {
      id: 'qux',
      city: 'doo'
    };
    expect(typeof Weather.getUserLocation()).toEqual('undefined');

    Weather.saveUserLocation(result);
    expect(Weather.getUserLocation()).toEqual(result);
  });

  it('should get the default location', () => {
    config.page = {
      weatherapiurl: 'foo',
      edition: 'bar'
    };

    fetchJsonMock.mockImplementationOnce(() => Promise.resolve({
      id: 'qux'
    }));

    return Weather.getDefaultLocation().then(() => {
      expect(fetchJsonMock.mock.calls[0][0]).toEqual('foo.json');
      expect(fetchJsonMock.mock.calls[1][0]).toEqual('foo/qux.json?_edition=bar');
    });
  });

  it('should set data in userprefs and fetchWeatherData if user searches', () => {
    config.page = {
      weatherapiurl: 'foo',
      edition: 'bar'
    };

    const cityPreference = {
      store: 'set',
      id: 'qux',
      city: 'doo'
    };

    Weather.saveDeleteLocalStorage(cityPreference);

    expect(userPrefs.get('weather-location')).toEqual({
      id: 'qux',
      city: 'doo'
    });
    expect(fetchJsonMock.mock.calls[0][0]).toEqual('foo/qux.json?_edition=bar');
  });

  it('should remove data from userprefs and getDefaultLocation if user removes data', () => {
    config.page = {
      weatherapiurl: 'foo',
      edition: 'bar'
    };

    const cityPreference = {
      store: 'remove',
      id: 'qux',
      city: 'doo'
    };

    Weather.saveDeleteLocalStorage(cityPreference);

    expect(userPrefs.get('weather-location')).toBeUndefined();
    expect(fetchJsonMock.mock.calls[0][0]).toEqual('foo.json');
  });

  it('should fetch the data', () => {
    config.page = {
      weatherapiurl: 'foo',
      edition: 'bar'
    };

    Weather.fetchWeatherData({
      id: 'qux',
      city: 'doo'
    });
    expect(fetchJsonMock.mock.calls[0][0]).toEqual('foo/qux.json?_edition=bar');
  });

  it('should call render after fetching the weather data', () => {
    config.page = {
      weatherapiurl: 'foo',
      edition: 'bar'
    };

    fetchJsonMock.mockImplementationOnce(() => Promise.resolve({
      html: `
                    <div class="weather js-weather">
                    <input class="js-search-tool-input" value="<%=city%>"/>
                    <span class="js-weather-temp">4°C</span>
                    <span class="js-weather-icon inline-weather-31"></span>`
    }));

    return Weather.fetchWeatherData({
      id: 'qux',
      city: 'doo'
    }).then(() => {
      if (document.body) {
        expect(document.body.innerHTML).toContain('value="doo"');
      }
    });
  });

  it('should fetch the forecast data', () => {
    config.page = {
      forecastsapiurl: 'foo',
      edition: 'bar'
    };

    Weather.fetchForecastData({
      id: 'qux',
      city: 'doo'
    });
    expect(fetchJsonMock.mock.calls[0][0]).toEqual('foo/qux.json?_edition=bar');
  });

  it('should call render after fetching the forecast data', () => {
    config.page = {
      forecastsapiurl: 'foo',
      edition: 'bar'
    };

    fetchJsonMock.mockImplementationOnce(() => Promise.resolve({
      html: '<div class="forecast"></div>'
    }));

    return Weather.fetchForecastData({
      id: 'qux',
      city: 'doo'
    }).then(() => {
      if (document.body) {
        expect(document.body.innerHTML).toContain('<div class="forecast"></div>');
      }
    });
  });
});