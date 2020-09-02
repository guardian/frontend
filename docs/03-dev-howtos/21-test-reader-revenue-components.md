Testing Reader Revenue Components
====================================

## tl;dr

- Check out these functions! https://github.com/guardian/frontend/blob/main/static/src/javascripts/projects/common/modules/commercial/reader-revenue-dev-utils.js
- Check out this page! http://reader-revenue-bookmarklets.s3-website-eu-west-1.amazonaws.com/

## Components

www.theguardian.com is the main driver of traffic for our reader revenue sites, in particular support.theguardian.com where sign-ups for one-off and recurring contributions occur.

The components which drive the most traffic are:

## The epic
- Sits in the document flow, at the bottom of article copy
- Typically only displays for a certain number of views in a given time window (normally 4 in 30 days)
- Won't display if the user is a signed in Recurring Contributor or Digipack Subscriber (important note: whether or not you are signed in has **no bearing** on the epic being showed if you have made a **one-off contribution**)
- Won't display if the browser has a **recurring contribution cookie**
- Won't display if the broswer has a **one-off contribution cookie** from within the **last 6 months**
- Won't display on pages which have the `window.guardian.config.page.shouldHideReaderRevenue` flag set (this is set by editorial in Composer)

![picture 416](https://user-images.githubusercontent.com/5122968/49798164-891ad380-fd39-11e8-9835-cbd4c2050bc0.png)


## The engagement banner
- Is a fixed position banner at the bottom of the screen (like the breaking news banner, cookie consent banner, etc)
- Only displays after a certain number of pageviews
- Will not re-display after it's closed, until we "redeploy" (globally force a re-display) via this tool: https://frontend.gutools.co.uk/reader-revenue/contributions-banner
- Won't display if the user is a signed in Recurring Contributor or Digipack Subscriber (important note: whether or not you are signed in has **no bearing** on the epic being showed if you have made a one-off contribution)
- Won't display if the browser has a **recurring contribution cookie**
- Won't display if the broswer has a **one-off contribution cookie** from within the **last 6 months**
- Won't display on pages which have the `window.guardian.config.page.shouldHideReaderRevenue` flag set (this is set by editorial in Composer)

![picture 417](https://user-images.githubusercontent.com/5122968/49798163-891ad380-fd39-11e8-8645-5f07c389e4f1.png)

## How do I re-deploy the engagement banner?
https://frontend.gutools.co.uk/reader-revenue/contributions-banner

## Why can't I see the epic or banner?
- The rules which determine whether these display on a given pageview are complex enough that getting them to display can be a pain.
- On top of this, we are almost always running tests on these components which means there are different variants in production.
- And on top of that, we often have region-specific copy, either as a test or simply as a region-specific control.
- Typically when making changes to these components, you will want to double-check all variants in our main regions (US, UK, Australia).

## Helper functions
We have some helper functions, exposed on `window.guardian.readerRevenue`, which can help with this problem.

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

See here for code and additional comments: https://github.com/guardian/frontend/blob/main/static/src/javascripts/projects/common/modules/commercial/reader-revenue-dev-utils.js

## Bookmarklets
You can call those functions from the console if you like. But if you want to use them as handy bookmarklets, go here: http://reader-revenue-bookmarklets.s3-website-eu-west-1.amazonaws.com/
