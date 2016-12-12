package controllers

import conf.{AllGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}
import play.api.libs.ws.WSClient

class HealthCheck(wsClient: WSClient) extends AllGoodCachedHealthCheck(
  NeverExpiresSingleHealthCheck("/404/www.theguardian.com/Adzip/adzip-fb.html")
)(wsClient)
