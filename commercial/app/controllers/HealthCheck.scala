package commercial.controllers

import conf.{AnyGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents

import scala.concurrent.ExecutionContext

class HealthCheck(wsClient: WSClient, val controllerComponents: ControllerComponents)(implicit
    executionContext: ExecutionContext,
) extends AnyGoodCachedHealthCheck(
      NeverExpiresSingleHealthCheck("/commercial/api/capi-single.json"),
      NeverExpiresSingleHealthCheck("/commercial/api/capi-multiple.json"),
      NeverExpiresSingleHealthCheck("/commercial/non-refreshable-line-items.json"),
    )(wsClient, executionContext)
