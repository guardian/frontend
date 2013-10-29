package dev

import play.api.{Play, GlobalSettings}
import play.api.mvc.RequestHeader
import Play.isProd

trait DevParametersLifecycle extends GlobalSettings with implicits.Requests {

  /*

    If you are reading this you have probably added a new parameter to the application.
    Before doing this you need to understand the implications this has on caching and SEO.

    This is not to stop you adding parameters, it is here to make you think before doing so.

    Please read and understand the following...

    http://support.google.com/webmasters/bin/answer.py?hl=en&answer=1235687

    Make sure you have done everything necessary before releasing a new parameter.

    Make sure you have discussed what you want to do with the team.

    You might need to modify the CDN to accept your new parameter.

  */

  /*
    IMPORTANT - we strip out other parameters in the CDN - simply adding a parameter here is not enough
  */
  val allowedParams = Seq(

    // these params are whitelisted in the CDN
    "index",
    "page",

    // these params are only whitelisted on dev machines, they will not make it through the CDN
    "view",
    "_edition", //allows us to spoof edition in tests
    "k" // keywords in ad requests
  )

  override def onRouteRequest(request: RequestHeader) = {

    Play.maybeApplication.foreach{ implicit application =>
      // json requests have no SEO implication but will affect caching

      if (!isProd && !request.isJson && !request.uri.startsWith("/openIDCallback")) {
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
