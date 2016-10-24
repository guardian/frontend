package controllers

import conf.{AllGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, AnyContent}
import services.ConfigAgent
import scala.concurrent.Future

class HealthCheck(wsClient: WSClient) extends AllGoodCachedHealthCheck(
  NeverExpiresSingleHealthCheck("/uk/business")
)(wsClient) {

  override def healthCheck(): Action[AnyContent] = Action.async { request =>
    if (!ConfigAgent.isLoaded()) {
      Future.successful(InternalServerError("Facia config has not been loaded yet"))
    } else {
      super.healthCheck()(request)
    }
  }
}
