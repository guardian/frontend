# Standalone Commercial Bundle
The standalone commercial bundle is a new webpack JavaScript bundle
that contains all of The Guardian’s commercial business logic.

In frontend, commercial logic is intertwined with the rest of the JS code,
being loaded as one of the “bootstraps” in [boot.js][frontend]. This means
chunks and conditional loading is all handled by Webpack.

With the introduction of `dotcom-rendering`, commercial scripts needed to to be
executed in different contexts, and a new remote bundle was introduced:
`webpack.config.dcr.js`. The standalone bundle uses the same behaviour in every
context, being loaded via a `<script>` tag injection.

The standalone bundle has the added benefits of caching when switching between
rendering contexts.

- Commercial scripts are loaded via the following bundle: [`standalone.commercial.ts`][]
- There is a separate webpack config for this bundle : [`webpack.config.commercial.js`][]
- The commercial bundle is executed in both [frontend] and [dotcom-rendering][]
- The commercial bundle loads only if the commercial switch is ON.

[`standalone.commercial.ts`]: /static/src/javascripts/bootstraps/standalone.commercial.ts
[frontend]: https://github.com/guardian/frontend/blob/ad8f6734/static/src/javascripts/boot.js#L94
[dotcom-rendering]: https://github.com/guardian/dotcom-rendering/blob/c114bc93/dotcom-rendering/src/web/server/document.tsx#L255
[`webpack.config.commercial.js`]: /webpack.config.commercial.js

The next step is for this bundle to move entirely out of frontend and into
[@guardian/commercial-core](https://github.com/guardian/commercial-core).

The team responsible for the commercial logic is @guardian/commercial-dev.

## Commercial javascript (legacy)
* Commercial scripts run under their own bundle, with the root script /bootstraps/commercial.js
* The commercial bundle only runs if the browser passes the `isModernBrowser` check (i.e. not IE8)
* We interface with Doubleclick for Publishers using the `dfp-api.js` module. Most advertising on The Guardian involves a roundtrip to DFP somehow.
* Individual commercial features are switched on and off in the `commercial-features.js` module. You can see which features are on at any time by opening your console and viewing `guardian.config.commercial.featuresDebug`

See [DFP Advertising](https://github.com/guardian/frontend/wiki/DFP-Advertising) for details on how we target, fetch and render adslots.
