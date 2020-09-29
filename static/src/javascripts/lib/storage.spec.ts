

import { local, session } from "lib/storage";

const IO = [{
  key: 'test-1',
  data: 'string',
  expected: '{"value":"string"}',
  options: {}
}, {
  key: 'test-2',
  data: { foo: 'bar' },
  expected: '{"value":{"foo":"bar"}}',
  options: {}
}, {
  key: 'test-3',
  data: [true, 2, 'bar'],
  expected: '{"value":[true,2,"bar"]}',
  options: {}
}, {
  key: 'test-4',
  data: 'test-4',
  options: {
    expires: new Date('2100-01-01')
  },
  expected: '{"value":"test-4","expires":"2100-01-01T00:00:00.000Z"}'
}, {
  key: 'test-5',
  data: false,
  expected: '{"value":false}',
  options: {}
}];

const testStorage = (storageName, fn) => {
  const engine = fn;

  beforeEach(() => {
    engine.available = true;
    IO.forEach(({
      key,
      data,
      options
    }) => {
      engine.set(key, data, options);
    });
  });

  afterEach(() => {
    IO.forEach(({
      key
    }) => {
      engine.remove(key);
    });
  });

  test(`${storageName} - isAvailable()`, () => {
    engine.available = undefined;
    expect(engine.isAvailable()).toBe(true);
    expect(engine.available).toBe(true);
  });

  test(`${storageName} - is(Not)Available()`, () => {
    const origStorage = engine.storage;

    // not available, if setItem fails
    engine.available = undefined;
    engine.storage = {
      setItem() {
        throw new Error('Problem!');
      }
    };
    expect(engine.isAvailable()).toBe(false);

    engine.storage = origStorage;
  });

  test(`${storageName} - isAvailable() cache`, () => {
    // not available, if setItem fails
    engine.available = false;
    expect(engine.isAvailable()).toBe(false);
  });

  test(`${storageName} - set()`, () => {
    IO.forEach(({
      key,
      data,
      expected,
      options
    }) => {
      engine.set(key, data, options);
      expect(engine.storage.getItem(key)).toBe(expected);
    });
  });

  test(`${storageName} - get()`, () => {
    IO.forEach(({
      key,
      data
    }) => {
      expect(engine.get(key)).toEqual(data);
    });
  });

  test(`${storageName} - get() with expired item`, () => {
    IO.filter(item => item.options && item.options.expires).forEach(expired => {
      const {
        key
      } = expired;
      const OriginalDate = global.Date;

      global.Date = jest.fn(dateString => new OriginalDate(dateString || '2100-01-02'));

      expect(engine.get(key)).toEqual(null);

      global.Date = OriginalDate;
    });
  });

  test(`${storageName} - get() with non-expired item`, () => {
    IO.filter(item => item.options && item.options.expires).forEach(nonExpiredItem => {
      const {
        key,
        data
      } = nonExpiredItem;
      const OriginalDate = global.Date;

      global.Date = jest.fn(dateString => new OriginalDate(dateString || '2099-01-01'));

      expect(engine.get(key)).toEqual(data);

      global.Date = OriginalDate;
    });
  });

  test(`${storageName} - getRaw()`, () => {
    IO.filter(item => item.options && !item.options.expires).forEach(({
      key,
      expected
    }) => {
      expect(engine.getRaw(key)).toBe(expected);
    });
  });

  test(`${storageName} - remove()`, () => {
    IO.forEach(({
      key
    }) => {
      engine.remove(key);
      expect(engine.storage.getItem(key)).toBeNull();
    });
  });
};

describe('sessionStorage', () => {
  testStorage('session', session);
});

describe('localStorage', () => {
  testStorage('local', local);
});