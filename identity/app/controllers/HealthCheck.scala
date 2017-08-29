package controllers

import conf.{AllGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents

class HealthCheck(wsClient: WSClient, val controllerComponents: ControllerComponents) extends AllGoodCachedHealthCheck(
  NeverExpiresSingleHealthCheck(routes.EmailSignupController.renderForm("footer", 37).url)
)(wsClient)
