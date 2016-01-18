define([], function () {
    return [
        // AppNexus placements for prebid.js performance A/B test

        // UK desktop
        {edition: 'UK', breakpoint: {min: 'desktop'}, width: 900, height: 250, id: 4298047},
        {edition: 'UK', breakpoint: {min: 'desktop'}, width: 300, height: 600, id: 4298048},
        {edition: 'UK', breakpoint: {min: 'desktop'}, width: 728, height: 90, id: 4298172},
        {edition: 'UK', breakpoint: {min: 'desktop'}, width: 300, height: 250, id: 4298187},
        {edition: 'UK', breakpoint: {min: 'desktop'}, width: 970, height: 250, id: 4298564},
        {edition: 'UK', breakpoint: {min: 'desktop'}, width: 300, height: 250, id: 5938509}, // expandable format

        // UK mobile
        {edition: 'UK', breakpoint: {min: 'mobile', max: 'phablet'}, width: 300, height: 250, id: 4298191},

        // UK tablet
        {edition: 'UK', breakpoint: {min: 'tablet', max: 'tablet'}, width: 728, height: 90, id: 4371640},
        {edition: 'UK', breakpoint: {min: 'tablet', max: 'tablet'}, width: 300, height: 250, id: 4371641},

        // Australia
        {edition: 'AUS', breakpoint: {min: 'desktop'}, width: 300, height: 250, id: 4814044},
        {edition: 'AUS', breakpoint: {min: 'mobile', max: 'phablet'}, width: 300, height: 250, id: 4814325},
        {edition: 'AUS', breakpoint: {min: 'tablet', max: 'tablet'}, width: 300, height: 250, id: 4814336},

        // International
        {edition: 'INT', breakpoint: {min: 'desktop'}, width: 728, height: 90, id: 4825470},
        {edition: 'INT', breakpoint: {min: 'desktop'}, width: 300, height: 250, id: 4825536},
        {edition: 'INT', breakpoint: {min: 'mobile', max: 'phablet'}, width: 300, height: 250, id: 4825476}
    ];
});
