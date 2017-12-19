package controllers

import conf.{AllGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}
import play.api.libs.ws.WSClient
import play.api.mvc.ControllerComponents

import scala.concurrent.ExecutionContext

class HealthCheck(wsClient: WSClient, val controllerComponents: ControllerComponents)(implicit executionContext: ExecutionContext) extends AllGoodCachedHealthCheck(
  NeverExpiresSingleHealthCheck("/books/harrypotter/rss"),
  NeverExpiresSingleHealthCheck("/technology/computing"),
  NeverExpiresSingleHealthCheck("/uk/wales+uk/northernireland"),
  NeverExpiresSingleHealthCheck("/technology/computing/2016/jan/04/all")
)(wsClient, executionContext)
