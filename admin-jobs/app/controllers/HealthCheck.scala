package controllers

import conf.{AllGoodCachedHealthCheck, ExpiringSingleHealthCheck}

class HealthCheck extends AllGoodCachedHealthCheck(
  9015,
  ExpiringSingleHealthCheck("/news-alert/alerts")
)
