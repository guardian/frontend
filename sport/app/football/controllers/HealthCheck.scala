package football.controllers

import conf.{AllGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents

class HealthCheck(wsClient: WSClient, val controllerComponents: ControllerComponents) extends AllGoodCachedHealthCheck(
  NeverExpiresSingleHealthCheck("/football/live"),
  NeverExpiresSingleHealthCheck("/football/premierleague/results")
)(wsClient)
