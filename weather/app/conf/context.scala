package conf

import contentapi.SectionsLookUp
import play.api.mvc.{AnyContent, Action}

import scala.concurrent.Future

object HealthCheck extends AllGoodHealthcheckController(
  9020,
  "/weather/city.json",
  "/weather/city/sydney.json"
) {
  override def healthcheck(): Action[AnyContent] = Action.async { request =>
    if (!SectionsLookUp.isLoaded()) {
      Future.successful(InternalServerError("Error with weather API"))
    } else {
      super.healthcheck()(request)
    }
  }
}
