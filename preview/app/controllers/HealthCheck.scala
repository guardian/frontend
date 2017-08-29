package controllers

import conf.{AllGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents

class HealthCheck(wsClient: WSClient, val controllerComponents: ControllerComponents) extends AllGoodCachedHealthCheck(
  NeverExpiresSingleHealthCheck("/lifeandstyle/2015/aug/30/espigoladors-barcelona-catalan-food-funny-shaped-vegetables-people-need")
)(wsClient)
