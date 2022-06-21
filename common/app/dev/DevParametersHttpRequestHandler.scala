package dev

import play.api.http.{DefaultHttpRequestHandler, HttpConfiguration, HttpErrorHandler, HttpFilters}
import play.api.routing.Router
import play.api.mvc.{Handler, RequestHeader}
import common.CanonicalLink
import model.ApplicationContext
import play.api.Mode.Prod
import play.api.OptionalDevContext
import play.core.WebCommands

class DevParametersHttpRequestHandler(
    optionalDevContext: OptionalDevContext,
    webCommands: WebCommands,
    router: Router,
    errorHandler: HttpErrorHandler,
    configuration: HttpConfiguration,
    filters: HttpFilters,
    context: ApplicationContext,
) extends DefaultHttpRequestHandler(webCommands, optionalDevContext, router, errorHandler, configuration, filters)
    with implicits.Requests {

  /*
    IMPORTANT
    these params are only whitelisted on dev machines, they will not make it through the CDN on www.theguardian.com
    this means that the server side **CANNOT** rely on them. They may be used by Javascript, or simply in the
    development environment
   */
  val insignificantParams = Seq(
    "view",
    "_edition", //allows us to spoof edition in tests
    "c", // used for counts in the Diagnostics server
    "shortUrl", // Used by series component in onwards journeys
    "switchesOn", // turn switches on for non-prod, http requests
    "switchesOff", // turn switches off for non-prod, http requests
    "test", // used for integration tests
    "CMP", // External campaign parameter for Omniture js
    "INTCMP", // Internal campaign parameter for Omniture js
    "oauth_token", // for generating Magento tokens for bookshop service
    "oauth_verifier", // for generating Magento tokens for bookshop service
    "query", // testing the weather locations endpoint
    "rel", // used by browsersync
    "pageSize",
    "projectName",
    "stage",
    "format",
    "amp", // used in dev to request the amp version of a specific url
    "__amp_source_origin", // used by amp-live-list to enforce CORS
    "amp_latest_update_time", // used by amp-live-list to check for latest updates
    "heatmap", // used by ophan javascript to enable the heatmap
    "format", // used to determine whether HTML should be served in email-friendly format or not
    "timestamp", //used to get specific builds for inteactive serviceworkers
    "pbjs_debug", // set to `true` to enable prebid debugging,
    "amzn_debug_mode", // set to `1` to enable A9 debugging
    "force-braze-message", // JSON encoded representation of "extras" data from Braze
    "dcr",
    "topics", // used for filtering the liveblog blocks
  )

  val commercialParams = Seq(
    "ad-unit", // allows overriding of the ad unit
    "adtest", // used to set ad-test cookie from admin domain
    "pbtest", // used to test Prebid adapters in isolation
    "adrefresh", // force adrefresh to be off with adrefresh=false in the URL
    "forceads", // shows ads even if they have been disabled for this content
    "google_console", // two params for dfp console
    "googfc",
    "k", // keywords in commercial component requests
    "s", // section in commercial component requests
    "seg", // user segments in commercial component requests
    "t", // specific item targetting
    "dll", // Disable lazy loading of ads
    "iasdebug", // IAS troubleshooting
    "cmpdebug", // CMP troubleshooting
    "utm_source", // Google Analytics source
    "utm_medium", // Google Analytics medium
    "utm_campaign", // Google Analytics campaign
    "utm_term", // Google Analytics term
    "sfdebug", // enable spacefinder visualiser. '1' = first pass, '2' = second pass
    "rikerdebug", // enable debug logging for Canadian ad setup managed by the Globe and Mail
    "forceSendMetrics", // enable force sending of commercial metrics
  )

  val playBugs = Seq("") // (Play 2.5 bug?) request.queryString is returning an empty string when empty
  val allowedParams = CanonicalLink.significantParams ++ commercialParams ++ insignificantParams ++ playBugs

  override def routeRequest(request: RequestHeader): Option[Handler] = {

    // json requests have no SEO implication but will affect caching
    if (
      context.environment.mode != Prod &&
      !request.isJson &&
      !request.forceDCR &&
      !request.isLazyLoad &&
      !request.uri.startsWith("/oauth2callback") &&
      !request.uri.startsWith("/crosswords/search") &&
      !request.uri.startsWith("/crosswords/lookup") &&
      !request.uri.startsWith(
        "/commercial/anx/anxresize.js",
      ) // this is used by commercial for advert resizing, served through api.nextgen
    ) {
      val illegalParams = request.queryString.keySet.filterNot(allowedParams.contains(_))
      if (illegalParams.nonEmpty) {
        // it is pretty hard to spot what is happening in tests without this println
        println(s"\n\nILLEGAL PARAMETER(S) FOUND : ${illegalParams.mkString(",")}\n\n")
        throw new RuntimeException(s"illegal parameter(s) found ${illegalParams.mkString(",")}")
      }
    }

    super.routeRequest(request)
  }

}
