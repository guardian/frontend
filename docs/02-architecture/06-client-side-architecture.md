## Javascript

### Quick Overview

The JS app can be split into distinct parts:

- Inline blocking JS
- Inline Non-blocking JS
- Analytics
- app.js - curl module loader, the bundle booter and the standard Javascript
- Commercial Javascript
- Enhanced Javascript

And then specific Javascript bootstraps used on different pages and required into the app when needed - Article, Article Minute, Crosswords, Liveblog, Gallery, Trail, Profile, Sudoku, Image content, Facia, Football, Preferences, Membership, Ophan, Admin, Main Media, Video Embed, Accessibility.

### General structure

See below for quick descriptions.

- [- main.scala.html](https://github.com/guardian/frontend/blob/master/common/app/views/main.scala.html)
	- [head.scala.html](https://github.com/guardian/frontend/blob/master/common/app/views/fragments/head.scala.html)
		- [inlineJsBlocking.scala.html](https://github.com/guardian/frontend/blob/master/common/app/views/fragments/inlineJSBlocking.scala.html) - Scripts required to render the page correctly on first paint.
			- Polyfills for json2, es5-html5, RAF, classlist, matches and details
			- Curl config
			- shouldEnhance
			- pageConfig
			- applyRenderConditions
			- loadFonts
			- enable non blocking stylesheets
			- **Load the main app async**
				- app.js
				- commercial.js
				- enhanced/main.js
			- Cloudwatch beacon
    - [inlineJSNonBlocking.scala.html](https://github.com/guardian/frontend/blob/master/common/app/views/fragments/inlineJSNonBlocking.scala.html)
        - getUserData.js
        - detectAdblock
        - showUserName
        - editionaliseMenu
        - ophanConfig
    - [Analytics](https://github.com/guardian/frontend/blob/master/common/app/views/fragments/analytics/base.scala.html)
        - Google
        - Omniture
        - Comscore

### Inline blocking JS

The inline blocking JS is in the head of the document and will block render until it has finished executing. Each of these scripts are required to render the page correctly on first paint.

#### Curl config

Contains the [config](https://github.com/guardian/frontend/blob/master/common/app/templates/inlineJS/blocking/curlConfig.scala.js) for the [curl AMD module loader](https://github.com/cujojs/curl). You can find the aliases for certain JS modules in here such as `fastdom` which helps you avoid having to add the full path for certain modules.

#### shouldEnhance

The [shouldEnhance JS](https://github.com/guardian/frontend/blob/master/common/app/templates/inlineJS/blocking/shouldEnhance.scala.js) defines whether we should run the enhanced Javascript.

There are ways to force enhancement, so take a look at the JS, but something of note is that we don't enhance devices running iOS < 8 on any pages and don't enhance iPads on Fronts.

#### pageConfig

If you put `guardian.config` in your console, you will see the JS config containing information about analytics, modules, switches, tests and the page. This config object is initially populated serverside and topped-up client side (i.e.: information about the user is only available client-side)

The initial config structure is defined in [config.scala.js](https://github.com/guardian/frontend/blob/master/common/app/templates/inlineJS/blocking/config.scala.js) and [javaScriptConfig.scala.js](https://github.com/guardian/frontend/blob/master/common/app/templates/javaScriptConfig.scala.js).

In [config.scala.js](https://github.com/guardian/frontend/blob/master/common/app/templates/inlineJS/blocking/config.scala.js) we also set the `isModernBrowser` flag which is our 'cuts the mustard test' comprising of:

```
 	"querySelector" in document
    && "addEventListener" in window
    && "localStorage" in window
    && "sessionStorage" in window
    && "bind" in Function
    && (("XMLHttpRequest" in window && "withCredentials" in new XMLHttpRequest())|| "XDomainRequest" in window)
```

The commercial JS will only run if `isModernBrowser` is true.

You'll most likely be using the page config the most often which is defined in [JavascriptPage.scala](https://github.com/guardian/frontend/blob/master/common/app/views/support/JavaScriptPage.scala). Be aware that the metadata for a particular page may be [overridden with MetaData.make](https://github.com/guardian/frontend/blob/master/common/app/common/commercial/hosted/HostedGalleryPage.scala#L35).

*Note that if you want to use config in a JS module, you shouldn't use the window object, but include it directly in your module via the [config.js](https://github.com/guardian/frontend/blob/master/static/src/javascripts/projects/common/utils/config.js) utility.*

#### applyRenderConditions

Choose how the browser should render the page before any painting begins. [applyRenderConditions.js](https://github.com/guardian/frontend/blob/master/common/app/templates/inlineJS/blocking/applyRenderConditions.scala.js).

Applies classes to the document based on support including svg, flexbox and replaces `js-off` with `js-on`.

#### loadFonts

Described at the top of the loadFonts.scala.js:

**bypass normal browser font-loading to avoid the FOIT.**

works like this:

do you have fonts in localStorage?

- **yes** – inject them (minimises 2nd layout as fonts are loaded before DOM is created)
- **no**  – did the localStorage check go ok?
	- **yes** – ajax them in as JSON immediately, inject them and save them to localStorage
	- **no**  – load font files async using @@font-face

#### Enable non-blocking stylesheets

A util that borrows heavily from [loadCSS](https://github.com/filamentgroup/loadCSS), it loads CSS async so that non-critical CSS doesn't block rendering.

#### Load the main app async

We polyfill the `async` attribute to prevent parser blocking by creating a script element and inserting it into the page. This is the main app.js which contains standard and enhanced JS.

*Note that in Dev we get curl and require [boot.js](https://github.com/guardian/frontend/blob/master/static/src/javascripts/boot.js) immediately here but on Prod we concatenate curl and boot.js with bootstraps/standard*

*Double Note: in head.scala.html we use a link element with prefetch attr and href set to app.js so that we head off and fetch it as early as possible*

`<link rel="prefetch" href="@Static("javascripts/app.js")">`

#### Cloudwatch beacon

This is where we would ping cloudwatch.. if we had anything to ping about..

### Inline non-blocking JS

#### getUserData

The [getUserData](https://github.com/guardian/frontend/blob/master/common/app/templates/inlineJS/nonBlocking/getUserData.scala.js) util puts the current logged-in user's data in the JS config ready to be used by other JS.

#### detectAdblock

Secrets.

#### showUserName

[Puts the user's username](https://github.com/guardian/frontend/blob/master/common/app/templates/inlineJS/nonBlocking/showUserName.scala.js) into the header (increases perceived rendering speed as their username is there before the app.js has to download and parse).

#### editionaliseMenu

The [editonaliseMenu JS](https://github.com/guardian/frontend/blob/d4bc1349f981cdc8f2508b3f0df61b00420ca219/common/app/templates/inlineJS/nonBlocking/editionaliseMenu.scala.js) updates the menu to show and hide the sub-menus in the current edition.

#### Ophan config

Gets the [Ophan browserId](https://github.com/guardian/frontend/blob/master/common/app/templates/inlineJS/nonBlocking/ophanConfig.scala.js) which is used across analytics to tie data together.

### Analytics

The analytics for Dotcom are defined in [analytics/base.scala.html](https://github.com/guardian/frontend/blob/master/common/app/views/fragments/analytics/base.scala.html). It contains [Google Analytics](https://github.com/guardian/frontend/blob/master/common/app/views/fragments/analytics/google.scala.html), [Omniture](https://github.com/guardian/frontend/blob/master/common/app/views/fragments/analytics/omniture.scala.html) and [Comscore](https://github.com/guardian/frontend/blob/master/common/app/views/fragments/analytics/comscore.scala.html).

[Read more about the Google Analytics implementation](https://github.com/guardian/frontend/blob/master/docs/03-dev-howtos/14-implement-google-analytics.md).

### Bootstraps

In [javascripts/bootstraps](b.com/guardian/frontend/tree/master/static/src/javascripts/bootstraps) we define all the entry points for each bundle described in [requirejs.js](https://github.com/guardian/frontend/blob/master/grunt-configs/requirejs.js).

The top level entry points which call the bootstrap initialisation of all other bundles are [enhanced/main.js](https://github.com/guardian/frontend/blob/master/static/src/javascripts/bootstraps/enhanced/main.js), [standard/main.js](https://github.com/guardian/frontend/blob/master/static/src/javascripts/bootstraps/standard/main.js), [admin.js](https://github.com/guardian/frontend/blob/master/static/src/javascripts/bootstraps/admin.js) (for frontend.gutools, not theguardian.com), [commercial.js](https://github.com/guardian/frontend/blob/master/static/src/javascripts/bootstraps/commercial.js) and [video-embed.js](https://github.com/guardian/frontend/blob/master/static/src/javascripts/bootstraps/video-embed.js) (initialised when there is a video embed from [videoEmbed.scala.html](https://github.com/guardian/frontend/blob/master/applications/app/views/videoEmbed.scala.html)).

### app.js

- [Builds a bundle](https://github.com/guardian/frontend/blob/master/grunt-configs/requirejs.js#L47) for [standard/main bootstrap](https://github.com/guardian/frontend/blob/master/static/src/javascripts/bootstraps/standard/main.js)
	- Includes the [boot.js](https://github.com/guardian/frontend/blob/master/static/src/javascripts/boot.js) in the bundle

```js
boot: {
	options: {
		name: 'boot',
		out: options.staticTargetDir + 'javascripts/boot.js',
		include: 'bootstraps/standard/main',
		insertRequire: ['boot'],
		exclude: [
			'text',
			'inlineSvg'
		]
	}
}
```

- And [concatenates that](https://github.com/guardian/frontend/blob/master/grunt-configs/concat.js#L8) with the [curl-domReady.js](https://github.com/cujojs/curl) (Curl module loader that waits for domReady)

```js
app: {
	src: [
		options.staticSrcDir + 'javascripts/components/curl/curl-domReady.js',
		options.staticTargetDir + 'javascripts/boot.js'
	],
	dest: options.staticTargetDir + 'javascripts/app.js'
}
```


#### Standard main.js

To quote the file:

> This file is intended to be downloaded and run ASAP on all pages by all readers.

> While it's ok to run code from here that requires specific host capabilities, it should manage failing gracefully by itself.

> Assume *nothing* about the host...

> This also means you should think *very hard* before adding modules to it, in particular 3rd party modules.

> For this file, performance and breadth of support should take priority over *anything*…

The [standard main.js](https://github.com/guardian/frontend/blob/master/static/src/javascripts/bootstraps/standard/main.js) does a few core things:

- Sets-up error handling
- Bootstraps interactives immediately as they're content
- Upgrades images
- Adds some event listeners for use elsewhere in the app (throttled scroll)
- Initialises membership and identity
- Initialises the header

#### boot.js

The [boot.js](https://github.com/guardian/frontend/blob/master/static/src/javascripts/boot.js) is the main entry point for the app.

Again, to quote the file:

> This module is responsible for booting the application. It is concatenated with
curl and bootstraps/standard into app.js

> We download the bundles in parallel, but they must be executed
sequentially because each bundle assumes dependencies from the previous
bundle.

> Once a bundle has been executed, all of its modules have been registered.
Now we can safely require one of those modules.

> Unfortunately we can't do all of this using the curl API, so we use a
combination of ajax/eval/curl instead.

> Bundles we need to run: commercial + enhanced

> Only if we detect we should run enhance.

It uses promises to require and init, in blocking order, standard JS, commercial JS and enhanced JS. As mentioned above it is bundled into app.js and the `insertRequire` option is used to insert a require call for it.


### Commercial JS

The commercial JS is its own bundle and is executed immediately after the standard JS.

[Read about the commercial JS](https://github.com/guardian/frontend/blob/master/docs/05-commercial/03-commercial-javascript.md)

### Enhanced JS

The main entry point for enhanced JS is in [bootstraps/enhanced/main.js](https://github.com/guardian/frontend/blob/master/static/src/javascripts/bootstraps/enhanced/main.js)

Here we initialise the rest of our Javascript application, requiring the bundles expected by the current page.

For example, we use the page config property of `isFront` to load `facia.js`:

```js
// Front
if (config.page.isFront) {
	require(['bootstraps/enhanced/facia'], function (facia) {
		bootstrapContext('facia', facia);
	});
}
```

or check if there `isMedia` or a video or audio element exists on the page in order to require the mainMedia JS:

```js
if ((config.isMedia || qwery('video, audio').length) && !config.page.isHosted) {
	require(['bootstraps/enhanced/media/main'], function (media) {
		bootstrapContext('media', media);
	});
}
```

Each bundle is created via the [bundle.js config](https://github.com/guardian/frontend/blob/master/tools/__tasks__/compile/javascript/bundle.js), e.g.:

```js
facia: {
	options: {
		name: 'bootstraps/enhanced/facia',
		out: options.staticTargetDir + 'javascripts/bootstraps/enhanced/facia.js',
		exclude: [
			'boot',
			'bootstraps/standard/main',
			'bootstraps/commercial',
			'bootstraps/enhanced/main',
			'text',
			'inlineSvg'
		]
	}
}
```

and each must return an `init` function that is called from `enhanced.js` once required.

All the enhanced bootstraps are in [bootstraps/enhanced](https://github.com/guardian/frontend/tree/master/static/src/javascripts/bootstraps/enhanced), where you'll be able to see what each bootstrap initialises.

Finally, to tell curl - the module loader - where to fetch a bundle from, when hashed, you will need to add it to the [curlConfig.scala.js](https://github.com/guardian/frontend/blob/master/common/app/templates/inlineJS/blocking/curlConfig.scala.js):

```
'bootstraps/enhanced/facia':         '@Static("javascripts/bootstraps/enhanced/facia.js")'
```

Run `make compile` and add `assets.useHashedBundles=true` to your devOverrides in frontend.conf to test the bundle as it would run on PROD.

### Components

[Here be 3rd-party JS](https://github.com/guardian/frontend/tree/master/static/src/javascripts/components) such as bean, bonzo and fastdom.

### Projects

There are five projects in the Javascript architecture:

- [Admin](https://github.com/guardian/frontend/tree/master/static/src/javascripts/projects/admin) - This is the Javascript for the frontend admin tools gutools (ask your neighbour what these are). It is the only JS file not related to theguardian.com.
- [Commercial](https://github.com/guardian/frontend/tree/master/static/src/javascripts/projects/commercial) - The modules and js views for the commercial Javascript
- [Common](https://github.com/guardian/frontend/tree/master/static/src/javascripts/projects/common) - The largest of the projects, common contains the modules, utilities and js views for much of the application.
	- In modules you will find the Javascript for everything from articles to crosswords, identity to A/B tests.
	- Utils contains the reusable utilities we use across the site for dom querying, fastdom promises, array methods, fetch, inlineSvg, event listeners, localStorage methods etc. Take some to familiarise yourself with these methods as you will likely end up finding what you need here.
	- The Javascript views for the JS loaded content including a/b test experiments, breaking news, share buttons etc.
- [Facia](https://github.com/guardian/frontend/tree/master/static/src/javascripts/projects/facia) - Contains JS modules and views for the weather, snaps and fronts containers
- [Membership](https://github.com/guardian/frontend/tree/master/static/src/javascripts/projects/membership) - Contains the formatters, payment and stripe javascripts

### Vendor

Contains [vendor JS](https://github.com/guardian/frontend/tree/master/static/src/javascripts/vendor) from the likes of forsee, formstack and stripe.
