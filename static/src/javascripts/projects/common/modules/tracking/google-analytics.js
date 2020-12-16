// @flow

import mediator from 'lib/mediator';
import {onConsentChange, getConsentFor} from '@guardian/consent-management-platform';

export const init: () => void = () => {
  onConsentChange(state => {
      const gaHasConsent = getConsentFor('google-analytics', state);
      mediator.emit('ga:gaConsentChange', gaHasConsent);
  })
};
