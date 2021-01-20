import fastdom from 'lib/fastdom-promise';

import loadEnhancers from './modules/loadEnhancers';

const showJourney = (journeyEl) =>
    fastdom.mutate(() => journeyEl.classList.remove('u-h'));

const hideLoading = (loadingEl) =>
    fastdom.mutate(() => loadingEl.remove());

const enhanceConsentJourney = () => {
    const loaders = [
        ['.identity-consent-journey', showJourney],
        ['#identityConsentsLoadingError', hideLoading],
    ];
    loadEnhancers(loaders);
};

export { enhanceConsentJourney };
