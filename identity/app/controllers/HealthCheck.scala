package controllers

import conf.{AllGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents

import scala.concurrent.ExecutionContext

class HealthCheck(wsClient: WSClient, val controllerComponents: ControllerComponents)(implicit
    executionContext: ExecutionContext,
) extends AllGoodCachedHealthCheck(
      NeverExpiresSingleHealthCheck(routes.EmailSignupController.renderForm("footer", 37).url),
    )(wsClient, executionContext)
