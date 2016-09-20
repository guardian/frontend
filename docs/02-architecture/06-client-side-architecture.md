## Javascript

### Quick Overview

The Javascript app is split into 

### General structure

See below for quick descriptions.

- [main.scala.html](https://github.com/guardian/frontend/blob/master/common/app/views/main.scala.html)
	- [head.scala.html](https://github.com/guardian/frontend/blob/master/common/app/views/fragments/head.scala.html)
		- [inlineJsBlocking.scala.html](https://github.com/guardian/frontend/blob/master/common/app/views/fragments/inlineJSBlocking.scala.html) - Scripts required to render the page correctly on first paint.
			- Polyfills for json2, es5-html5, RAF, classlist
			- Curl config
			- shouldEnhance
			- pageConfig
			- applyRenderConditions
			- loadFonts
			- enable non blocking stylesheets
			- Load the main app async
			- Cloudwatch beacon
		- [inlineJSNonBlocking.scala.html](https://github.com/guardian/frontend/blob/master/common/app/views/fragments/inlineJSNonBlocking.scala.html)
			- getUserData.js
			- detectAdblock 😨
			- showUserName
			- ophanConfig
		
### Inline blocking JS 

The inline blocking JS is in the head of the document and will block render until it has finished executing. Each of these scripts are required to render the page correctly on first paint.
		
#### Curl config

Contains the [config](https://github.com/guardian/frontend/blob/master/common/app/templates/inlineJS/blocking/curlConfig.scala.js) for the [curl AMD module loader](https://github.com/cujojs/curl). You can find the aliases for certain JS modules in here such as `fastdom` which helps you avoid having to add the full path for certain modules.

#### shouldEnhance

The [shouldEnhance JS](https://github.com/guardian/frontend/blob/master/common/app/templates/inlineJS/blocking/shouldEnhance.scala.js) defines whether we should run the enhanced Javascript. 

There are ways to force enhancement, so take a look at the JS, but something of note is that we don't enhance devices running iOS < 8 on all pages or on all iPads on Fronts.

#### pageConfig

If you put `guardian.config` in your console, you will see the JS config containing information about analytics, modules, switches, tests and the page. This config object is initally populated serverside and topped-up client side (ie: information about the user is only available client-side)

The initial config structure is defined in [config.scala.js](https://github.com/guardian/frontend/blob/master/common/app/templates/inlineJS/blocking/config.scala.js) and [javaScriptConfig.scala.js](https://github.com/guardian/frontend/blob/master/common/app/templates/javaScriptConfig.scala.js). 

You'll most likely be using the page config the most often which is defined in [JavascriptPage.scala](https://github.com/guardian/frontend/blob/master/common/app/views/support/JavaScriptPage.scala). Be aware that the metadata for a particular page may be [overridden with MetaData.make](https://github.com/guardian/frontend/blob/master/common/app/common/commercial/hosted/HostedGalleryPage.scala#L35).

*Note that if you want to use config in a JS module, you shouldn't use the window object, but include it directly in your module via the config.js utility.*

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

#### Ophan config

Gets the [Ophan browserId](https://github.com/guardian/frontend/blob/master/common/app/templates/inlineJS/nonBlocking/ophanConfig.scala.js) which is used across analytics to tie data together.

## (S)CSS

WIP..

Inline SCSS

	- head.scala.html
		-stylesheets.scala.html
			- @Html(head(project))
			
			
Project refers to one of:

```
private def cssHead(project: String): String =
    project match {
      case "footballSnaps" => "head.footballSnaps"
      case "facia" => "head.facia"
      case "identity" => "head.identity"
      case "football" => "head.football"
      case "index" => "head.index"
      case "rich-links" => "head.rich-links"
      case "email" => "head.email"
      case "commercial" => "head.commercial"
      case "survey" => "head.survey"
      case _ => "head.content"
    }
 ```
 
 
in [assets.scala](https://github.com/guardian/frontend/blob/master/common/app/assets/assets.scala#L105)

		
## Build pipeline

WIP..

### Assets

#### CSS

#### JS

