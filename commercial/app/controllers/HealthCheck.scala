package controllers

import conf.{AnyGoodCachedHealthCheck, ExpiringSingleHealthCheck}

object HealthCheck extends AnyGoodCachedHealthCheck(
  9005,
  ExpiringSingleHealthCheck("/commercial/soulmates/mixed.json"),
  ExpiringSingleHealthCheck("/commercial/masterclasses.json"),
  ExpiringSingleHealthCheck("/commercial/travel/offers.json"),
  ExpiringSingleHealthCheck("/commercial/jobs.json"),
  ExpiringSingleHealthCheck("/commercial/money/bestbuys.json"),
  ExpiringSingleHealthCheck("/commercial/books/books.json")
)
