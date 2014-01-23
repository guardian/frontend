This document follows http://www.ietf.org/rfc/rfc2119.txt

# Guidance on embeds on NGW

Embeds are third party developed applications (Eg, youtube videos) that are referenced within the `body` field Content API response. 

Embeds are only available within articles.

Embeds can be added to any article via Composer.

All embeds load within an [iframe](https://github.com/guardian/fence) in order sandbox our application from the embed code. This helps avoid clashing
stylesheets, cascading JavaScript errors, co-dependencies being created between the embed and NGW code, libraries etc.

## Basics

Embeds MUST provide an URL over HTTP or code fragment

TODO? - Embeds SHOULD work over HTTPS.  

## Responsive

NextGen web uses [responsive design](http://alistapart.com/article/responsive-web-design/), therefore the embedded content MUST be responsive.

Our definition of responsive is that is responds to, a) viewport dimension, b) available bandwidth (offline, 3g, fibre), c) interaction (eg, fingers, mouse)

Specifically, 

Embeds MUST be usable at 320px viewport and upwards.

Embeds MUST be usable within 3 seconds (TODO - what is fair here?) after the page has rendered on a 3g network. 

The embedded content SHOULD show evidence of being able to respond to the varying network speeds of users accessing our website.

All functionality of the embed MUST be usable on a high-fidelity or low-fidelity touch screen, as well as users with other input devices (keyboards,
mice etc.)

# Multiple embeds 

Many embeds increase the overhead on the page when used more than once. 

Embeds that are added multiple times on a single page MUST NOT degrade the page or application performance. 

# Support

Applications MUST BE monitored and named contact.

Embed code MUST provide its own stats.

# QA

Embeds MUST work, and be approved, on the following device and OS

- TODO - browsers
- TODO - need to discuss with apps about embeds. Ideally we'd support them inside the apps.

