# Browser support principles

We believe that our journalism should be accessible to everyone.

[theguardian.com](http://www.theguardian.com/?view=mobile) uses [responsive design](http://alistapart.com/article/responsive-web-design) to help us achieve this.

This means every feature of the website needs to consider how it adapts itself to each user's environment.

## Responsive design

Practically speaking this means thinking about handful of design factors when designing and building the frontend.

For example,

Viewport dimension (the width and height of the device), resolution and pixel density.

- What does your feature do when the device is only 3 inches wide?
- What happens to the feature when it is 1024px with a 2x pixel density?
- What happens when the user rotates their device?

Bandwidth

- What happens when the user is travelling to work on a 3g connection?
- How does that change when they on the sofa and on a optical fibre network?
- What happens when they are offline or the signal is intermittent?

Interaction type 

- How does the user interface adapt to be used for fingers?
- And what about when the user is using a conventional mouse?

HTML5 support

- What is the core experience for all users?
- And what do we enhance when we detect the user has a modern web browser with extra capabilities (Eg, web fonts, geolocation etc.) 

In many ways responsive design is just usability, accessibility, and progressive enhancement rephrased. 

## Cutting the mustard

_[Cutting the mustard](http://responsivenews.co.uk/post/18948466399/cutting-the-mustard)_ describes a technique that divides
web browsers in to two groups - 'modern' and 'core'.

We do this by evaluating the client's capability, like so :-

```
var isModern = function() { 
     return ('querySelector' in document && 'addEventListener' in window && 'localStorage' in window && 'sessionStorage' in window)
})
```

The _core_ experience is designed to work on everything, whereas the _modern_ experience is progressively enhanced with JavaScript.

We only serve JavaScript to browsers that cut the mustard.

For browsers that fail that test, we still expect the content to render, but they will not get enhancements.

This ensures a graceful experience when viewing with a less capable device, or simply when, for whatever reason, the JavaScript fails we can
turn our [escalator into stairs](http://jakearchibald.com/2013/progressive-enhancement-still-important).

Take a look at these screenshots for comparison:- 

- [IE 8](/docs/images/ie8_basic.png) - basic version as visible in IE8.
- [Chrome 28](/docs/images/chrome_full.png) - full JS version as seen in Chrome.

### Browser support table

Based on these principles and usage stats we have produced a [browser usage table](https://frontend.gutools.co.uk/analytics/browsers).

Here are the browsers and devices we currently regularly test on:-

### Desktop

-  IE 10
-  IE 9
-  Firefox (latest stable)
-  Chrome (latest stable)
-  Safari 5+

### Mobile / Tablet

-  Safari iOS 4.3+
-  Android 4.0+
-  Chrome Android
-  Blackberry 7+
-  Windows IE 9+

## Internet Explorer 8

The share of traffic from IE8 is around 5%.

We will serve a specific style sheet and Javascript to offer some enhanced functionality (Eg. stylesheets, adverts) whilst it continues to have significant usage.
