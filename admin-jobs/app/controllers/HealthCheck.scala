package controllers

import conf.AllGoodCachedHealthCheck

object HealthCheck extends AllGoodCachedHealthCheck(
  9015,
  "/news-alert/alerts"
)
