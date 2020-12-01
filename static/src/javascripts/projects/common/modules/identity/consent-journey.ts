

import fastdom from "lib/fastdom-promise";

import loadEnhancers from "./modules/loadEnhancers";

const showJourney = (journeyEl: HTMLElement): Promise<void> => fastdom.mutate(() => journeyEl.classList.remove('u-h'));

const hideLoading = (loadingEl: HTMLElement): Promise<void> => fastdom.mutate(() => loadingEl.remove());

const enhanceConsentJourney = (): void => {
  const loaders = [['.identity-consent-journey', showJourney], ['#identityConsentsLoadingError', hideLoading]];
  loadEnhancers(loaders);
};

export { enhanceConsentJourney };