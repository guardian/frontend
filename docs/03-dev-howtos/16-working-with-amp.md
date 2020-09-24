# Working with Google AMP

**tl;dr - AMP is important, validate your changes (`make validate-amp`)**

## What is AMP?
AMP (Accelerated Mobile Pages) in Google's own words:
> AMP is a way to build web pages for static content that render fast. AMP in action consists of three different parts:
>
> **AMP HTML** is HTML with some restrictions for reliable performance and some extensions for building rich content beyond basic HTML.
> The **AMP JS** library ensures the fast rendering of AMP HTML pages.
> The **Google AMP Cache** can be used to serve cached AMP HTML pages.

## Why do I care?
At the time of writing, Google is trialling wide roll-outs of AMP blue links in specific regions.  This means that all mobile traffic in these regions coming from Google search results will see AMP versions of our content (if available).  As a result we have to ensure that as much of our content as possible works with AMP.

## Getting started
* Read the [docs](https://www.ampproject.org/docs/reference/components)
* Check out the existing AMP work in frontend (in IntelliJ: `shift` `shift` `amp`)
* Get to know the [tools](#tools)

## <a name="tools"></a>Tools & Hints

### Running AMP
AMP content can be reached in various ways:
* **Production** - `amp.theguardian.com/<path>`
* **Code** - `amp.code.dev-theguardian.com/<path>`
* **Local** - append an `amp` parameter to your query string e.g. `localhost:9000/an-article?amp`
* **Beta** - `beta.amp.theguardian.com/<path>`

### Validation
In order for content to be discoverable (via search) and served in Google's cache (at `cdn.ampproject.org`) it must adhere to specific rules.  You can and should check your content passes validation in the following ways.

* Validate in your browser - Add `#development=1` to your URL, and check the developer console for messages
* [Google validation UI](https://validator.ampproject.org/)
* [Guardian amp validation tool](https://github.com/guardian/frontend/tree/main/tools/amp-validation)
    * 3 ways this tool can be used:
        1. Validate your local changes on a hardcoded set of endpoints - `make validate-amp` - **please see note below!**
        2. Validate `amp.theguardian.com` on the same endpoints - `node ./tools/amp-validation/index.js`
        3. Validate `amp.theguardian.com` on today's top 50 most-read articles (according to Ophan) - `node ./tools/amp-validation/top-traffic.js`

Please note to enable browsersync when styling amp pages we have added this code:

```
@*
 * Please note that the tests will NOT pass validation with this line.
 * It won't affect prod but please comment out this line when running tests in DEV
 *@
@if(context.environment.mode == Dev) {
    @if(page.metadata.isHosted) {
        <link rel="stylesheet" id="head-css" data-reload="head.hosted-amp" type="text/css" href="@Static("stylesheets/head.hosted-amp.css")" />
    } else {
        @if(page.metadata.contentType == "LiveBlog"){
            <link rel="stylesheet" id="head-css" data-reload="head.amp-liveblog" type="text/css" href="@Static("stylesheets/head.amp-liveblog.css")" />
        } else {
            <link rel="stylesheet" id="head-css" data-reload="head.amp" type="text/css" href="@Static("stylesheets/head.amp.css")" />
        }
    }
}
```
in common/app/views/fragments/amp/customStyles.scala.html.

When validating locally please comment out the <link> as this will always fail validation.
This change was made to improve the experience of developing and styling amp pages. If there is a better way please suggest it!

## Ads in Amp

* [Prebid](https://prebid.org/) in Amp uses a Prebid server and is documented in a separate repo [here](https://github.com/guardian/prebid-server/tree/main/amp).
* Ads are served in the `amp-ad` element, which is documented [here](https://www.ampproject.org/docs/ads/introduction_ads).
