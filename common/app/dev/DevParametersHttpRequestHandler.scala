package dev

import play.api.http.{DefaultHttpRequestHandler, HttpConfiguration, HttpErrorHandler, HttpFilters}
import play.api.routing.Router
import play.api.mvc.{Handler, RequestHeader}
import common.CanonicalLink
import model.ApplicationContext
import play.api.Mode.Prod

class DevParametersHttpRequestHandler(
    router: Router,
    errorHandler: HttpErrorHandler,
    configuration: HttpConfiguration,
    filters: HttpFilters,
    context: ApplicationContext
  ) extends DefaultHttpRequestHandler(router, errorHandler, configuration, filters) with implicits.Requests {



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
    "timestamp" //used to get specific builds for inteactive serviceworkers
  )

  val commercialParams = Seq(
    "ad-unit", // allows overriding of the ad unit
    "adtest", // used to set ad-test cookie from admin domain
    "google_console", // two params for dfp console
    "googfc",
    "k", // keywords in commercial component requests
    "s", // section in commercial component requests
    "seg", // user segments in commercial component requests
    "t", // specific item targetting
    "0p19G", // Google AMP AB test parameter
    "dll", // Disable lazy loading of ads
    "iasdebug" // IAS troubleshooting
  )

  val playBugs = Seq("") // (Play 2.5 bug?) request.queryString is returning an empty string when empty
  val allowedParams = CanonicalLink.significantParams ++ commercialParams ++ insignificantParams ++ playBugs

  override def routeRequest(request: RequestHeader): Option[Handler] = {

    // json requests have no SEO implication but will affect caching
    if (
      context.environment.mode != Prod &&
      !request.isJson &&
      !request.uri.startsWith("/oauth2callback") &&
      !request.uri.startsWith("/px.gif")  && // diagnostics box
      !request.uri.startsWith("/tech-feedback") &&
      !request.uri.startsWith("/crosswords/search") &&
      !request.uri.startsWith("/crosswords/lookup") &&
      !request.uri.startsWith("/commercial/anx/anxresize.js") // this is used by commercial for advert resizing, served through api.nextgen
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
