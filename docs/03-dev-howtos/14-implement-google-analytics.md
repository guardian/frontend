## Impliment Google Analytics

This describes how to work with Google Analytics (GA)

## Hints

Always discuss the reporting requirements before you impliment any new dimensions.
Talk to the mobile apps team early, things can always be a bit different once you take their needs into account

## Dashboards

Google Analytics
https://analytics.google.com

Confidence graph
https://frontend.gutools.co.uk/analytics/confidence

## Start Here

# Page View tracking

The main entry point for google pageview tracking is in
[`analytics/base.scala.html`](https://github.com/guardian/frontend/blob/master/common/app/views/fragments/analytics/base.scala.html#L12)

All the Page View tracking happens in [`google.scala.html`](https://github.com/guardian/frontend/blob/master/common/app/views/fragments/analytics/google.scala.html)

We are carefull about how many tracking events we push to the GA test so only send 5% of traffic to the test account. In your local environment we are sending 100% to make development easier.

We impliment the standard [async GA tracking](https://developers.google.com/analytics/devguides/collection/analyticsjs/)

We then send through all the custom [`dimensions`](https://developers.google.com/analytics/devguides/collection/analyticsjs/custom-dims-mets) to GA.

All of our custom `dimensions` are [`hit`](https://support.google.com/analytics/answer/2709828?hl=en#example-hit) (scopes are `user`, `session` or `hit`)
Apart from `dimension15`(identityId) and `dimension2`(ophanBrowserId) which is a `user` scoped

## Data dictionaries
We maintain documenation that describes all the custom `dimensions`, `events` and `metrics` used within GA

- [Dimensions](https://docs.google.com/spreadsheets/d/1MmWHNeeiQE_dzekImIP9Tv4beLx_8JzWx3rOtCp4PGg)
- [Events](https://docs.google.com/spreadsheets/d/1KvBDyguXDtww9qTipD5L3D9NbH4IgkbRFWlbFTA3J2E)
- [Metrics](https://docs.google.com/spreadsheets/d/1KDZ3aImiI3CnSaxAVWOkgBxKQTZqD1QsGRoMDXlc2YQ)

# Media Events

The main entry point for Media (Video and Audio) tracking is
[`ttvideo/events.js`](https://github.com/guardian/frontend/blob/master/static/src/javascripts/projects/common/modules/video/events.js)

Uses the following `dimensions`

```
    var fieldsObject = {
        eventCategory: category,
        eventAction: action,
        eventLabel: canonicalUrl,
        dimension19: mediaEvent.mediaId,
        dimension20: playerName
    };
    // Increment the appropriate metric based on the event type
    var metricId = metrics[mediaEvent.eventType];
    if (metricId) {
        fieldsObject[metricId] = 1;
    }
```

and the following [`metrics`](https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#metric)
```
    var events = {
        'play': 'metric1',
        'skip': 'metric2',
        'watched25': 'metric3',
        'watched50': 'metric4',
        'watched75': 'metric5',
        'end': 'metric6'
    };
```


Incrimenting metrics is done to give a truer account of the actions that are happening on the video, out of the box, it would give a session level interaction, not a hit level.


# Click Events

The main entry point for click tracking is [analytics/interaction-tracking.js](https://github.com/guardian/frontend/blob/master/static/src/javascripts/projects/common/modules/analytics/interaction-tracking.js)

Click events are:

In page click (opening nav) that don't cause page load
Internal click (navigating to another internal page on gu.com)
External clicks (going to another domain)

This listens to the Mediator events, and impliments tracking in both google and omniture

TODO:

Impliment delay after omniture is removed
Impliment sessions storage deletion


