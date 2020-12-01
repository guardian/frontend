

import { saveState, isOn } from "common/modules/accessibility/main";

jest.mock('common/modules/user-prefs');

describe('Accessibility', () => {
  it('saves the state', () => {
    saveState({
      'flashing-elements': true,
      'exploding-avocados': false
    });

    expect(isOn('flashing-elements')).toBe(true);
    expect(isOn('exploding-avocados')).toBe(false);
  });
  it('state is on by default', () => {
    expect(isOn('jumping-weathervanes')).toBe(true);
  });
});