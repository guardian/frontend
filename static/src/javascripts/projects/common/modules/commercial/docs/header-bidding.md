#Header bidding

_This document assumes you're already familiar with how DFP advertising operates. If you aren't, take a look at Google's [DFP publisher university](http://g.co/PublisherU)._

Normally, when we request an advert from DFP, Google compares different line items with different values, finds the most lucrative, and sends back its creative. This is how most publishers use DFP,
and it works very well indeed - as long as your advertisers are all part of the DFP ecosystem.

What happens, though, if they aren't? _Header bidding_ allows the _browser_ to run an auction on an adslot before making a request to Google. DFP compares the value of the auction's winning bid to
its own inventory, and can choose to either send back a creative that displays the auction's winning ad, or - if it can trump the bid - a creative of its own.

This document will explain how the browser performs auctions, how DFP responds to them, and how the adverts are displayed.
