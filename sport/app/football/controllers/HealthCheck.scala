package football.controllers

import conf.{AllGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}
import play.api.libs.ws.WSClient

class HealthCheck(override val wsClient: WSClient) extends AllGoodCachedHealthCheck(
  wsClient,
  9013,
  NeverExpiresSingleHealthCheck("/football/live"),
  NeverExpiresSingleHealthCheck("/football/premierleague/results")
)
