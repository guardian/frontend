package controllers

import conf.{AllGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}
import play.api.libs.ws.WSClient
import play.api.mvc.{Action, AnyContent}
import services.ConfigAgent

import scala.concurrent.Future

class HealthCheck(override val wsClient: WSClient) extends AllGoodCachedHealthCheck(
  wsClient,
  9008,
  NeverExpiresSingleHealthCheck("/uk/business")) {

  override def healthCheck(): Action[AnyContent] = Action.async { request =>
    if (!ConfigAgent.isLoaded()) {
      Future.successful(InternalServerError("Facia config has not been loaded yet"))
    } else {
      super.healthCheck()(request)
    }
  }
}
