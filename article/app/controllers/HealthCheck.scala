package controllers

import conf.{AllGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents

import scala.concurrent.ExecutionContext

class HealthCheck(
    wsClient: WSClient,
    val controllerComponents: ControllerComponents,
)(implicit executionContext: ExecutionContext)
    extends AllGoodCachedHealthCheck(
      NeverExpiresSingleHealthCheck("/football/2015/jul/23/barcelona-fined-uefa-pro-catalan-banners-champions-league"),
    )(wsClient, executionContext)
