package controllers

import conf.{AllGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents

import scala.concurrent.ExecutionContext

class HealthCheck(wsClient: WSClient, val controllerComponents: ControllerComponents)(implicit executionContext: ExecutionContext) extends AllGoodCachedHealthCheck(
  NeverExpiresSingleHealthCheck("/lifeandstyle/2015/aug/30/espigoladors-barcelona-catalan-food-funny-shaped-vegetables-people-need")
)(wsClient, executionContext)
