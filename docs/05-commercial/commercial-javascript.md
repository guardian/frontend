* Commercial scripts run under their own bundle, with the root script /bootstraps/commercial.js
* The commercial bundle only runs if the browser passes the `isModernBrowser` check (i.e. not IE8)
* We interface with Doubleclick for Publishers using the `dfp-api.js` module. Most advertising on The Guardian involves a roundtrip to DFP somehow.
* Individual commercial features are switched on and off in the `commercial-features.js` module. You can see which features are on at any time by opening your console and viewing `guardian.config.commercial.featuresDebug`

See [DFP Advertising](https://github.com/guardian/frontend/wiki/DFP-Advertising) for details on how we target, fetch and render adslots.
