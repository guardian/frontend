package commercial.controllers

import conf.{AnyGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents

import scala.concurrent.ExecutionContext

class HealthCheck(wsClient: WSClient, val controllerComponents: ControllerComponents)(implicit
    executionContext: ExecutionContext,
) extends AnyGoodCachedHealthCheck(
      NeverExpiresSingleHealthCheck("/commercial/travel/api/offers.json"),
      NeverExpiresSingleHealthCheck("/commercial/jobs/api/jobs.json"),
      NeverExpiresSingleHealthCheck("/commercial/books/api/books.json"),
    )(wsClient, executionContext)
