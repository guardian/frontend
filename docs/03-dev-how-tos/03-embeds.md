This document follows http://www.ietf.org/rfc/rfc2119.txt

# Guidance on embeds on NGW

When adding a new embed please use this as a checklist.

Embeds are third party developed applications (Eg, YouTube videos) that
enhance the basic functionality provided by NGW.

Embeds are referenced within the `body` field of a standard Content API
response.

Embeds can be added to any article via Composer.

Embeds are only available within articles in NGW.

All embeds load within an [iframe](https://github.com/guardian/fence) in
order sandbox our application from the embed code. This helps avoid
clashing stylesheets, cascading JavaScript errors, and co-dependencies
being created between the embed and NGW code, libraries etc.

## Basics

Embeds MUST provide a URL or a small (~5 lines) code fragment
to load the embeded application/functionality, Eg.

```
<blockquote class="twitter-tweet"><p>Coast by Opera. Is it just me or is that trailer slightly over-dramatic? <a href="http://t.co/m4YZi5xL8A">http://t.co/m4YZi5xL8A</a></p>&mdash; Sébastien Cevey (@theefer) <a href="https://twitter.com/theefer/statuses/377077814379679746">September 9, 2013</a></blockquote> <script async src="//platform.twitter.com/widgets.js" charset="utf-8"></script>
```

Embeds MUST provide canonical URL for the embedded content that can be linked
to as fallback (Eg, for users with no JavaScript, plug-in support etc.).

Embeds MUST work over HTTPS. In order for them to be available in the
CMS preview and to safeguard any future moves to a secure host (Eg, HTTP
2.x, privacy) 

## Responsive

NextGen web uses [responsive
design](http://alistapart.com/article/responsive-web-design/), therefore
the embedded content MUST be responsive to changes in viewport
dimension, I.e. fit the parent element whatever the size.

Our definition of responsive is that is responds to, a) viewport
dimension, b) available bandwidth (offline, 3g, fibre), c) interaction
(eg, fingers, mouse)

Specifically, 

Embeds MUST be usable at 320px viewport and upwards.

Embeds MUST be usable within 3 seconds on a 3g network after
the page has rendered, or provide some indication of loading progress.

The embedded content SHOULD show evidence of being able to respond to
the varying network speeds of users accessing our website, offline
states etc.

All functionality of the embed MUST be usable on a high-fidelity or
low-fidelity touch screen, as well as users with other input devices
(keyboards, mice etc.)

## Multiple embeds on a single article

Many embeds increase the overhead on the page when used more than once. 

Embeds that are added multiple times on a single page MUST NOT degrade
the page or application performance. 

Embeds that degrade performance MUST provide a controllable lifecycle,
Eg. let the host optionally control init and context.

## Support and QA

Embedded applications MUST be monitored and provide a named contact.

Embeds MUST work on a [good proportion](https://frontend.gutools.co.uk/analytics/browsers) of our mobile and desktop traffic.

Embed code SHOULD provide it's own usage stats.

## Apps 

_TODO_

## See also

- [Fence](https://github.com/guardian/fence) - Utility to render custom code safely in a sandbox.

