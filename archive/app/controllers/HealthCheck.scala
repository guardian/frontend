package controllers

import conf.{AllGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}
import play.api.libs.ws.WSClient

class HealthCheck(override val wsClient: WSClient) extends AllGoodCachedHealthCheck(
  wsClient,
  9003,
  NeverExpiresSingleHealthCheck("/404/www.theguardian.com/Adzip/adzip-fb.html"))
