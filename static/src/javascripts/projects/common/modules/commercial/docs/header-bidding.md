# Header bidding

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

## Overview

![Header bidding workflow diagram](https://cloud.githubusercontent.com/assets/3148617/13568947/e35ab8cc-e45c-11e5-89a0-6413312e30e0.png)

## Step 1: The browser auctions an ad-slot via Sonobi

The browser needs to

 - ask Sonobi what exchanges can pay for an ad-slot that support particular sizes, with certain page targeting data
 - wait for the response
 - put information about the winning bid on the DFP slot's targeting data
 - dispatch a request for that advert as per usual

Most of this is done automatically via a Sonobi script (morpheus) that wraps the googletag library.

**Targeting data**

Winner details are added as key-value pairs on the adslot's targeting. Prebid lets us map each key to a function of our
own that takes the auction response JSON and returns some  string value:

 - a Prebid-specific identifier is passed as an `hb_adid` string
 - the winner's name (e.g. AppNexus) is passed under `hb_bidder`
 - the winning value is aliased to a bucket (e.g. $6.33 => '6.00') and passed as `hb_pb`.

## Step 2: DFP executes a competition

DFP doesn't know anything about Sonobi or any of the targeting values we pass. To make them work, Sonobi has created line
items that target them and are configured with inherent price values that Doubleclick _can_ use.

As an example, we might have a line item that:

 - matches when the bid equals "6.00", to represent a bid in the $6.00 to $6.49 bucket;
 - has a native value of $6.50, so that DFP can compare it to other line items and running campaigns;

## Step 3: Displaying the advert

Each line item points to many creatives that have been created by Sonobi, which are 'proxy creatives' that have no content of their own, but only a script tag like
the following:

```
<script type="text/javascript">try{var macros = %%PATTERN:TARGETINGMAP%%;macros.click_url="%%CLICK_URL_ESC_ESC%%";window.top.sbi_km.API.render(window, "%%PATTERN:sbi_kmid%%", macros);} catch(e) {}</script>
```
