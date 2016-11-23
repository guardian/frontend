package controllers

import conf.{AllGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}
import play.api.libs.ws.WSClient

class HealthCheck(wsClient: WSClient) extends AllGoodCachedHealthCheck(
  NeverExpiresSingleHealthCheck(routes.ReauthenticationController.renderForm(None).url)
)(wsClient)
