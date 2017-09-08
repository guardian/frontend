package football.controllers

import conf.{AllGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}
import play.api.libs.ws.WSClient

class HealthCheck(wsClient: WSClient) extends AllGoodCachedHealthCheck(
  NeverExpiresSingleHealthCheck("/football/live"),
  NeverExpiresSingleHealthCheck("/football/premierleague/results")
)(wsClient)
