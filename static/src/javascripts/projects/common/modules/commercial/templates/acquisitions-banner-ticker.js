// @flow

import { getLocalCurrencySymbolSync } from 'lib/geolocation';

export const acquisitionsBannerTickerTemplate = `
    <div id="banner-ticker" class="js-engagement-banner-ticker engagement-banner-ticker is-hidden">
        
        <div class="js-ticker-under-goal is-hidden">
            <div class="js-ticker-so-far engagement-banner-ticker__so-far">
                <div class="js-ticker-count engagement-banner-ticker__count">${getLocalCurrencySymbolSync()}0</div>
                <div class="engagement-banner-ticker__count-label">contributed</div>
            </div>
            
            <div class="js-ticker-goal engagement-banner-ticker__goal">
                <div class="js-ticker-count engagement-banner-ticker__count">${getLocalCurrencySymbolSync()}0</div>
                <div class="engagement-banner-ticker__count-label">our goal</div>
            </div>
        </div>
        
        <div class="js-ticker-over-goal is-hidden">
            <div class="engagement-banner-ticker__thankyou">
                <div>Help us beat our goal - thank you</div>
                <div>Please keep contributing into the new year</div>
            </div>
            
            <div class="js-ticker-exceeded engagement-banner-ticker__exceeded">
                <div class="js-ticker-count engagement-banner-ticker__count">${getLocalCurrencySymbolSync()}0</div>
                <div class="engagement-banner-ticker__count-label">contributed</div>
            </div>
        </div>
        
        <div class="engagement-banner-ticker__progress-container">
            <div class="engagement-banner-ticker__progress">
                <div class="js-ticker-filled-progress engagement-banner-ticker__filled-progress ticker__filled-progress-under"></div>
            </div>
            <div class="js-ticker-goal-marker engagement-banner-ticker__goal-marker is-hidden"></div>
        </div>
    </div>
`;
