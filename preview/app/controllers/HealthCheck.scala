package controllers

import conf.{AllGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}
import play.api.libs.ws.WSClient

class HealthCheck(wsClient: WSClient) extends AllGoodCachedHealthCheck(
  NeverExpiresSingleHealthCheck("/lifeandstyle/2015/aug/30/espigoladors-barcelona-catalan-food-funny-shaped-vegetables-people-need")
)(wsClient)
