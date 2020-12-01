
import { dateDiffDays } from "lib/time-utils";

describe('calculating the difference between 2 dates', () => {
  it('should return the correct duration', () => {
    const oneDayMs = 1000 * 60 * 60 * 24;

    const now = Date.now();

    expect(dateDiffDays(now, now + oneDayMs)).toBe(1);

    expect(dateDiffDays(now, now + oneDayMs - 1)).toBe(0);

    expect(dateDiffDays(now, now + 4 * oneDayMs - 1)).toBe(3);
  });
});