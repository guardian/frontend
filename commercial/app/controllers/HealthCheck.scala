package commercial.controllers

import conf.{AnyGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents

import scala.concurrent.ExecutionContext

class HealthCheck(wsClient: WSClient, val controllerComponents: ControllerComponents)(implicit
    executionContext: ExecutionContext,
) extends AnyGoodCachedHealthCheck(
      NeverExpiresSingleHealthCheck("/commercial/travel/api/capi-single.json"),
      NeverExpiresSingleHealthCheck("/commercial/jobs/api/capi-multiple.json"),
      NeverExpiresSingleHealthCheck("/commercial/books/api/non-refreshable-line-items.json"),
    )(wsClient, executionContext)
