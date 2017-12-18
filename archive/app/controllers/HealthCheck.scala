package controllers

import conf.{AllGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents

import scala.concurrent.ExecutionContext

class HealthCheck(wsClient: WSClient, val controllerComponents: ControllerComponents)(implicit executionContext: ExecutionContext) extends AllGoodCachedHealthCheck(
  NeverExpiresSingleHealthCheck(routes.ArchiveController.lookup("/fashion/rss").url),
  NeverExpiresSingleHealthCheck(routes.ArchiveController.lookup("/fashion/rss").url), //TODO:
  NeverExpiresSingleHealthCheck(routes.ArchiveController.lookup("/fashion/rss").url) //TODO:
)(wsClient, executionContext)
