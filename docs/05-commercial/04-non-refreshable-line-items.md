# Non-refreshable line items

Most line items (adverts) on the Guardian are refreshed every 30 seconds. Line items which don't refresh are known as _non-refreshable_. Generally these are just the line items in Google Ad Manager with [sponsorship type](https://support.google.com/admanager/answer/177426). There are two exceptions to this:

-   Line items from the advertiser "Amazon Transparent Ad Marketplace" are refreshable
-   Prebid line items are refreshable

These are both cases of the "sponsorship" type being applied to line items which aren't actually sponsored, for operational reasons.

Information about whether a line item should refresh isn't available when slots are filled on the page. Therefore it is necessary to maintain an array of the non-refreshable line item IDs and deliver it to the page so each slot can check whether its ID is part of the array, and not refresh if so.

## How the list is populated

The list of non-refreshable line item IDs is generated every 2 minutes via a call to the Google Ad Manager API. The resulting array is filtered to exclude prebid and amazon line items (see above) and stored in S3. The filename in S3 is `non-refreshable-lineitem-ids-v1.json`.

See: [job schedule](https://github.com/guardian/frontend/blob/main/admin/app/dfp/DfpDataCacheLifecycle.scala), [job](https://github.com/guardian/frontend/blob/main/admin/app/dfp/DfpDataCacheJob.scala), [GAM API call](https://github.com/guardian/frontend/blob/main/admin/app/dfp/DfpApi.scala)

## How the list is consumed

The list is exposed via the [endpoint](https://www.theguardian.com/commercial/non-refreshable-line-items.json):

```
/commercial/non-refreshable-line-items.json
```

When an ad slot becomes viewable, an asynchronous call is made to this endpoint and the result is used 30 seconds later when the check is made to decide whether or not to refresh. The call is memoized so we only make one network request regardless of the number of ads that become viewable on the page.

See: [on-slot-viewable.ts](https://github.com/guardian/frontend/blob/main/static/src/javascripts/projects/commercial/modules/dfp/on-slot-viewable.ts)
