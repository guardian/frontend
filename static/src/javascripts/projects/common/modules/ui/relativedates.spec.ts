

import { init as relativeDatesInit, makeRelativeDate, replaceLocaleTimestamps } from "./relativedates";

const markup = `
    <time id="time-valid" class="js-timestamp" datetime="2012-08-12T18:43:00.000Z">12th August</time>
    <time id="time-invalid" class="js-timestamp" datetime="201-08-12agd18:43:00.000Z">Last Tuesday</time>
    <time id="time-locale" class="js-locale-timestamp" datetime="2014-06-13T17:00:00+0100" data-timestamp="1402675200000">16:00</time>
`;

const fakeNowEpoch = Date.parse('2012-08-13T12:00:00+01:00');
const OriginalDate = global.Date;

beforeEach(() => {
  if (document.body) {
    document.body.innerHTML = markup;
  }

  // This is a *partial* implementation of Date.
  global.Date = jest.fn(dateString => {
    if (dateString !== undefined) {
      return new OriginalDate(dateString);
    }
    return new Date(Number(fakeNowEpoch));
  });
  global.Date.now = jest.fn(() => new OriginalDate(fakeNowEpoch));
  global.Date.parse = jest.fn(dateString => OriginalDate.parse(dateString));
});

afterEach(() => {
  if (document.body) {
    document.body.innerHTML = '';
  }

  global.Date = OriginalDate;
});

const datesToTest = {
  lessThanAMinuteAgo: {
    date: '2012-08-13T11:59:50+01:00',
    expectedOutput: '10s',
    expectedShortOutput: '10s',
    expectedMedOutput: '10s ago',
    expectedLongOutput: '10 seconds ago'
  },
  oneMinuteAgo: {
    // singular
    date: '2012-08-13T11:58:40+01:00',
    expectedOutput: '1m',
    expectedShortOutput: '1m',
    expectedMedOutput: '1m ago',
    expectedLongOutput: '1 minute ago'
  },
  upToEightMinutesAgo: {
    // plural
    date: '2012-08-13T11:52:30+01:00',
    expectedOutput: '8m',
    expectedShortOutput: '8m',
    expectedMedOutput: '8m ago',
    expectedLongOutput: '8 minutes ago'
  },
  oneHourAgo: {
    // singular
    date: '2012-08-13T11:00:00+01:00',
    expectedOutput: '1h',
    expectedShortOutput: '1h',
    expectedMedOutput: '1h ago',
    expectedLongOutput: '1 hour ago'
  },
  betweenNinetyMinutesAndOneHour: {
    // bug GFE-38
    date: '2012-08-13T10:25:00+01:00',
    expectedOutput: '2h',
    expectedShortOutput: '2h',
    expectedMedOutput: '2h ago',
    expectedLongOutput: '2 hours ago'
  },
  lessThanFiveHoursAgo: {
    // plural
    date: '2012-08-13T08:30:00+01:00',
    expectedOutput: '4h',
    expectedShortOutput: '4h',
    expectedMedOutput: '4h ago',
    expectedLongOutput: '4 hours ago'
  },
  moreThanFiveHoursAgo: {
    // ... but still today
    date: '2012-08-13T02:03:00+01:00',
    expectedOutput: '10h',
    expectedShortOutput: '10h',
    expectedMedOutput: '10h ago',
    expectedLongOutput: '10 hours ago'
  },
  yesterday: {
    date: '2012-08-12T08:45:00+01:00',
    expectedOutput: 'Yesterday 8:45',
    expectedShortOutput: '1d',
    expectedMedOutput: '1d ago',
    expectedLongOutput: 'Yesterday 8:45'
  },
  yesterdayButWithinTwentyFourHours: {
    date: '2012-08-12T20:00:00+01:00',
    expectedOutput: 'Yesterday 20:00',
    expectedShortOutput: '16h',
    expectedMedOutput: '16h ago',
    expectedLongOutput: 'Yesterday 20:00'
  },
  moreThanTwoDaysAgo: {
    date: '2012-08-09T08:34:00+01:00',
    expectedOutput: 'Thursday 9 Aug 2012',
    expectedShortOutput: '4d',
    expectedMedOutput: '4d ago',
    expectedLongOutput: 'Thursday 9 Aug 2012'
  },
  moreThanFiveDaysAgo: {
    date: '2012-08-05T21:30:00+01:00',
    expectedOutput: '5 Aug 2012',
    expectedShortOutput: '5 Aug 2012',
    expectedMedOutput: '5 Aug 2012',
    expectedLongOutput: '5 Aug 2012'
  },
  oneMinuteAgoInAnotherTimeZone: {
    date: '2012-08-13T12:58:40+02:00',
    expectedOutput: '1m',
    expectedShortOutput: '1m',
    expectedMedOutput: '1m ago',
    expectedLongOutput: '1 minute ago'
  }
};

Object.keys(datesToTest).forEach(category => {
  describe(`Show relative dates for timestamps formatted as YYYY-MM-DD HH:MM:SS [${category}]`, () => {
    const d = datesToTest[category];
    const epoch = Date.parse(d.date);

    test('standard', () => {
      expect(makeRelativeDate(epoch)).toBe(d.expectedOutput);
    });

    test('short', () => {
      expect(makeRelativeDate(epoch, { format: 'short' })).toBe(d.expectedShortOutput);
    });

    test('med', () => {
      expect(makeRelativeDate(epoch, { format: 'med' })).toBe(d.expectedMedOutput);
    });

    test('long', () => {
      expect(makeRelativeDate(epoch, { format: 'long' })).toBe(d.expectedLongOutput);
    });
  });
});

test('Return the input date if said date is in the future', () => {
  const epochBug = '2038-01-19T03:14:07';
  const dat = Date.parse(epochBug);
  expect(makeRelativeDate(dat)).toBe(false);
});

test('Fail politely if given non-date / invalid input for either argument', () => {
  const nonsensicalEpoch = 10000000000000; // Beyond valid date range
  expect(makeRelativeDate(nonsensicalEpoch)).toBe(false);
});

test("Fail politely if the date is older than a 'notAfter' value", () => {
  const tenSecondsAgo = fakeNowEpoch - 10 * 1000;
  expect(makeRelativeDate(tenSecondsAgo, { notAfter: 9 })).toBe(false);
});

test('Convert valid timestamps in the HTML document into their expected output', () => {
  relativeDatesInit();
  const el = document.getElementById('time-valid');
  const text = el ? el.innerHTML : '';
  const title = el ? el.getAttribute('title') : '';

  expect(text).toBe('Yesterday 19:43');
  expect(title).toBe('12th August');
});

test('Ignore invalid timestamps', () => {
  relativeDatesInit();
  const el = document.getElementById('time-invalid');
  const text = el ? el.innerHTML : '';
  expect(text).toBe('Last Tuesday');
});

test('Should convert timestamps in document to users locale', () => {
  replaceLocaleTimestamps();
  const el = document.getElementById('time-locale');
  const text = el ? el.innerHTML : '';
  expect(text).toBe('17:00');
});

test('Should convert timestamps in HTML element to users locale', () => {
  const inner = `<time id="time-locale" class="js-locale-timestamp" datetime="2014-06-13T17:00:00+0100" data-timestamp="1402675200000">16:00</time>`;
  const fixture = document.createElement('div');
  fixture.innerHTML = inner;
  replaceLocaleTimestamps(fixture);

  const el = fixture.querySelector('#time-locale');
  const text = el ? el.innerHTML : '';
  expect(text).toBe('17:00');
});