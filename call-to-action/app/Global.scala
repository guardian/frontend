import common.Logging
import cta.conf.Configuration
import play.api.{Application, GlobalSettings}
import play.api.mvc.{Handler, RequestHeader}

object Global extends GlobalSettings with Logging {

   override def beforeStart(app: Application) {
     assert(Configuration.ctaHostName.isDefined, "cta-host property not set. Please check the environment specific application property file")
   }

  override def onRouteRequest(req: RequestHeader): Option[Handler] = {
    log.debug("Received request to host:'%s', path:'%s', headers:'%s'".format(req.host, req.path, req.headers.toMap))
    Option(req.host) match {
      case Configuration.ctaHostName => cta.Routes.routes.lift(req)
      case _   =>  super.onRouteRequest(req)
    }
  }
}
