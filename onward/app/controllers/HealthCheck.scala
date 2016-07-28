package controllers

import conf.{AllGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}
import play.api.libs.ws.WSClient

class HealthCheck(override val wsClient: WSClient) extends AllGoodCachedHealthCheck(
  wsClient,
  9011,
  NeverExpiresSingleHealthCheck("/top-stories.json"),
  NeverExpiresSingleHealthCheck("/most-read/society.json")
)
