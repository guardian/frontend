#Header bidding

_This document assumes you're already familiar with how DFP advertising operates. If you aren't, take a look at Google's
[DFP publisher university](http://g.co/PublisherU)._

Normally, when we request an advert from DFP, Google compares different line items with different values, finds the most
lucrative, and sends back its creative. This is how most publishers use DFP, and it works well - as long as your advertisers
are all part of the DFP ecosystem.

What happens, though, if they aren't? _Header bidding_ allows the _browser_ to run an auction on an adslot before making
a request to Google. DFP compares the value of the auction's winning bid to its own inventory, and can choose to either
send back a creative that displays the auction's winning ad, or - if it can trump the bid - a creative of its own.

This document will explain how the browser performs auctions, how DFP responds to them, and how the adverts are
displayed.

##Overview

![Header bidding workflow diagram](https://cloud.githubusercontent.com/assets/3148617/13568947/e35ab8cc-e45c-11e5-89a0-6413312e30e0.png)

##Step 1: The browser auctions an ad-slot

The browser needs to

 - ask partners what they can pay for an ad-slot that support particular sizes, with certain page targeting data
 - wait for their responses
 - choose the winning bid
 - put information about the winning bid on the DFP slot's targeting data
 - dispatch a request for that advert as per usual

Most of this will be done with the help of a library - currently we use [Prebid.js](http://prebid.org), loaded and
proxied by a module named `PrebidService.js`. Prebid calls third party services like AppNexus and Rubicon with the help
of plugins termed [adapters](https://github.com/prebid/Prebid.js/tree/master/src/adapters).

Whenever we want to load a slot, we queue a request with PrebidService. Prebid can only run one auction at a time; this
is probably reasonable given the small size of most browsers' HTTP connection pools (10 concurrent requests on desktop
Chrome).

How partners are actually requested is a detail of that partner's prebid adapter, but typically you might expect a
single request per creative size (this is at least the case in AppNexus and Rubicon Fastlane). These requests might be
made as asynchronous script fetches (AppNexus), or as real XHRs.

Once _either_ all the requests have returned, _or_ a configurable timeout is reached, then Prebid chooses the best offer
available and invokes a `bidsBackHandler` callback. It's here that _we_ add targeting data to the slot and dispatch the
DFP request.

**Targeting data**

Winner details are added as key-value pairs on the adslot's targeting. Prebid lets us map each key to a function of our
own that takes the auction response JSON and returns some  string value:

 - a Prebid-specific identifier is passed as an `hb_adid` string
 - the winner's name (e.g. AppNexus) is passed under `hb_bidder`
 - the winning value is aliased to a bucket (e.g. $6.33 => '6.00') and passed as `hb_pb`.

##Step 2: DFP executes a competition

DFP doesn't know anything about Prebid or any of the targeting values we pass. To make them work, we must create line
items that target them and are configured with inherent price values that Doubleclick _can_ use.

As an example, we might have a line item that:

 - matches when `hb_pb` equals "6.00", to represent a bid in the $6.00 to $6.49 bucket;
 - has a native value of $6.50, so that DFP can compare it to other line items and running campaigns;
 - only matches when `hb_bidder` equals "Rubicon", so AdOps can turn off _only_ that provider's ads if something goes wrong


##Step 3: Displaying the advert

Each line item points to a single, shared 'proxy creative' that has no content of its own, but only a script tag like
the following:

```
window.top.pbjs.renderAd(document, '%%PATTERN:hb_adid%%');
```

This tells the prebid.js script loaded in the browser to go ahead and display the advert it has waiting in memory.
