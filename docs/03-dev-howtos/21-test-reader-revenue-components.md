Testing Reader Revenue Components
====================================

www.theguardian.com is the main driver of traffic for our reader revenue sites, in particular support.theguardian.com where sign-ups for one-off and recurring contributions occur.

The components which drive the most traffic are:
- The epic
- The engagement banner

The rules which determine whether these display on a given pageview are complex enough that getting them to display can be a pain.
On top of this, we are almost always running tests on these components which means there are different variants in production.
And on top of that, we often have region-specific copy, either as a test or simply as a region-specific control.
Typically when making changes to these components, you will want to double-check all variants in our main regions (US, UK, Australia).

We have some helper functions, exposed on `window.guardian.readerRevenue`, which can help with this problem.

These are defined here: https://github.com/guardian/frontend/blob/master/static/src/javascripts/projects/common/modules/commercial/reader-revenue-dev-utils.js

```javascript

    window.guardian.readerRevenue = {
        showMeTheEpic,
        showMeTheBanner,
        showNextVariant,
        showPreviousVariant,
        changeGeolocation,
    };

```

All of these accept no arguments and return nothing.
They will ensure that all cookies and localStorage items are set up correctly, and reload the page.

You can call them from the console if you like. But if you want to use them as handy bookmarklets, go here: http://reader-revenue-bookmarklets.s3-website-eu-west-1.amazonaws.com/


