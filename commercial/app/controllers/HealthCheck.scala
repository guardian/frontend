package commercial.controllers

import conf.{AnyGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}
import play.api.libs.ws.WSClient

class HealthCheck(wsClient: WSClient) extends AnyGoodCachedHealthCheck(
  NeverExpiresSingleHealthCheck("/commercial/masterclasses.json"),
  NeverExpiresSingleHealthCheck("/commercial/travel/offers.json"),
  NeverExpiresSingleHealthCheck("/commercial/jobs.json"),
  NeverExpiresSingleHealthCheck("/commercial/books/books.json")
)(wsClient)
