
import { hideElement } from "commercial/modules/hide-element";
import { RegisterListeners } from "commercial/modules/messenger";

const init = (register: RegisterListeners) => {
  register('hide', (specs, ret, iframe) => {
    if (iframe) {
      const adSlot = iframe.closest('.js-ad-slot');

      if (adSlot) {
        return hideElement(adSlot);
      }
    }
  });
};

export { init };