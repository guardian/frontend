// @flow

import { getLocalCurrencySymbol } from 'lib/geolocation';

export const acquisitionsEpicTickerTemplate = `
    <div id="epic-ticker" class="js-epic-ticker epic-ticker is-hidden">
    
        <div class="js-ticker-amounts">
            <div class="js-ticker-so-far epic-ticker__so-far">
                <div class="js-ticker-count epic-ticker__count">${getLocalCurrencySymbol()}0</div>
                <div class="epic-ticker__count-label">contributed</div>
            </div>
            
            <div class="js-ticker-goal epic-ticker__goal is-hidden">
                <div class="js-ticker-count epic-ticker__count">${getLocalCurrencySymbol()}0</div>
                <div class="epic-ticker__count-label">our goal</div>
            </div>
        </div>
        
        <div class="epic-ticker__progress-container">
            <div class="epic-ticker__progress">
                <div class="js-ticker-filled-progress epic-ticker__filled-progress"></div>
            </div>
        </div>
    </div>
`;
