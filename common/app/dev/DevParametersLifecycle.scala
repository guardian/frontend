package dev

import play.api.{Play, GlobalSettings}
import play.api.mvc.RequestHeader
import Play.isProd
import common.CanonicalLink

trait DevParametersLifecycle extends GlobalSettings with implicits.Requests {



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
    "build", // used by Forsee surveys
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
    "stage"
  )

  val commercialParams = Seq(
    "ad-unit", // allows overriding of the ad unit
    "adtest", // used to set ad-test cookie from admin domain
    "google_console", // two params for dfp console
    "googfc",
    "k", // keywords in commercial component requests
    "s", // section in commercial component requests
    "seg", // user segments in commercial component requests
    "t" // specific item targetting
  )

  val allowedParams = CanonicalLink.significantParams ++ commercialParams ++ insignificantParams

  override def onRouteRequest(request: RequestHeader) = {

    Play.maybeApplication.foreach{ implicit application =>
      // json requests have no SEO implication but will affect caching

      if (
        !isProd &&
        !request.isJson &&
        !request.uri.startsWith("/oauth2callback") &&
        !request.uri.startsWith("/px.gif")  && // diagnostics box
        !request.uri.startsWith("/ab.gif") &&
        !request.uri.startsWith("/js.gif") &&
        !request.uri.startsWith("/tech-feedback") &&
        !request.uri.startsWith("/crosswords/search") &&
        !request.uri.startsWith("/crosswords/lookup")
      ) {
        val illegalParams = request.queryString.keySet.filterNot(allowedParams.contains(_))
        if (illegalParams.nonEmpty) {
          // it is pretty hard to spot what is happening in tests without this println
          println(s"\n\nILLEGAL PARAMETER(S) FOUND : ${illegalParams.mkString(",")}\n\n")
          throw new RuntimeException(s"illegal parameter(s) found ${illegalParams.mkString(",")}")
        }
      }
    }

    super.onRouteRequest(request)
  }

}
