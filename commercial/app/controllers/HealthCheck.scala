package controllers

import conf.{AnyGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}
import play.api.libs.ws.WSClient

class HealthCheck(override val wsClient: WSClient) extends AnyGoodCachedHealthCheck(
  wsClient,
  9005,
  NeverExpiresSingleHealthCheck("/commercial/soulmates/mixed.json"),
  NeverExpiresSingleHealthCheck("/commercial/masterclasses.json"),
  NeverExpiresSingleHealthCheck("/commercial/travel/offers.json"),
  NeverExpiresSingleHealthCheck("/commercial/jobs.json"),
  NeverExpiresSingleHealthCheck("/commercial/books/books.json")
)
