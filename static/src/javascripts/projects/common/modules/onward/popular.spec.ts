

import Chance from "chance";
import config from "lib/config";
import { MostPopular } from "common/modules/onward/popular";

const chance = new Chance();

describe('Most popular', () => {
  test('should request most popular for most sections', () => {
    config.page.section = chance.word();
    const popular = new MostPopular();

    expect(popular.endpoint).toBe(`/most-read/${config.page.section}.json`);
  });

  test('should only request global most popular for blacklisted sections', () => {
    config.page.section = 'info';
    const popular = new MostPopular();

    expect(popular.endpoint).toBe('/most-read.json');
  });
});