

import config from "lib/config";
import { fire } from "./beacon";

jest.mock('lib/config');

describe('beacon', () => {
  config.page = {
    beaconUrl: '//beacon.gu-web.net'
  };

  test('should create correct img element when fired', () => {
    const img = fire('/pv.gif');

    expect(img.nodeName.toLowerCase()).toBe('img');
    expect(img.getAttribute('src')).toBe('//beacon.gu-web.net/pv.gif');
  });
});