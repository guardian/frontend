package controllers

import conf.{AllGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}
import play.api.libs.ws.WSClient

class HealthCheck(override val wsClient: WSClient) extends AllGoodCachedHealthCheck(
  wsClient,
  9004,
  NeverExpiresSingleHealthCheck("/world/2012/sep/11/barcelona-march-catalan-independence")
)
