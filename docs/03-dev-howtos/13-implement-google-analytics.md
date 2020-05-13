# Implement Google Analytics

This describes how to work with Google Analytics (GA)

## Hints

Always discuss the reporting requirements with [data technology](mailto:data.technology@guardian.co.uk) and [google analytics](google.analyticscore@guardian.co.uk) teams before you implement any new dimensions.

Talk to the mobile apps team early, things can be a slightly different once you take their needs into account (eg: web pages vs app screens)

## Dashboards

- [Google Analytics](https://analytics.google.com)
- [Confidence graph](https://frontend.gutools.co.uk/analytics/confidence)

## Page View tracking

The main entry point for google pageview tracking is in
[`analytics/base.scala.html`](https://github.com/guardian/frontend/blob/master/common/app/views/fragments/analytics/base.scala.html#L12)

We are careful about how many tracking events we push to the GA test so only send 5% of traffic to the test account. In your local environment we are sending 100% to make development easier.

We implement the standard [async GA tracking](https://developers.google.com/analytics/devguides/collection/analyticsjs/)

We then send through all the custom [`dimensions`](https://developers.google.com/analytics/devguides/collection/analyticsjs/custom-dims-mets) to GA.

All of our custom `dimensions` are [`hit scoped`](https://support.google.com/analytics/answer/2709828?hl=en#example-hit) (scopes are `user`, `session` or `hit`)
apart from `dimension15`(identityId) and `dimension2`(ophanBrowserId) which is a `user` scoped

### Data dictionaries
We maintain documentation that describes all the custom `dimensions`, `events` and `metrics` used within GA

- [Dimensions](https://docs.google.com/spreadsheets/d/1MmWHNeeiQE_dzekImIP9Tv4beLx_8JzWx3rOtCp4PGg)
- [Events](https://docs.google.com/spreadsheets/d/1KvBDyguXDtww9qTipD5L3D9NbH4IgkbRFWlbFTA3J2E)
- [Metrics](https://docs.google.com/spreadsheets/d/1KDZ3aImiI3CnSaxAVWOkgBxKQTZqD1QsGRoMDXlc2YQ)

## Events


### Media Events

The main entry point for Media (Video and Audio) tracking is
[`video/events.js`](https://github.com/guardian/frontend/blob/master/static/src/javascripts/projects/common/modules/video/events.js)

This is an example of the media event using the following custom `dimensions`

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

and the following custom [`metrics`](https://developers.google.com/analytics/devguides/collection/analyticsjs/field-reference#metric)

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


Incrementing metrics in this way is done to give a truer account of the actions that are happening on the video. Out of the box it would give a session level interaction, not a hit level.


### Click Events

The main entry point for click tracking is [analytics/interaction-tracking.js](https://github.com/guardian/frontend/blob/master/static/src/javascripts/projects/common/modules/analytics/interaction-tracking.js)

The click actions currently being tracked are:

- In-page clicks (opening nav) that don't cause page load
- Internal clicks (navigating to another internal page on gu.com)
- External clicks (going to another domain)
- Clicks on sponsors' logos (regardless of destination)
- Clicks on native ads

interaction-tracking.js is an abstraction over the top of [clickstream.js](https://github.com/guardian/frontend/blob/master/static/src/javascripts/projects/common/modules/ui/clickstream.js) that sends the events to both Omniture and Google.

TODO:

- When Omniture is removed:
	- Re-implement delay when clicking external links which is currently handled by the omniture JS
	- Re-implement the deletion of session storage which is tracked between pages

### Discussion Events

The comments event is a custom event defined in [analytics/discussion](https://github.com/guardian/frontend/blob/master/static/src/javascripts/projects/common/modules/analytics/discussion.js)

Most discussion events can be tracked with click events so the only GA custom event for discussion is for 'scroll'.

The custom category for tracking a user scrolling to the comments is *element view* with an action of *onpage item* and a label of *scroll to comments*.

### 404 pages

Check [chris's PR](https://github.com/guardian/frontend/pull/14114) for implementation details

### AMP

Main entry point for AMP analytics is
[amp/googleAnalytics.scala.html](https://github.com/guardian/frontend/blob/master/common/app/views/fragments/amp/googleAnalytics.scala.html)


