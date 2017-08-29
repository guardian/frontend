package controllers

import conf.{AllGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents

class HealthCheck(wsClient: WSClient, val controllerComponents: ControllerComponents) extends AllGoodCachedHealthCheck(
  NeverExpiresSingleHealthCheck("/top-stories.json"),
  NeverExpiresSingleHealthCheck("/most-read/society.json")
)(wsClient)
