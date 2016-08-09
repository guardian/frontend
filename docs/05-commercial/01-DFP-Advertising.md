# How do DFP adverts work?

* We use the DFP client library (a.k.a. "Googletag") to dispatch all of our ad requests
* When the commercial code starts, we set up page-level targeting, including keywords, audience data and A/B test parameters.
* Adverts are individually registered for whichever sizes they support across each breakpoint
* Every advert is requested using a call to `googletag.display()`
* A GET request to `https://securepubads.g.doubleclick.net` is made for a creative to render, with the page targeting added as URI parameters
* DFP uses these parameters to choose between various candidate 'line items' - representing orders from advertisers. It might choose one line item because it has a high price. It might choose another because we've promised to serve so many impressions of it, and it's running behind. This logic is configured by the AdOps team on a campaign-by-campaign basis.
* DFP returns the creative to display.

## Header bidding
Header bidding (currently US-only) works along similar lines to the typical DFP flow, but with an extra step before we make the request to DFP:

* We load a header bidding library (Prebid.js) to help us auction our adverts
* For every advert, we make a request to every bidder (and possibly a request for every size), asking what they're prepared to pay for that particular slot
* Prebid.js determines the highest value response, and adds that information to the adslot via ad-level targeting
* When we make the request to DFP, it can read that information and act upon it
* Line items are set up in DFP to match particular header bidding price points and bidders. DFP can use the value data on these to see if the winning bid has higher value than other running campaigns. (DFP isn't smart enough to simply read the winning bid price on the advert, sadly)
* If the winning bid has a higher value than any existing campaign, DFP sends back a 'dummy creative' that contains nothing more than a `<script>` tag telling the browser to render whichever advert won the auction.
* The browser requests the creative and renders it itself.

![Header bidding workflow diagram](https://cloud.githubusercontent.com/assets/3148617/13568947/e35ab8cc-e45c-11e5-89a0-6413312e30e0.png)

### Responsive adverts
Responsive ads are implemented as 'breakout scripts'. These use DFP-side templates that wrap a blob of JSON in a script tag with a class 'breakout__script', telling the client-side script to parse the JSON and instantiate a creative with its data.

Each creative has its own constructor, comprising a viewmodel and template, and a `create` method that takes responsibility for rendering the advert. Because this code runs as a first-class citizen of the page, it has access to the full gamut of frontend dependencies.

