package controllers

import conf.{AllGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}
import play.api.libs.ws.WSClient

class HealthCheck(override val wsClient: WSClient) extends AllGoodCachedHealthCheck(
  wsClient,
  9001,
  NeverExpiresSingleHealthCheck("/login"))
