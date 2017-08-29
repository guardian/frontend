package commercial.controllers

import conf.{AnyGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents

class HealthCheck(wsClient: WSClient, val controllerComponents: ControllerComponents) extends AnyGoodCachedHealthCheck(
  NeverExpiresSingleHealthCheck("/commercial/travel/api/offers.json"),
  NeverExpiresSingleHealthCheck("/commercial/jobs/api/jobs.json"),
  NeverExpiresSingleHealthCheck("/commercial/books/api/books.json")
)(wsClient)
