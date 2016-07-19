package controllers

import conf.{AnyGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}

class HealthCheck extends AnyGoodCachedHealthCheck(
  9005,
  NeverExpiresSingleHealthCheck("/commercial/soulmates/mixed.json"),
  NeverExpiresSingleHealthCheck("/commercial/masterclasses.json"),
  NeverExpiresSingleHealthCheck("/commercial/travel/offers.json"),
  NeverExpiresSingleHealthCheck("/commercial/jobs.json"),
  NeverExpiresSingleHealthCheck("/commercial/books/books.json")
)
