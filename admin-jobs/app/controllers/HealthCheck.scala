package controllers

import conf.{AllGoodCachedHealthCheck, NeverExpiresSingleHealthCheck}

class HealthCheck extends AllGoodCachedHealthCheck(
  9015,
  NeverExpiresSingleHealthCheck("/news-alert/alerts")
)
