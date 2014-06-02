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
    "k", // keywords in commercial component requests
    "s", // section in commercial component requests
    "seg", // user segments in commercial component requests
    "build", // used by Forsee surveys
    "google_console", // two params for dfp console
    "googfc",
    "shortUrl", // Used by series component in onwards journeys
    "t" // specific item targetting
  )

  val allowedParams = CanonicalLink.significantParams ++ insignificantParams

  override def onRouteRequest(request: RequestHeader) = {

    Play.maybeApplication.foreach{ implicit application =>
      // json requests have no SEO implication but will affect caching

      if (
        !isProd &&
        !request.isJson &&
        !request.uri.startsWith("/openIDCallback") &&
        !request.uri.startsWith("/px.gif")  && // diagnostics box
        !request.uri.startsWith("/ab.gif") &&
        !request.uri.startsWith("/js.gif")
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
